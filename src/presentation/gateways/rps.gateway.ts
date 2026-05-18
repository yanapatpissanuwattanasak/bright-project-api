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
import { WsLoggingInterceptor } from '@presentation/interceptors/ws-logging.interceptor'
import { Cron } from '@nestjs/schedule'
import { Namespace, Socket } from 'socket.io'
import { I_RPS_ROOM_REPOSITORY, IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { Choice } from '@domain/entities/rps-room.entity'
import { CreateRoomUseCase } from '@application/use-cases/rps/create-room.use-case'
import { JoinRoomUseCase } from '@application/use-cases/rps/join-room.use-case'
import { MatchmakeUseCase } from '@application/use-cases/rps/matchmake.use-case'
import { SelectHeroUseCase } from '@application/use-cases/rps/select-hero.use-case'
import { SubmitChoiceUseCase } from '@application/use-cases/rps/submit-choice.use-case'

function losingChoice(winner: Choice): Choice {
  if (winner === 'rock') return 'scissors'
  if (winner === 'paper') return 'rock'
  return 'paper'
}

@UseInterceptors(WsLoggingInterceptor)
@WebSocketGateway({ namespace: '/rps', cors: { origin:  '*' } })
export class RpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace

  private readonly logger = new Logger(RpsGateway.name)
  private readonly roundTimers = new Map<string, NodeJS.Timeout>()
  private readonly reconnectTimers = new Map<string, NodeJS.Timeout>()
  private readonly matchmakingQueue: Array<{ sessionId: string; socketId: string }> = []

  constructor(
    private readonly createRoomUC: CreateRoomUseCase,
    private readonly joinRoomUC: JoinRoomUseCase,
    private readonly matchmakeUC: MatchmakeUseCase,
    private readonly selectHeroUC: SelectHeroUseCase,
    private readonly submitChoiceUC: SubmitChoiceUseCase,
    @Inject(I_RPS_ROOM_REPOSITORY) private readonly roomRepo: IRpsRoomRepository,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.log(
      `connect id=${client.id} transport=${client.conn.transport.name} origin=${client.handshake.headers.origin ?? '-'} query=${JSON.stringify(client.handshake.query)}`,
    )
    client.use(([event, ...args], next) => {
      this.logger.log(`→ [${event}] id=${client.id} payload=${JSON.stringify(args[0] ?? {})}`)
      next()
    })
  }

  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string },
  ): Promise<void> {
    this.logger.log(`create_room id=${client.id} data=${JSON.stringify(payload)}`)
    try {
      const room = await this.createRoomUC.execute({
        sessionId: payload.sessionId,
        socketId: client.id,
      })
      this.logger.log(`create_room ok roomCode=${room.roomCode} sessionId=${payload.sessionId}`)

      await client.join(room.roomCode)
      this.logger.log(`create_room socket joined room=${room.roomCode}`)

      client.emit('room_created', { roomCode: room.roomCode })
    } catch (err) {
      this.logger.error(`create_room failed id=${client.id} err=${(err as Error).message}`, (err as Error).stack)
      client.emit('error', { code: 'CREATE_FAILED', message: (err as Error).message })
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string },
  ): Promise<void> {
    this.logger.log(`join_room id=${client.id} data=${JSON.stringify(payload)}`)
    try {
      const { room, isReconnect } = await this.joinRoomUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
      })

      await client.join(room.roomCode)
      this.logger.log(`join_room socket joined room=${room.roomCode} isReconnect=${isReconnect}`)

      if (isReconnect) {
        clearTimeout(this.reconnectTimers.get(room.roomCode))
        this.reconnectTimers.delete(room.roomCode)
        this.logger.log(`join_room reconnect cleared timer roomCode=${room.roomCode}`)

        const self = room.players.find(p => p.sessionId === payload.sessionId)!
        const opponent = room.players.find(p => p.sessionId !== payload.sessionId)!

        client.emit('player_reconnected', {
          phase: room.phase,
          playerHp: self.hp,
          opponentHp: opponent.hp,
          opponentHero: opponent.heroId,
        })
        client.to(room.roomCode).emit('player_reconnected', {})
        this.logger.log(`join_room emitted player_reconnected phase=${room.phase} playerHp=${self.hp} opponentHp=${opponent.hp}`)
      } else {
        this.server.to(room.roomCode).emit('player_joined', {
          sessionId: payload.sessionId,
          roomCode: room.roomCode,
        })
        this.logger.log(`join_room emitted player_joined roomCode=${room.roomCode} sessionId=${payload.sessionId}`)
      }
    } catch (err) {
      this.logger.error(`join_room failed id=${client.id} err=${(err as Error).message}`, (err as Error).stack)
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  @SubscribeMessage('join_queue')
  handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sessionId: string },
  ): void {
    if (this.matchmakingQueue.some(p => p.sessionId === payload.sessionId)) return

    this.matchmakingQueue.push({ sessionId: payload.sessionId, socketId: client.id })
    client.emit('queue_joined', { position: this.matchmakingQueue.length })
    this.logger.log(`join_queue id=${client.id} sessionId=${payload.sessionId} queueSize=${this.matchmakingQueue.length}`)

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
      this.logger.log(`leave_queue id=${client.id} sessionId=${payload.sessionId} queueSize=${this.matchmakingQueue.length}`)
    }
  }

  @SubscribeMessage('select_hero')
  async handleSelectHero(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string; heroId: string },
  ): Promise<void> {
    this.logger.log(`select_hero id=${client.id} data=${JSON.stringify(payload)}`)
    try {
      const { room, allReady, playerIndex } = await this.selectHeroUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
        heroId: payload.heroId,
      })
      this.logger.log(`select_hero ok roomCode=${payload.roomCode} playerIndex=${playerIndex} heroId=${payload.heroId} allReady=${allReady}`)

      client.emit('hero_selected', { player: 'self', heroId: payload.heroId })
      client.to(room.roomCode).emit('hero_selected', { player: 'opponent', heroId: payload.heroId })

      if (allReady) {
        this.logger.log(`select_hero all players ready — emitting battle_start roomCode=${room.roomCode}`)
        const p0 = room.players[0]
        const p1 = room.players[1]

        const emitBattleStart = (socketId: string, idx: number) => {
          const self = room.players[idx]
          const opp = room.players[idx === 0 ? 1 : 0]
          this.logger.log(`select_hero battle_start socketId=${socketId} playerHero=${self.heroId} opponentHero=${opp.heroId} playerHp=${self.hp} opponentHp=${opp.hp}`)
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
      this.logger.error(`select_hero failed id=${client.id} err=${(err as Error).message}`, (err as Error).stack)
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  @SubscribeMessage('submit_choice')
  async handleSubmitChoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomCode: string; sessionId: string; choice: Choice },
  ): Promise<void> {
    this.logger.log(`submit_choice id=${client.id} data=${JSON.stringify(payload)}`)
    try {
      const result = await this.submitChoiceUC.execute({
        roomCode: payload.roomCode,
        sessionId: payload.sessionId,
        socketId: client.id,
        choice: payload.choice,
      })
      this.logger.log(`submit_choice executed roomCode=${payload.roomCode} sessionId=${payload.sessionId} choice=${payload.choice} resolved=${result.resolved}`)

      if (!result.resolved) {
        this.logger.log(`submit_choice waiting for opponent roomCode=${payload.roomCode}`)
        client.emit('waiting_for_opponent', {})
        return
      }

      clearTimeout(this.roundTimers.get(payload.roomCode))
      this.roundTimers.delete(payload.roomCode)
      this.logger.log(`submit_choice round resolved roomCode=${payload.roomCode} outcome=${result.outcome} gameOver=${result.gameOver} winnerId=${result.winnerId ?? '-'}`)

      this.emitRoundResult(result)

      if (result.gameOver) {
        this.logger.log(`submit_choice game_over roomCode=${payload.roomCode} winner=${result.winnerId}`)
        this.server.to(payload.roomCode).emit('game_over', { winner: result.winnerId })
      } else {
        this.startRoundTimer(payload.roomCode)
      }
    } catch (err) {
      this.logger.error(`submit_choice failed id=${client.id} err=${(err as Error).message}`, (err as Error).stack)
      client.emit('error', { code: (err as Error).message, message: (err as Error).message })
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`disconnect id=${client.id}`)

    const queueIdx = this.matchmakingQueue.findIndex(p => p.socketId === client.id)
    if (queueIdx !== -1) {
      this.matchmakingQueue.splice(queueIdx, 1)
      this.logger.log(`disconnect removed from queue id=${client.id} queueSize=${this.matchmakingQueue.length}`)
    }

    try {
      const room = await this.roomRepo.findBySocketId(client.id)
      if (!room) {
        this.logger.log(`disconnect no room found for id=${client.id}`)
        return
      }
      if (room.phase === 'gameover' || room.phase === 'lobby') {
        this.logger.log(`disconnect skipped roomCode=${room.roomCode} phase=${room.phase}`)
        return
      }

      const playerIdx = room.players.findIndex(p => p.socketId === client.id)
      if (playerIdx === -1) {
        this.logger.warn(`disconnect player not found in room roomCode=${room.roomCode} id=${client.id}`)
        return
      }

      room.players[playerIdx].connected = false
      await this.roomRepo.save(room)
      this.logger.log(`disconnect marked disconnected roomCode=${room.roomCode} playerIdx=${playerIdx}`)

      const remaining = room.players.find((_, i) => i !== playerIdx)
      if (remaining) {
        this.server.sockets
          .get(remaining.socketId)
          ?.emit('player_disconnected', { reconnectWindowSecs: 15 })
        this.logger.log(`disconnect emitted player_disconnected to remaining socketId=${remaining.socketId}`)
      }

      clearTimeout(this.reconnectTimers.get(room.roomCode))
      const timer = setTimeout(
        () => this.handleReconnectTimeout(room.roomCode, client.id),
        15_000,
      )
      this.reconnectTimers.set(room.roomCode, timer)
      this.logger.log(`disconnect reconnect timer set roomCode=${room.roomCode} windowSecs=15`)
    } catch (err) {
      this.logger.error(`disconnect error id=${client.id} err=${(err as Error).message}`, (err as Error).stack)
    }
  }

  @Cron('* * * * *')
  async evictExpiredRooms(): Promise<void> {
    const count = await this.roomRepo.deleteExpired()
    if (count > 0) this.logger.log(`evictExpiredRooms count=${count}`)
  }

  private startRoundTimer(roomCode: string): void {
    clearTimeout(this.roundTimers.get(roomCode))
    const timer = setTimeout(() => this.handleRoundTimeout(roomCode), 30_000)
    this.roundTimers.set(roomCode, timer)
    this.logger.log(`startRoundTimer set roomCode=${roomCode} timeoutSecs=30`)
  }

  private async handleRoundTimeout(roomCode: string): Promise<void> {
    this.roundTimers.delete(roomCode)
    this.logger.warn(`handleRoundTimeout fired roomCode=${roomCode}`)
    try {
      const room = await this.roomRepo.findByCode(roomCode)
      if (!room || room.phase !== 'battle' || room.players.length < 2) {
        this.logger.warn(`handleRoundTimeout skipped roomCode=${roomCode} phase=${room?.phase ?? 'null'} players=${room?.players.length ?? 0}`)
        return
      }

      const p0 = room.players[0]
      const p1 = room.players[1]

      let p0Choice = p0.choice ?? null
      let p1Choice = p1.choice ?? null

      if (p0Choice === null && p1Choice !== null) {
        p0Choice = losingChoice(p1Choice)
        this.logger.log(`handleRoundTimeout p0 auto-assigned losingChoice=${p0Choice}`)
      } else if (p1Choice === null && p0Choice !== null) {
        p1Choice = losingChoice(p0Choice)
        this.logger.log(`handleRoundTimeout p1 auto-assigned losingChoice=${p1Choice}`)
      } else if (p0Choice === null && p1Choice === null) {
        p0Choice = 'rock'
        p1Choice = 'rock'
        this.logger.log(`handleRoundTimeout both null — defaulting both to rock`)
      } else {
        this.logger.log(`handleRoundTimeout both already chose — skipping roomCode=${roomCode}`)
        return
      }

      const result = await this.submitChoiceUC.resolveWithChoices(roomCode, p0Choice, p1Choice)
      if (!result.resolved) return
      this.logger.log(`handleRoundTimeout resolved outcome=${result.outcome} gameOver=${result.gameOver} winnerId=${result.winnerId ?? '-'}`)

      this.emitRoundResult(result)

      if (result.gameOver) {
        this.logger.log(`handleRoundTimeout game_over roomCode=${roomCode} winner=${result.winnerId}`)
        this.server.to(roomCode).emit('game_over', { winner: result.winnerId })
      } else {
        this.startRoundTimer(roomCode)
      }
    } catch (err) {
      this.logger.error(`handleRoundTimeout error roomCode=${roomCode} err=${(err as Error).message}`, (err as Error).stack)
    }
  }

  private async handleReconnectTimeout(roomCode: string, disconnectedSocketId: string): Promise<void> {
    this.reconnectTimers.delete(roomCode)
    this.logger.warn(`handleReconnectTimeout fired roomCode=${roomCode} disconnectedSocketId=${disconnectedSocketId}`)
    try {
      const room = await this.roomRepo.findByCode(roomCode)
      if (!room || room.phase === 'gameover') {
        this.logger.warn(`handleReconnectTimeout skipped roomCode=${roomCode} phase=${room?.phase ?? 'null'}`)
        return
      }

      const disconnected = room.players.find(p => p.socketId === disconnectedSocketId)
      if (!disconnected || disconnected.connected) {
        this.logger.log(`handleReconnectTimeout player already reconnected roomCode=${roomCode}`)
        return
      }

      const winner = room.players.find(p => p.socketId !== disconnectedSocketId)
      if (!winner) {
        this.logger.warn(`handleReconnectTimeout no winner found roomCode=${roomCode}`)
        return
      }

      room.phase = 'gameover'
      room.expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      await this.roomRepo.save(room)
      this.logger.log(`handleReconnectTimeout forfeited roomCode=${roomCode} winner=${winner.sessionId}`)

      this.server.sockets
        .get(winner.socketId)
        ?.emit('game_over', { winner: winner.sessionId })
    } catch (err) {
      this.logger.error(`handleReconnectTimeout error roomCode=${roomCode} err=${(err as Error).message}`, (err as Error).stack)
    }
  }

  private async tryMatch(): Promise<void> {
    if (this.matchmakingQueue.length < 2) return

    const [p1, p2] = this.matchmakingQueue.splice(0, 2)
    this.logger.log(`tryMatch attempting p1=${p1.sessionId} p2=${p2.sessionId}`)

    try {
      const room = await this.matchmakeUC.execute({
        p1SessionId: p1.sessionId,
        p1SocketId: p1.socketId,
        p2SessionId: p2.sessionId,
        p2SocketId: p2.socketId,
      })

      const p1Socket = this.server.sockets.get(p1.socketId)
      const p2Socket = this.server.sockets.get(p2.socketId)

      await p1Socket?.join(room.roomCode)
      await p2Socket?.join(room.roomCode)

      p1Socket?.emit('match_found', { roomCode: room.roomCode })
      p2Socket?.emit('match_found', { roomCode: room.roomCode })

      this.logger.log(`tryMatch matched roomCode=${room.roomCode} p1=${p1.sessionId} p2=${p2.sessionId}`)
    } catch (err) {
      this.logger.error(`tryMatch failed err=${(err as Error).message}`)
      this.server.sockets.get(p1.socketId)?.emit('error', { code: 'MATCH_FAILED', message: 'Matchmaking failed, please try again' })
      this.server.sockets.get(p2.socketId)?.emit('error', { code: 'MATCH_FAILED', message: 'Matchmaking failed, please try again' })
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

      this.logger.log(`emitRoundResult socketId=${p.socketId} result=${roundResult} playerChoice=${p.myChoice} opponentChoice=${p.oppChoice} playerHp=${p.myHp} opponentHp=${p.oppHp}`)
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
