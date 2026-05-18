import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Inject, Logger, UseInterceptors } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Namespace, Socket } from 'socket.io'
import { WsLoggingInterceptor } from '@presentation/interceptors/ws-logging.interceptor'
import { GameAction } from '@domain/entities/pokemon-card.entity'
import { GameSession } from '@domain/entities/game-session.entity'
import { I_POKEMON_GAME_ROOM_REPOSITORY, IPokemonGameRoomRepository } from '@domain/repositories/i-pokemon-game-room.repository'
import { GameEngineService } from '@domain/services/game-engine.service'
import { CreateGameRoomUseCase } from '@application/use-cases/pokemon-card/create-game-room.use-case'
import { JoinGameRoomUseCase } from '@application/use-cases/pokemon-card/join-game-room.use-case'
import { MatchmakeGameUseCase } from '@application/use-cases/pokemon-card/matchmake-game.use-case'
import { ProcessGameActionUseCase, buildPerspective } from '@application/use-cases/pokemon-card/process-game-action.use-case'

interface QueueEntry {
  sessionId: string
  socketId: string
  deckId: string
}

@UseInterceptors(WsLoggingInterceptor)
@WebSocketGateway({ namespace: '/pokemon-card', cors: { origin: '*' } })
export class PokemonCardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace

  private readonly logger = new Logger(PokemonCardGateway.name)
  private readonly matchmakingQueue: QueueEntry[] = []
  private readonly turnTimers = new Map<string, NodeJS.Timeout>()
  private readonly warningTimers = new Map<string, NodeJS.Timeout>()
  private readonly reconnectTimers = new Map<string, NodeJS.Timeout>()

  constructor(
    private readonly createRoomUC: CreateGameRoomUseCase,
    private readonly joinRoomUC: JoinGameRoomUseCase,
    private readonly matchmakeUC: MatchmakeGameUseCase,
    private readonly processActionUC: ProcessGameActionUseCase,
    private readonly engine: GameEngineService,
    @Inject(I_POKEMON_GAME_ROOM_REPOSITORY) private readonly roomRepo: IPokemonGameRoomRepository,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(`connect id=${client.id}`)
  }

  // ─── Queue ────────────────────────────────────────────────────────────────

  @SubscribeMessage('join_queue')
  handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; deckId: string },
  ): void {
    if (this.matchmakingQueue.some(p => p.sessionId === payload.sessionId)) return
    this.matchmakingQueue.push({ sessionId: payload.sessionId, socketId: client.id, deckId: payload.deckId })
    client.emit('queue_joined', { position: this.matchmakingQueue.length })
    this.logger.log(`join_queue sessionId=${payload.sessionId} queueSize=${this.matchmakingQueue.length}`)
    void this.tryMatch()
  }

  @SubscribeMessage('leave_queue')
  handleLeaveQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string },
  ): void {
    const idx = this.matchmakingQueue.findIndex(p => p.sessionId === payload.sessionId)
    if (idx !== -1) {
      this.matchmakingQueue.splice(idx, 1)
      this.logger.log(`leave_queue sessionId=${payload.sessionId} queueSize=${this.matchmakingQueue.length}`)
    }
  }

  // ─── Private Room ─────────────────────────────────────────────────────────

  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string; deckId: string },
  ): Promise<void> {
    try {
      const room = await this.createRoomUC.execute({
        sessionId: payload.sessionId,
        socketId: client.id,
        deckId: payload.deckId,
      })
      await client.join(room.roomCode)
      client.emit('room_created', { roomCode: room.roomCode })
      this.logger.log(`create_room roomCode=${room.roomCode} sessionId=${payload.sessionId}`)
    } catch (err) {
      client.emit('error', { code: 'CREATE_FAILED', message: (err as Error).message })
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string; deckId: string },
  ): Promise<void> {
    try {
      const { room, isReconnect, gameStarted } = await this.joinRoomUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
        deckId: payload.deckId,
      })
      await client.join(room.roomCode)

      if (isReconnect) {
        clearTimeout(this.reconnectTimers.get(room.roomCode))
        this.reconnectTimers.delete(room.roomCode)
        client.to(room.roomCode).emit('player_reconnected', {})

        if (room.gameState) {
          const pIdx = room.players.findIndex(p => p.sessionId === payload.sessionId) as 0 | 1
          client.emit('game_state_updated', buildPerspective(room.gameState, pIdx))
        }
        this.logger.log(`join_room reconnect roomCode=${payload.roomCode} sessionId=${payload.sessionId}`)
        return
      }

      this.server.to(room.roomCode).emit('player_joined', { playerCount: room.players.length })
      this.logger.log(`join_room roomCode=${payload.roomCode} sessionId=${payload.sessionId} gameStarted=${gameStarted}`)

      if (gameStarted && room.gameState) {
        this.emitGameStart(room.roomCode, room.players[0].socketId, room.players[1].socketId, room.gameState)
      }
    } catch (err) {
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  @SubscribeMessage('rejoin_game')
  async handleRejoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string },
  ): Promise<void> {
    try {
      const room = await this.roomRepo.findByCode(payload.roomCode)
      if (!room || !room.gameState) {
        client.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Game session not found.' })
        return
      }
      const pIdxRaw = room.players.findIndex(p => p.sessionId === payload.sessionId)
      if (pIdxRaw === -1) {
        client.emit('error', { code: 'NOT_IN_ROOM', message: 'You are not in this game.' })
        return
      }
      const pIdx = pIdxRaw as 0 | 1
      await client.join(room.roomCode)
      client.emit('game_state_updated', buildPerspective(room.gameState, pIdx))
    } catch (err) {
      client.emit('error', { code: 'REJOIN_FAILED', message: (err as Error).message })
    }
  }

  // ─── Game Action ──────────────────────────────────────────────────────────

  @SubscribeMessage('game_action')
  async handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string; action: GameAction },
  ): Promise<void> {
    try {
      const { result, error } = await this.processActionUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        action: payload.action,
      })

      if (error) {
        client.emit('action_invalid', { reason: error })
        this.logger.warn(`game_action invalid roomCode=${payload.roomCode} reason=${error}`)
        return
      }

      if (!result) return

      this.clearTurnTimer(payload.roomCode)

      const p0Socket = this.server.sockets.get(result.p0SocketId)
      const p1Socket = this.server.sockets.get(result.p1SocketId)
      p0Socket?.emit('game_state_updated', result.p0Perspective)
      p1Socket?.emit('game_state_updated', result.p1Perspective)

      this.logger.log(`game_action ok roomCode=${payload.roomCode} phase=${result.p0Perspective.phase}`)

      if (result.isGameOver) {
        this.server.to(payload.roomCode).emit('game_over', {
          winner: result.p0Perspective.winner,
          reason: result.p0Perspective.winReason,
        })
        return
      }

      // don't start timer during waiting-promote — no active turn player
      if (result.p0Perspective.phase !== 'waiting-promote') {
        this.startTurnTimer(payload.roomCode)
      }
    } catch (err) {
      client.emit('error', { code: 'ACTION_FAILED', message: (err as Error).message })
    }
  }

  // ─── Disconnect ───────────────────────────────────────────────────────────

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`disconnect id=${client.id}`)

    const queueIdx = this.matchmakingQueue.findIndex(p => p.socketId === client.id)
    if (queueIdx !== -1) this.matchmakingQueue.splice(queueIdx, 1)

    try {
      const room = await this.roomRepo.findBySocketId(client.id)
      if (!room || room.phase === 'gameover' || room.phase === 'lobby') return

      const pIdx = room.players.findIndex(p => p.socketId === client.id)
      if (pIdx === -1) return

      room.players[pIdx].connected = false
      await this.roomRepo.save(room)

      const remaining = room.players.find((_, i) => i !== pIdx)
      if (remaining) {
        this.server.sockets.get(remaining.socketId)?.emit('player_disconnected', { reconnectWindowSecs: 30 })
      }

      clearTimeout(this.reconnectTimers.get(room.roomCode))
      const timer = setTimeout(
        () => void this.handleReconnectTimeout(room.roomCode, client.id),
        30_000,
      )
      this.reconnectTimers.set(room.roomCode, timer)
      this.logger.log(`disconnect reconnect timer set roomCode=${room.roomCode}`)
    } catch (err) {
      this.logger.error(`disconnect error id=${client.id} err=${(err as Error).message}`)
    }
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  @Cron('* * * * *')
  async evictExpiredRooms(): Promise<void> {
    const count = await this.roomRepo.deleteExpired()
    if (count > 0) this.logger.log(`evictExpiredRooms count=${count}`)
  }

  // ─── Turn Timer ───────────────────────────────────────────────────────────

  private startTurnTimer(roomCode: string): void {
    this.clearTurnTimer(roomCode)

    const warn = setTimeout(() => {
      this.server.to(roomCode).emit('turn_timeout_warning', { secsLeft: 10 })
    }, 50_000)

    const end = setTimeout(() => void this.handleTurnTimeout(roomCode), 60_000)

    this.warningTimers.set(roomCode, warn)
    this.turnTimers.set(roomCode, end)
  }

  private clearTurnTimer(roomCode: string): void {
    clearTimeout(this.turnTimers.get(roomCode))
    clearTimeout(this.warningTimers.get(roomCode))
    this.turnTimers.delete(roomCode)
    this.warningTimers.delete(roomCode)
  }

  private async handleTurnTimeout(roomCode: string): Promise<void> {
    this.logger.warn(`handleTurnTimeout fired roomCode=${roomCode}`)
    try {
      const room = await this.roomRepo.findByCode(roomCode)
      if (!room || !room.gameState || room.phase !== 'playing') return

      const currentIdx = room.gameState.currentPlayerIndex
      const { result, error } = await this.processActionUC.execute({
        roomCode,
        sessionId: room.players[currentIdx].sessionId,
        action: { type: 'END_TURN' },
      })

      if (error || !result) return

      const p0Socket = this.server.sockets.get(result.p0SocketId)
      const p1Socket = this.server.sockets.get(result.p1SocketId)
      p0Socket?.emit('game_state_updated', result.p0Perspective)
      p1Socket?.emit('game_state_updated', result.p1Perspective)

      if (result.isGameOver) {
        this.server.to(roomCode).emit('game_over', {
          winner: result.p0Perspective.winner,
          reason: result.p0Perspective.winReason,
        })
      } else {
        this.startTurnTimer(roomCode)
      }
    } catch (err) {
      this.logger.error(`handleTurnTimeout error roomCode=${roomCode} err=${(err as Error).message}`)
    }
  }

  // ─── Reconnect Timeout ────────────────────────────────────────────────────

  private async handleReconnectTimeout(roomCode: string, disconnectedSocketId: string): Promise<void> {
    this.reconnectTimers.delete(roomCode)
    this.logger.warn(`handleReconnectTimeout fired roomCode=${roomCode}`)
    try {
      const room = await this.roomRepo.findByCode(roomCode)
      if (!room || room.phase === 'gameover') return

      const disconnected = room.players.find(p => p.socketId === disconnectedSocketId)
      if (!disconnected || disconnected.connected) return

      const winner = room.players.find(p => p.socketId !== disconnectedSocketId)
      if (!winner) return

      room.phase = 'gameover'
      room.expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      await this.roomRepo.save(room)

      this.clearTurnTimer(roomCode)
      this.server.sockets.get(winner.socketId)?.emit('game_over', {
        winner: room.players.indexOf(winner),
        reason: 'Opponent disconnected.',
      })
      this.logger.log(`handleReconnectTimeout forfeit roomCode=${roomCode} winner=${winner.sessionId}`)
    } catch (err) {
      this.logger.error(`handleReconnectTimeout error roomCode=${roomCode} err=${(err as Error).message}`)
    }
  }

  // ─── Matchmaking ──────────────────────────────────────────────────────────

  private async tryMatch(): Promise<void> {
    if (this.matchmakingQueue.length < 2) return

    const [p1, p2] = this.matchmakingQueue.splice(0, 2)
    this.logger.log(`tryMatch p1=${p1.sessionId} p2=${p2.sessionId}`)

    try {
      const room = await this.matchmakeUC.execute({
        p1SessionId: p1.sessionId,
        p1SocketId: p1.socketId,
        p1DeckId: p1.deckId,
        p2SessionId: p2.sessionId,
        p2SocketId: p2.socketId,
        p2DeckId: p2.deckId,
      })

      const p1Socket = this.server.sockets.get(p1.socketId)
      const p2Socket = this.server.sockets.get(p2.socketId)

      await p1Socket?.join(room.roomCode)
      await p2Socket?.join(room.roomCode)

      p1Socket?.emit('match_found', { roomCode: room.roomCode })
      p2Socket?.emit('match_found', { roomCode: room.roomCode })

      if (room.gameState) {
        this.emitGameStart(room.roomCode, p1.socketId, p2.socketId, room.gameState)
      }

      this.logger.log(`tryMatch matched roomCode=${room.roomCode}`)
    } catch (err) {
      this.logger.error(`tryMatch failed err=${(err as Error).message}`)
      this.server.sockets.get(p1.socketId)?.emit('error', { code: 'MATCH_FAILED', message: 'Matchmaking failed.' })
      this.server.sockets.get(p2.socketId)?.emit('error', { code: 'MATCH_FAILED', message: 'Matchmaking failed.' })
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private emitGameStart(
    roomCode: string,
    p0SocketId: string,
    p1SocketId: string,
    gameState: GameSession,
  ): void {
    this.server.sockets.get(p0SocketId)?.emit('game_start', buildPerspective(gameState, 0))
    this.server.sockets.get(p1SocketId)?.emit('game_start', buildPerspective(gameState, 1))
    this.startTurnTimer(roomCode)
    this.logger.log(`game_start emitted roomCode=${roomCode}`)
  }
}
