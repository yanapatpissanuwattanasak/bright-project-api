import { Inject, Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'
import { PokemonGameRoom } from '@domain/entities/pokemon-game-room.entity'
import { I_POKEMON_GAME_ROOM_REPOSITORY, IPokemonGameRoomRepository } from '@domain/repositories/i-pokemon-game-room.repository'

export interface CreateGameRoomInput {
  sessionId: string
  socketId: string
  deckId: string
}

@Injectable()
export class CreateGameRoomUseCase {
  constructor(
    @Inject(I_POKEMON_GAME_ROOM_REPOSITORY) private readonly roomRepo: IPokemonGameRoomRepository,
  ) {}

  async execute(input: CreateGameRoomInput): Promise<PokemonGameRoom> {
    const roomCode = randomBytes(3).toString('hex').toUpperCase()

    const room: PokemonGameRoom = {
      roomCode,
      phase: 'lobby',
      players: [
        {
          sessionId: input.sessionId,
          socketId: input.socketId,
          deckId: input.deckId,
          connected: true,
        },
      ],
      gameState: null,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      createdAt: new Date(),
    }

    await this.roomRepo.create(room)
    return room
  }
}
