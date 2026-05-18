import { Inject, Injectable } from '@nestjs/common'
import { GameAction } from '@domain/entities/pokemon-card.entity'
import { GameSession } from '@domain/entities/game-session.entity'
import { GameEngineService } from '@domain/services/game-engine.service'
import { I_POKEMON_GAME_ROOM_REPOSITORY, IPokemonGameRoomRepository } from '@domain/repositories/i-pokemon-game-room.repository'
import { GameStatePerspective, PerspectivePlayerState } from '@domain/value-objects/game-perspective.vo'
import { PokemonPlayerState } from '@domain/value-objects/player-state.vo'

export interface ProcessGameActionInput {
  roomCode: string
  sessionId: string
  action: GameAction
}

export interface ProcessGameActionResult {
  p0Perspective: GameStatePerspective
  p1Perspective: GameStatePerspective
  isGameOver: boolean
  p0SocketId: string
  p1SocketId: string
}

@Injectable()
export class ProcessGameActionUseCase {
  constructor(
    private readonly engine: GameEngineService,
    @Inject(I_POKEMON_GAME_ROOM_REPOSITORY) private readonly roomRepo: IPokemonGameRoomRepository,
  ) {}

  async execute(input: ProcessGameActionInput): Promise<{ result?: ProcessGameActionResult; error?: string }> {
    const room = await this.roomRepo.findByCode(input.roomCode)
    if (!room) return { error: 'ROOM_NOT_FOUND' }
    if (room.phase !== 'playing' || !room.gameState) return { error: 'GAME_NOT_STARTED' }

    const playerIndex = room.players.findIndex(p => p.sessionId === input.sessionId)
    if (playerIndex === -1) return { error: 'PLAYER_NOT_IN_ROOM' }

    const { session: updated, error } = this.engine.applyAction(room.gameState, playerIndex, input.action)
    if (error) return { error }

    room.gameState = updated
    if (updated.phase === 'ended') room.phase = 'gameover'
    await this.roomRepo.save(room)

    return {
      result: {
        p0Perspective: buildPerspective(updated, 0),
        p1Perspective: buildPerspective(updated, 1),
        isGameOver: updated.phase === 'ended',
        p0SocketId: room.players[0].socketId,
        p1SocketId: room.players[1].socketId,
      },
    }
  }
}

function toPerspectiveState(state: PokemonPlayerState, isOwn: boolean): PerspectivePlayerState {
  return {
    handCards: isOwn ? state.hand : [],
    handCount: state.hand.length,
    deckSize: state.deck.length,
    discardPile: state.discardPile,
    prizeCardsLeft: state.prizeCards.length,
    activePokemon: state.activePokemon,
    bench: state.bench,
    hasAttachedEnergy: state.hasAttachedEnergy,
    hasUsedSupporter: state.hasUsedSupporter,
    hasAttacked: state.hasAttacked,
    hasRetreated: state.hasRetreated,
  }
}

export function buildPerspective(session: GameSession, viewerIndex: 0 | 1): GameStatePerspective {
  const oppIndex = viewerIndex === 0 ? 1 : 0
  return {
    sessionId: session.sessionId,
    phase: session.phase,
    myPlayerIndex: viewerIndex,
    currentPlayerIndex: session.currentPlayerIndex,
    promotingPlayerIndex: session.promotingPlayerIndex,
    turnCount: session.turnCount,
    actionLog: session.actionLog,
    winner: session.winner,
    winReason: session.winReason,
    myState: toPerspectiveState(session.players[viewerIndex], true),
    opponentState: toPerspectiveState(session.players[oppIndex], false),
  }
}
