import { GameSession } from '@domain/entities/game-session.entity'

export const I_GAME_SESSION_REPOSITORY = Symbol('IGameSessionRepository')

export interface IGameSessionRepository {
  create(session: GameSession): Promise<void>
  findById(sessionId: string): Promise<GameSession | null>
  save(session: GameSession): Promise<void>
  delete(sessionId: string): Promise<void>
}
