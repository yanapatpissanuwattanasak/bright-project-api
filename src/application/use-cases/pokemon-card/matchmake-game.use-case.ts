import { Injectable } from '@nestjs/common'
import { PokemonGameRoom } from '@domain/entities/pokemon-game-room.entity'
import { CreateGameRoomUseCase } from './create-game-room.use-case'
import { JoinGameRoomUseCase } from './join-game-room.use-case'

export interface MatchmakeGameInput {
  p1SessionId: string
  p1SocketId: string
  p1DeckId: string
  p2SessionId: string
  p2SocketId: string
  p2DeckId: string
}

@Injectable()
export class MatchmakeGameUseCase {
  constructor(
    private readonly createRoomUC: CreateGameRoomUseCase,
    private readonly joinRoomUC: JoinGameRoomUseCase,
  ) {}

  async execute(input: MatchmakeGameInput): Promise<PokemonGameRoom> {
    const room = await this.createRoomUC.execute({
      sessionId: input.p1SessionId,
      socketId: input.p1SocketId,
      deckId: input.p1DeckId,
    })

    const { room: finalRoom } = await this.joinRoomUC.execute({
      roomCode: room.roomCode,
      sessionId: input.p2SessionId,
      socketId: input.p2SocketId,
      deckId: input.p2DeckId,
    })

    return finalRoom
  }
}
