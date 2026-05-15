import { Inject, Injectable } from '@nestjs/common'
import { I_RPS_ROOM_REPOSITORY, IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { Choice, PlayerState, RoomState } from '@domain/entities/rps-room.entity'

export interface SubmitChoiceInput {
  roomCode: string
  sessionId: string
  socketId: string
  choice: Choice
}

export type SubmitChoiceResult =
  | { resolved: false }
  | {
      resolved: true
      p0Choice: Choice
      p1Choice: Choice
      outcome: 'draw' | 'p0wins' | 'p1wins'
      p0Hp: number
      p1Hp: number
      gameOver: boolean
      winnerId: string | null
      p0SocketId: string
      p1SocketId: string
    }

function resolveRound(c1: Choice, c2: Choice): 'draw' | 'p0wins' | 'p1wins' {
  if (c1 === c2) return 'draw'
  if (
    (c1 === 'rock' && c2 === 'scissors') ||
    (c1 === 'paper' && c2 === 'rock') ||
    (c1 === 'scissors' && c2 === 'paper')
  ) return 'p0wins'
  return 'p1wins'
}

@Injectable()
export class SubmitChoiceUseCase {
  constructor(
    @Inject(I_RPS_ROOM_REPOSITORY) private readonly roomRepo: IRpsRoomRepository,
  ) {}

  async execute(input: SubmitChoiceInput): Promise<SubmitChoiceResult> {
    const room = await this.roomRepo.findByCode(input.roomCode)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.phase !== 'battle') throw new Error('INVALID_PHASE')

    const playerIndex = room.players.findIndex(
      p => p.sessionId === input.sessionId && p.socketId === input.socketId,
    )
    if (playerIndex === -1) throw new Error('UNAUTHORIZED')
    if (room.players[playerIndex].choice !== null) throw new Error('ALREADY_SUBMITTED')

    room.players[playerIndex].choice = input.choice

    const p0 = room.players[0]
    const p1 = room.players[1]

    if (!p1 || p0.choice === null || p1.choice === null) {
      await this.roomRepo.save(room)
      return { resolved: false }
    }

    return this.resolve(room, p0, p1, p0.choice, p1.choice)
  }

  async resolveWithChoices(
    roomCode: string,
    p0Choice: Choice,
    p1Choice: Choice,
  ): Promise<SubmitChoiceResult> {
    const room = await this.roomRepo.findByCode(roomCode)
    if (!room || room.phase !== 'battle') return { resolved: false }

    const p0 = room.players[0]
    const p1 = room.players[1]
    if (!p1) return { resolved: false }

    p0.choice = p0Choice
    p1.choice = p1Choice

    return this.resolve(room, p0, p1, p0Choice, p1Choice)
  }

  private async resolve(
    room: RoomState,
    p0: PlayerState,
    p1: PlayerState,
    p0Choice: Choice,
    p1Choice: Choice,
  ): Promise<SubmitChoiceResult & { resolved: true }> {
    const outcome = resolveRound(p0Choice, p1Choice)

    if (outcome === 'p0wins') p1.hp -= 1
    else if (outcome === 'p1wins') p0.hp -= 1

    p0.choice = null
    p1.choice = null

    const gameOver = p0.hp <= 0 || p1.hp <= 0
    if (gameOver) {
      room.phase = 'gameover'
      room.expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    }

    await this.roomRepo.save(room)

    return {
      resolved: true,
      p0Choice,
      p1Choice,
      outcome,
      p0Hp: p0.hp,
      p1Hp: p1.hp,
      gameOver,
      winnerId: gameOver
        ? p0.hp <= 0
          ? p1.sessionId
          : p0.sessionId
        : null,
      p0SocketId: p0.socketId,
      p1SocketId: p1.socketId,
    }
  }
}
