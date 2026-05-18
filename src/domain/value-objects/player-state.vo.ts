import { Card } from '@domain/entities/pokemon-card.entity'
import { BoardPokemon } from './board-pokemon.vo'

export interface PokemonPlayerState {
  playerId: string
  hand: Card[]
  deck: Card[]
  discardPile: Card[]
  prizeCards: Card[]
  activePokemon: BoardPokemon | null
  bench: (BoardPokemon | null)[]
  hasAttachedEnergy: boolean
  hasUsedSupporter: boolean
  hasAttacked: boolean
  hasRetreated: boolean
}
