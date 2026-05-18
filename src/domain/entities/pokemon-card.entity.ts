export type PokemonType = 'fire' | 'water' | 'grass' | 'electric' | 'colorless'
export type PokemonStage = 'basic' | 'stage1' | 'stage2'
export type TrainerSubtype = 'item' | 'supporter'

export type TrainerEffect =
  | 'HEAL_30'
  | 'HEAL_60_DISCARD_ENERGY'
  | 'FULL_HEAL'
  | 'SWITCH'
  | 'SEARCH_POKEMON_IN_DECK'
  | 'RETRIEVE_2_ENERGY'
  | 'SEARCH_BASIC_ENERGY'
  | 'SEARCH_TOP_7_POKEMON'
  | 'DRAW_7_DISCARD_HAND'
  | 'MARNIE_SHUFFLE'
  | 'DRAW_2'
  | 'SEARCH_BASIC_POKEMON'

export interface Attack {
  name: string
  energyCost: PokemonType[]
  damage: number
  effect?: string
}

export interface PokemonCard {
  id: string
  cardType: 'pokemon'
  name: string
  pokemonType: PokemonType
  hp: number
  stage: PokemonStage
  evolvesFrom?: string
  attacks: Attack[]
  weakness?: { type: PokemonType; multiplier: 2 }
  resistance?: { type: PokemonType; reduction: 30 }
  retreatCost: number
  imageUrl: string
}

export interface EnergyCard {
  id: string
  cardType: 'energy'
  name: string
  energyType: PokemonType
  imageUrl: string
}

export interface TrainerCard {
  id: string
  cardType: 'trainer'
  name: string
  trainerSubtype: TrainerSubtype
  effect: TrainerEffect
  effectText: string
  imageUrl: string
}

export type Card = PokemonCard | EnergyCard | TrainerCard

export type ActionType =
  | 'PLAY_POKEMON'
  | 'ATTACH_ENERGY'
  | 'ATTACK'
  | 'RETREAT'
  | 'PLAY_TRAINER'
  | 'PROMOTE_POKEMON'
  | 'EVOLVE'
  | 'END_TURN'

export interface GameAction {
  type: ActionType
  handIndex?: number
  targetSlot?: 'active' | number
  attackIndex?: number
  benchIndex?: number
  trainerTarget?: 'active' | number
}
