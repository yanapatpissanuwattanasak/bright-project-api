import { Injectable } from '@nestjs/common'
import { ALL_ENERGY_CARDS, ALL_POKEMON_CARDS, ALL_TRAINER_CARDS } from '../../../data/pokemon-cards.data'

@Injectable()
export class GetCardsUseCase {
  execute() {
    return {
      pokemon: ALL_POKEMON_CARDS,
      trainer: ALL_TRAINER_CARDS,
      energy: ALL_ENERGY_CARDS,
    }
  }
}
