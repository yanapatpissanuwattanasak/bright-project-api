import { Injectable } from '@nestjs/common'
import { ALL_PRESET_DECKS } from '../../../data/preset-decks.data'

@Injectable()
export class GetDecksUseCase {
  execute() {
    return ALL_PRESET_DECKS
  }
}
