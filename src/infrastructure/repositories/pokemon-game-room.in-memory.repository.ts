import { Injectable } from '@nestjs/common'
import { PokemonGameRoom } from '@domain/entities/pokemon-game-room.entity'
import { IPokemonGameRoomRepository } from '@domain/repositories/i-pokemon-game-room.repository'

@Injectable()
export class InMemoryPokemonGameRoomRepository implements IPokemonGameRoomRepository {
  private readonly store = new Map<string, PokemonGameRoom>()

  async create(room: PokemonGameRoom): Promise<void> {
    this.store.set(room.roomCode, room)
  }

  async findByCode(roomCode: string): Promise<PokemonGameRoom | null> {
    return this.store.get(roomCode) ?? null
  }

  async findBySocketId(socketId: string): Promise<PokemonGameRoom | null> {
    for (const room of this.store.values()) {
      if (room.players.some(p => p.socketId === socketId)) return room
    }
    return null
  }

  async save(room: PokemonGameRoom): Promise<void> {
    this.store.set(room.roomCode, room)
  }

  async delete(roomCode: string): Promise<void> {
    this.store.delete(roomCode)
  }

  async deleteExpired(): Promise<number> {
    const now = new Date()
    let count = 0
    for (const [code, room] of this.store) {
      if (room.expiresAt < now) {
        this.store.delete(code)
        count++
      }
    }
    return count
  }
}
