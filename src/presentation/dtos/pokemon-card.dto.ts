import { IsEnum, IsString, IsOptional, IsNumber, ValidateNested, IsIn } from 'class-validator'
import { Type } from 'class-transformer'
import { GameMode } from '@domain/entities/game-session.entity'
import { ActionType } from '@domain/entities/pokemon-card.entity'

export class CreateGameDto {
  @IsEnum(['vs-ai-easy', 'vs-ai-hard'])
  mode: GameMode

  @IsString()
  playerDeckId: string
}

class ActionPayloadDto {
  @IsEnum([
    'PLAY_POKEMON', 'ATTACH_ENERGY', 'ATTACK', 'RETREAT',
    'PLAY_TRAINER', 'PROMOTE_POKEMON', 'EVOLVE', 'END_TURN',
  ])
  type: ActionType

  @IsOptional()
  @IsNumber()
  handIndex?: number

  @IsOptional()
  targetSlot?: 'active' | number

  @IsOptional()
  @IsNumber()
  attackIndex?: number

  @IsOptional()
  @IsNumber()
  benchIndex?: number

  @IsOptional()
  trainerTarget?: 'active' | number
}

export class GameActionDto {
  @ValidateNested()
  @Type(() => ActionPayloadDto)
  action: ActionPayloadDto
}
