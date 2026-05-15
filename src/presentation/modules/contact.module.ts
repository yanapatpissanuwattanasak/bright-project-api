import { Module } from '@nestjs/common'
import { ContactController } from '../controllers/contact.controller'
import { SubmitContactMessageUseCase } from '@application/use-cases/contact/submit-contact-message.use-case'
import { I_CONTACT_MESSAGE_REPOSITORY } from '@domain/repositories/i-contact-message.repository'
import { I_RATE_LIMITER } from '@application/ports/i-rate-limiter.port'
import { I_EMAIL_NOTIFIER } from '@application/ports/i-email-notifier.port'
import { InMemoryRateLimiterAdapter } from '@infrastructure/adapters/in-memory-rate-limiter.adapter'
import { ResendEmailAdapter } from '@infrastructure/adapters/resend-email.adapter'
import { ContactMessageStubRepository } from '@infrastructure/database/repositories/stub/contact-message.stub-repository'

@Module({
  controllers: [ContactController],
  providers: [
    SubmitContactMessageUseCase,
    { provide: I_RATE_LIMITER, useClass: InMemoryRateLimiterAdapter },
    { provide: I_EMAIL_NOTIFIER, useClass: ResendEmailAdapter },
    { provide: I_CONTACT_MESSAGE_REPOSITORY, useClass: ContactMessageStubRepository },
  ],
})
export class ContactModule {}
