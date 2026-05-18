import { Inject, Injectable, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { GameMode } from '@domain/entities/game-session.entity'
import { GameEngineService } from '@domain/services/game-engine.service'
import { I_GAME_SESSION_REPOSITORY, IGameSessionRepository } from '@domain/repositories/game-session.repository'
import { ALL_PRESET_DECKS } from '../../../data/preset-decks.data'
import { buildPerspective } from './process-game-action.use-case'

export interface CreateGameSessionInput {
  mode: GameMode
  playerDeckId: string
}

@Injectable()
export class CreateGameSessionUseCase {
  constructor(
    private readonly engine: GameEngineService,
    @Inject(I_GAME_SESSION_REPOSITORY) private readonly repo: IGameSessionRepository,
  ) {}

  async execute(input: CreateGameSessionInput) {
    const playerDeck = ALL_PRESET_DECKS.find(d => d.id === input.playerDeckId)
    if (!playerDeck) throw new BadRequestException(`Unknown deck: ${input.playerDeckId}`)

    // AI uses a random deck different from the player's if possible
    const aiDeck =
      ALL_PRESET_DECKS.find(d => d.id !== input.playerDeckId) ?? playerDeck

    const deck0 = this.engine.buildDeck(playerDeck)
    const deck1 = this.engine.buildDeck(aiDeck)

    const session = this.engine.initializeGame(randomUUID(), input.mode, deck0, deck1)
    await this.repo.create(session)

    return buildPerspective(session, 0)
  }
}
