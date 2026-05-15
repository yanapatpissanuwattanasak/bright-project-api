import { IsArray, IsString } from 'class-validator'

export class ReorderProjectsDto {
  @IsArray()
  @IsString({ each: true })
  orderedIds!: string[]
}
