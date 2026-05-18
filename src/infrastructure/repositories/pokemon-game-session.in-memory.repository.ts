import { Injectable } from '@nestjs/common'
import { GameSession } from '@domain/entities/game-session.entity'
import { IGameSessionRepository } from '@domain/repositories/game-session.repository'

@Injectable()
export class InMemoryGameSessionRepository implements IGameSessionRepository {
  private readonly store = new Map<string, GameSession>()

  async create(session: GameSession): Promise<void> {
    this.store.set(session.sessionId, session)
  }

  async findById(sessionId: string): Promise<GameSession | null> {
    return this.store.get(sessionId) ?? null
  }

  async save(session: GameSession): Promise<void> {
    this.store.set(session.sessionId, session)
  }

  async delete(sessionId: string): Promise<void> {
    this.store.delete(sessionId)
  }
}
