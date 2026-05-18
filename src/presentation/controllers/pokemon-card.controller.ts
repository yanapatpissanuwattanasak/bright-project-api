import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { GetCardsUseCase } from '@application/use-cases/pokemon-card/get-cards.use-case'
import { GetDecksUseCase } from '@application/use-cases/pokemon-card/get-decks.use-case'
import { CreateGameSessionUseCase } from '@application/use-cases/pokemon-card/create-game-session.use-case'
import { GetGameSessionUseCase } from '@application/use-cases/pokemon-card/get-game-session.use-case'
import { ProcessActionUseCase } from '@application/use-cases/pokemon-card/process-action.use-case'
import { CreateGameDto, GameActionDto } from '@presentation/dtos/pokemon-card.dto'

@Controller('api/pokemon-card')
export class PokemonCardController {
  constructor(
    private readonly getCards: GetCardsUseCase,
    private readonly getDecks: GetDecksUseCase,
    private readonly createGame: CreateGameSessionUseCase,
    private readonly getGame: GetGameSessionUseCase,
    private readonly processAction: ProcessActionUseCase,
  ) {}

  @Get('cards')
  cards() {
    return this.getCards.execute()
  }

  @Get('decks')
  decks() {
    return this.getDecks.execute()
  }

  @Post('games')
  create(@Body() dto: CreateGameDto) {
    return this.createGame.execute({ mode: dto.mode, playerDeckId: dto.playerDeckId })
  }

  @Get('games/:id')
  game(@Param('id') id: string) {
    return this.getGame.execute(id)
  }

  @Post('games/:id/actions')
  action(@Param('id') id: string, @Body() dto: GameActionDto) {
    return this.processAction.execute({ sessionId: id, action: dto.action })
  }
}
