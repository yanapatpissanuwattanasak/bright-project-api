import { Card } from '@domain/entities/pokemon-card.entity'
import { GamePhase } from '@domain/entities/game-session.entity'
import { BoardPokemon } from './board-pokemon.vo'

export interface PerspectivePlayerState {
  handCards: Card[]
  handCount: number
  deckSize: number
  discardPile: Card[]
  prizeCardsLeft: number
  activePokemon: BoardPokemon | null
  bench: (BoardPokemon | null)[]
  hasAttachedEnergy: boolean
  hasUsedSupporter: boolean
  hasAttacked: boolean
  hasRetreated: boolean
}

export interface GameStatePerspective {
  sessionId: string
  phase: GamePhase
  myPlayerIndex: number
  currentPlayerIndex: number
  promotingPlayerIndex: number | null
  turnCount: number
  actionLog: string[]
  winner: number | null
  winReason: string | null
  myState: PerspectivePlayerState
  opponentState: PerspectivePlayerState
}
