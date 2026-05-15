import { Inject, Injectable } from '@nestjs/common'
import { I_RPS_ROOM_REPOSITORY, IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { RoomCode } from '@domain/value-objects/room-code.vo'
import { RoomState } from '@domain/entities/rps-room.entity'

export interface JoinRoomInput {
  roomCode: string
  sessionId: string
  socketId: string
}

export interface JoinRoomResult {
  room: RoomState
  isReconnect: boolean
}

@Injectable()
export class JoinRoomUseCase {
  constructor(
    @Inject(I_RPS_ROOM_REPOSITORY) private readonly roomRepo: IRpsRoomRepository,
  ) {}

  async execute(input: JoinRoomInput): Promise<JoinRoomResult> {
    RoomCode.from(input.roomCode)

    const room = await this.roomRepo.findByCode(input.roomCode)
    if (!room) throw new Error('ROOM_NOT_FOUND')
    if (room.phase === 'gameover') throw new Error('ROOM_CLOSED')

    const existingPlayer = room.players.find(p => p.sessionId === input.sessionId)
    if (existingPlayer) {
      existingPlayer.socketId = input.socketId
      existingPlayer.connected = true
      await this.roomRepo.save(room)
      return { room, isReconnect: true }
    }

    if (room.players.length >= 2) throw new Error('ROOM_FULL')

    room.players.push({
      sessionId: input.sessionId,
      socketId: input.socketId,
      heroId: null,
      hp: 3,
      choice: null,
      connected: true,
    })

    if (room.players.length === 2) {
      room.phase = 'hero-select'
    }

    await this.roomRepo.save(room)
    return { room, isReconnect: false }
  }
}
