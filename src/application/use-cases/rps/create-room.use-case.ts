import { Inject, Injectable } from '@nestjs/common'
import { I_RPS_ROOM_REPOSITORY, IRpsRoomRepository } from '@domain/repositories/i-rps-room.repository'
import { RoomCode } from '@domain/value-objects/room-code.vo'
import { RoomState } from '@domain/entities/rps-room.entity'

export interface CreateRoomInput {
  sessionId: string
  socketId: string
}

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(I_RPS_ROOM_REPOSITORY) private readonly roomRepo: IRpsRoomRepository,
  ) {}

  async execute(input: CreateRoomInput): Promise<RoomState> {
    const roomCode = RoomCode.generate().toString()

    return this.roomRepo.create(roomCode, {
      sessionId: input.sessionId,
      socketId: input.socketId,
      heroId: null,
      hp: 3,
      choice: null,
      connected: true,
    })
  }
}
