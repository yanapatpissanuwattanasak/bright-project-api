import { Injectable } from '@nestjs/common'
import { RoomState } from '@domain/entities/rps-room.entity'
import { CreateRoomUseCase } from './create-room.use-case'
import { JoinRoomUseCase } from './join-room.use-case'

export interface MatchmakeInput {
  p1SessionId: string
  p1SocketId: string
  p2SessionId: string
  p2SocketId: string
}

@Injectable()
export class MatchmakeUseCase {
  constructor(
    private readonly createRoomUC: CreateRoomUseCase,
    private readonly joinRoomUC: JoinRoomUseCase,
  ) {}

  async execute(input: MatchmakeInput): Promise<RoomState> {
    const room = await this.createRoomUC.execute({
      sessionId: input.p1SessionId,
      socketId: input.p1SocketId,
    })

    const { room: finalRoom } = await this.joinRoomUC.execute({
      roomCode: room.roomCode,
      sessionId: input.p2SessionId,
      socketId: input.p2SocketId,
    })

    return finalRoom
  }
}
