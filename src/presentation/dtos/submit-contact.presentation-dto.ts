import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator'

export class SubmitContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(20)
  message!: string

  @IsEnum(['freelance', 'fulltime', 'consulting', 'other'])
  projectType!: 'freelance' | 'fulltime' | 'consulting' | 'other'
}
