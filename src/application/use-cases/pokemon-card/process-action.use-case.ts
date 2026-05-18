import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { GameAction } from '@domain/entities/pokemon-card.entity'
import { GameEngineService } from '@domain/services/game-engine.service'
import { I_GAME_SESSION_REPOSITORY, IGameSessionRepository } from '@domain/repositories/game-session.repository'
import { buildPerspective } from './process-game-action.use-case'

export interface ProcessActionInput {
  sessionId: string
  action: GameAction
}

@Injectable()
export class ProcessActionUseCase {
  constructor(
    private readonly engine: GameEngineService,
    @Inject(I_GAME_SESSION_REPOSITORY) private readonly repo: IGameSessionRepository,
  ) {}

  async execute(input: ProcessActionInput) {
    const session = await this.repo.findById(input.sessionId)
    if (!session) throw new NotFoundException(`Game session not found: ${input.sessionId}`)
    if (session.phase === 'ended') throw new BadRequestException('Game is already over.')

    // player is always index 0 in vs-AI mode
    const { session: afterPlayer, error } = this.engine.applyAction(session, 0, input.action)
    if (error) throw new BadRequestException(error)

    let final = afterPlayer

    // AI auto-promotes when its active is KO'd (player can't do it for them)
    if (final.phase === 'waiting-promote' && final.promotingPlayerIndex === 1) {
      const firstSlot = final.players[1].bench.findIndex(b => b !== null)
      if (firstSlot !== -1) {
        const { session: afterPromote } = this.engine.applyAction(final, 1, { type: 'PROMOTE_POKEMON', benchIndex: firstSlot })
        final = afterPromote
      }
    }

    // if the game is still going and it's now the AI's turn, run AI
    if (final.phase !== 'ended' && final.phase !== 'waiting-promote' && final.currentPlayerIndex === 1) {
      const difficulty = final.mode === 'vs-ai-hard' ? 'hard' : 'easy'
      final = this.engine.runAiTurn(final, 1, difficulty)
    }

    await this.repo.save(final)
    return buildPerspective(final, 0)
  }
}
