import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common'
import type { Request } from 'express'
import { SubmitContactMessageUseCase } from '@application/use-cases/contact/submit-contact-message.use-case'
import { SubmitContactDto } from '../dtos/submit-contact.presentation-dto'

@Controller('api/contact')
export class ContactController {
  constructor(private readonly submitContact: SubmitContactMessageUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: SubmitContactDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.ip ?? null
    return this.submitContact.execute({ ...dto, ipAddress: ip })
  }
}
