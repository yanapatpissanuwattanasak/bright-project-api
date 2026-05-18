import { PokemonGameRoom } from '@domain/entities/pokemon-game-room.entity'

export const I_POKEMON_GAME_ROOM_REPOSITORY = Symbol('IPokemonGameRoomRepository')

export interface IPokemonGameRoomRepository {
  create(room: PokemonGameRoom): Promise<void>
  findByCode(roomCode: string): Promise<PokemonGameRoom | null>
  findBySocketId(socketId: string): Promise<PokemonGameRoom | null>
  save(room: PokemonGameRoom): Promise<void>
  delete(roomCode: string): Promise<void>
  deleteExpired(): Promise<number>
}
