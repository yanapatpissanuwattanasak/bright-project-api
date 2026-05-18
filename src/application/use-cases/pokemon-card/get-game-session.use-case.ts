import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { I_GAME_SESSION_REPOSITORY, IGameSessionRepository } from '@domain/repositories/game-session.repository'
import { buildPerspective } from './process-game-action.use-case'

@Injectable()
export class GetGameSessionUseCase {
  constructor(
    @Inject(I_GAME_SESSION_REPOSITORY) private readonly repo: IGameSessionRepository,
  ) {}

  async execute(sessionId: string) {
    const session = await this.repo.findById(sessionId)
    if (!session) throw new NotFoundException(`Game session not found: ${sessionId}`)
    return buildPerspective(session, 0)
  }
}
