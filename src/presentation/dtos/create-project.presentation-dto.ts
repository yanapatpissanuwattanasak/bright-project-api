import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export class CreateProjectPresentationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug!: string

  @IsString()
  @MinLength(10)
  @MaxLength(280)
  summary!: string

  @IsString()
  @IsOptional()
  problem?: string

  @IsString()
  @IsOptional()
  solution?: string

  @IsArray()
  @IsString({ each: true })
  techStack!: string[]

  @IsArray()
  @IsOptional()
  metrics?: Array<{ label: string; value: string }>

  @IsUrl()
  @IsOptional()
  loomUrl?: string

  @IsUrl()
  @IsOptional()
  demoUrl?: string

  @IsUrl()
  @IsOptional()
  githubUrl?: string

  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string

  @IsInt()
  @Min(0)
  sortOrder!: number

  @IsBoolean()
  isFeatured!: boolean

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[]
}
