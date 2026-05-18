import { EnergyCard, PokemonCard } from '@domain/entities/pokemon-card.entity'

export interface BoardPokemon {
  card: PokemonCard
  currentHp: number
  attachedEnergy: EnergyCard[]
  turnsOnField: number
}
