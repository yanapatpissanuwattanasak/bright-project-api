import { Module } from '@nestjs/common'
import { PokemonCardController } from '@presentation/controllers/pokemon-card.controller'
import { PokemonCardGateway } from '@presentation/gateways/pokemon-card.gateway'
import { GetCardsUseCase } from '@application/use-cases/pokemon-card/get-cards.use-case'
import { GetDecksUseCase } from '@application/use-cases/pokemon-card/get-decks.use-case'
import { CreateGameSessionUseCase } from '@application/use-cases/pokemon-card/create-game-session.use-case'
import { GetGameSessionUseCase } from '@application/use-cases/pokemon-card/get-game-session.use-case'
import { ProcessActionUseCase } from '@application/use-cases/pokemon-card/process-action.use-case'
import { CreateGameRoomUseCase } from '@application/use-cases/pokemon-card/create-game-room.use-case'
import { JoinGameRoomUseCase } from '@application/use-cases/pokemon-card/join-game-room.use-case'
import { MatchmakeGameUseCase } from '@application/use-cases/pokemon-card/matchmake-game.use-case'
import { ProcessGameActionUseCase } from '@application/use-cases/pokemon-card/process-game-action.use-case'
import { GameEngineService } from '@domain/services/game-engine.service'
import { I_GAME_SESSION_REPOSITORY } from '@domain/repositories/game-session.repository'
import { I_POKEMON_GAME_ROOM_REPOSITORY } from '@domain/repositories/i-pokemon-game-room.repository'
import { InMemoryGameSessionRepository } from '@infrastructure/repositories/pokemon-game-session.in-memory.repository'
import { InMemoryPokemonGameRoomRepository } from '@infrastructure/repositories/pokemon-game-room.in-memory.repository'

@Module({
  controllers: [PokemonCardController],
  providers: [
    // Gateway
    PokemonCardGateway,
    // Use cases — REST (vs AI)
    GetCardsUseCase,
    GetDecksUseCase,
    CreateGameSessionUseCase,
    GetGameSessionUseCase,
    ProcessActionUseCase,
    // Use cases — WebSocket (online)
    CreateGameRoomUseCase,
    JoinGameRoomUseCase,
    MatchmakeGameUseCase,
    ProcessGameActionUseCase,
    // Domain service
    GameEngineService,
    // Repositories
    { provide: I_GAME_SESSION_REPOSITORY, useClass: InMemoryGameSessionRepository },
    { provide: I_POKEMON_GAME_ROOM_REPOSITORY, useClass: InMemoryPokemonGameRoomRepository },
  ],
})
export class PokemonCardModule {}
