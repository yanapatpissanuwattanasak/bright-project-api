import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Inject } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { Namespace, Socket } from 'socket.io'
import { I_RPS_ROOM_REPOSITORY, IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { Choice } from '@domain/entities/rps-room.entity'
import { CreateRoomUseCase } from '@application/use-cases/rps/create-room.use-case'
import { JoinRoomUseCase } from '@application/use-cases/rps/join-room.use-case'
import { SelectHeroUseCase } from '@application/use-cases/rps/select-hero.use-case'
import { SubmitChoiceUseCase } from '@application/use-cases/rps/submit-choice.use-case'

function losingChoice(winner: Choice): Choice {
  if (winner === 'rock') return 'scissors'
  if (winner === 'paper') return 'rock'
  return 'paper'
}

@WebSocketGateway({ namespace: '/rps', cors: { origin: process.env.RPS_WS_CORS_ORIGIN ?? '*' } })
export class RpsGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Namespace

  private readonly roundTimers = new Map<string, NodeJS.Timeout>()
  private readonly reconnectTimers = new Map<string, NodeJS.Timeout>()

  constructor(
    private readonly createRoomUC: CreateRoomUseCase,
    private readonly joinRoomUC: JoinRoomUseCase,
    private readonly selectHeroUC: SelectHeroUseCase,
    private readonly submitChoiceUC: SubmitChoiceUseCase,
    @Inject(I_RPS_ROOM_REPOSITORY) private readonly roomRepo: IRpsRoomRepository,
  ) {}

  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string },
  ): Promise<void> {
    try {
      const room = await this.createRoomUC.execute({
        sessionId: payload.sessionId,
        socketId: client.id,
      })
      await client.join(room.roomCode)
      client.emit('room_created', { roomCode: room.roomCode })
    } catch (err) {
      client.emit('error', { code: 'CREATE_FAILED', message: (err as Error).message })
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string },
  ): Promise<void> {
    try {
      const { room, isReconnect } = await this.joinRoomUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
      })

      await client.join(room.roomCode)

      if (isReconnect) {
        clearTimeout(this.reconnectTimers.get(room.roomCode))
        this.reconnectTimers.delete(room.roomCode)

        const self = room.players.find(p => p.sessionId === payload.sessionId)!
        const opponent = room.players.find(p => p.sessionId !== payload.sessionId)!

        client.emit('player_reconnected', {
          phase: room.phase,
          playerHp: self.hp,
          opponentHp: opponent.hp,
          opponentHero: opponent.heroId,
        })
        client.to(room.roomCode).emit('player_reconnected', {})
      } else {
        this.server.to(room.roomCode).emit('player_joined', {
          sessionId: payload.sessionId,
          roomCode: room.roomCode,
        })
      }
    } catch (err) {
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  @SubscribeMessage('select_hero')
  async handleSelectHero(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string; heroId: string },
  ): Promise<void> {
    try {
      const { room, allReady, playerIndex } = await this.selectHeroUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
        heroId: payload.heroId,
      })

      client.emit('hero_selected', { player: 'self', heroId: payload.heroId })
      client.to(room.roomCode).emit('hero_selected', { player: 'opponent', heroId: payload.heroId })

      if (allReady) {
        const p0 = room.players[0]
        const p1 = room.players[1]

        const emitBattleStart = (socketId: string, idx: number) => {
          const self = room.players[idx]
          const opp = room.players[idx === 0 ? 1 : 0]
          this.server.sockets.get(socketId)?.emit('battle_start', {
            playerHero: self.heroId,
            opponentHero: opp.heroId,
            playerHp: self.hp,
            opponentHp: opp.hp,
          })
        }

        emitBattleStart(p0.socketId, 0)
        emitBattleStart(p1.socketId, 1)

        this.startRoundTimer(room.roomCode)
      }
    } catch (err) {
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  @SubscribeMessage('submit_choice')
  async handleSubmitChoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string; choice: Choice },
  ): Promise<void> {
    try {
      const result = await this.submitChoiceUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
        choice: payload.choice,
      })

      if (!result.resolved) {
        client.emit('waiting_for_opponent', {})
        return
      }

      clearTimeout(this.roundTimers.get(payload.roomCode))
      this.roundTimers.delete(payload.roomCode)

      this.emitRoundResult(result)

      if (result.gameOver) {
        this.server.to(payload.roomCode).emit('game_over', { winner: result.winnerId })
      } else {
        this.startRoundTimer(payload.roomCode)
      }
    } catch (err) {
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    try {
      const room = await this.roomRepo.findBySocketId(client.id)
      if (!room || room.phase === 'gameover' || room.phase === 'lobby') return

      const playerIdx = room.players.findIndex(p => p.socketId === client.id)
      if (playerIdx === -1) return

      room.players[playerIdx].connected = false
      await this.roomRepo.save(room)

      const remaining = room.players.find((_, i) => i !== playerIdx)
      if (remaining) {
        this.server.sockets
          .get(remaining.socketId)
          ?.emit('player_disconnected', { reconnectWindowSecs: 15 })
      }

      clearTimeout(this.reconnectTimers.get(room.roomCode))
      const timer = setTimeout(
        () => this.handleReconnectTimeout(room.roomCode, client.id),
        15_000,
      )
      this.reconnectTimers.set(room.roomCode, timer)
    } catch {
      // ignore disconnect errors
    }
  }

  @Cron('* * * * *')
  async evictExpiredRooms(): Promise<void> {
    const count = await this.roomRepo.deleteExpired()
    if (count > 0) console.log(`RPS: evicted ${count} expired room(s)`)
  }

  private startRoundTimer(roomCode: string): void {
    clearTimeout(this.roundTimers.get(roomCode))
    const timer = setTimeout(() => this.handleRoundTimeout(roomCode), 30_000)
    this.roundTimers.set(roomCode, timer)
  }

  private async handleRoundTimeout(roomCode: string): Promise<void> {
    this.roundTimers.delete(roomCode)
    try {
      const room = await this.roomRepo.findByCode(roomCode)
      if (!room || room.phase !== 'battle' || room.players.length < 2) return

      const p0 = room.players[0]
      const p1 = room.players[1]

      let p0Choice = p0.choice ?? null
      let p1Choice = p1.choice ?? null

      if (p0Choice === null && p1Choice !== null) {
        p0Choice = losingChoice(p1Choice)
      } else if (p1Choice === null && p0Choice !== null) {
        p1Choice = losingChoice(p0Choice)
      } else if (p0Choice === null && p1Choice === null) {
        p0Choice = 'rock'
        p1Choice = 'rock'
      } else {
        return
      }

      const result = await this.submitChoiceUC.resolveWithChoices(roomCode, p0Choice, p1Choice)
      if (!result.resolved) return

      this.emitRoundResult(result)

      if (result.gameOver) {
        this.server.to(roomCode).emit('game_over', { winner: result.winnerId })
      } else {
        this.startRoundTimer(roomCode)
      }
    } catch {
      // ignore timeout errors
    }
  }

  private async handleReconnectTimeout(roomCode: string, disconnectedSocketId: string): Promise<void> {
    this.reconnectTimers.delete(roomCode)
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

      this.server.sockets
        .get(winner.socketId)
        ?.emit('game_over', { winner: winner.sessionId })
    } catch {
      // ignore timeout errors
    }
  }

  private emitRoundResult(
    result: Extract<
      Awaited<ReturnType<SubmitChoiceUseCase['resolveWithChoices']>>,
      { resolved: true }
    >,
  ): void {
    const perspectives = [
      { socketId: result.p0SocketId, myChoice: result.p0Choice, oppChoice: result.p1Choice, myHp: result.p0Hp, oppHp: result.p1Hp, win: result.outcome === 'p0wins' },
      { socketId: result.p1SocketId, myChoice: result.p1Choice, oppChoice: result.p0Choice, myHp: result.p1Hp, oppHp: result.p0Hp, win: result.outcome === 'p1wins' },
    ]

    for (const p of perspectives) {
      const roundResult =
        result.outcome === 'draw' ? 'draw' : p.win ? 'win' : 'lose'

      this.server.sockets.get(p.socketId)?.emit('round_result', {
        playerChoice: p.myChoice,
        opponentChoice: p.oppChoice,
        result: roundResult,
        playerHp: p.myHp,
        opponentHp: p.oppHp,
      })
    }
  }
}
