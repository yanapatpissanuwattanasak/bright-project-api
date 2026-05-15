import { Inject, Injectable } from '@nestjs/common'
import { I_RPS_ROOM_REPOSITORY, IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { RoomState } from '@domain/entities/rps-room.entity'

export interface SelectHeroInput {
  roomCode: string
  sessionId: string
  socketId: string
  heroId: string
}

export interface SelectHeroResult {
  room: RoomState
  allReady: boolean
  playerIndex: number
}

@Injectable()
export class SelectHeroUseCase {
  constructor(
    @Inject(I_RPS_ROOM_REPOSITORY) private readonly roomRepo: IRpsRoomRepository,
  ) {}

  async execute(input: SelectHeroInput): Promise<SelectHeroResult> {
    const room = await this.roomRepo.findByCode(input.roomCode)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.phase !== 'hero-select') throw new Error('INVALID_PHASE')

    const playerIndex = room.players.findIndex(
      p => p.sessionId === input.sessionId && p.socketId === input.socketId,
    )
    if (playerIndex === -1) throw new Error('UNAUTHORIZED')

    room.players[playerIndex].heroId = input.heroId

    const allReady = room.players.length === 2 && room.players.every(p => p.heroId !== null)
    if (allReady) {
      room.phase = 'battle'
    }

    await this.roomRepo.save(room)
    return { room, allReady, playerIndex }
  }
}
