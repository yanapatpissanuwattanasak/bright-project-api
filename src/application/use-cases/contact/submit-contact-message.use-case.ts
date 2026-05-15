import { Inject, Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { I_CONTACT_MESSAGE_REPOSITORY, IContactMessageRepository } from '@domain/repositories/i-contact-message.repository'
import { I_RATE_LIMITER, IRateLimiter } from '@application/ports/i-rate-limiter.port'
import { I_EMAIL_NOTIFIER, IEmailNotifier } from '@application/ports/i-email-notifier.port'
import { ContactMessage, ProjectType } from '@domain/entities/contact-message.entity'

export interface SubmitContactInput {
  name: string
  email: string
  message: string
  projectType: ProjectType
  ipAddress: string | null
}

@Injectable()
export class SubmitContactMessageUseCase {
  constructor(
    @Inject(I_CONTACT_MESSAGE_REPOSITORY) private readonly messageRepo: IContactMessageRepository,
    @Inject(I_RATE_LIMITER) private readonly rateLimiter: IRateLimiter,
    @Inject(I_EMAIL_NOTIFIER) private readonly emailNotifier: IEmailNotifier,
  ) {}

  async execute(input: SubmitContactInput): Promise<void> {
    if (input.ipAddress) {
      const allowed = await this.rateLimiter.check(`contact:${input.ipAddress}`, 3, 60 * 60 * 1000)
      if (!allowed) {
        throw Object.assign(new Error('Rate limit exceeded'), { code: 'RATE_LIMITED' })
      }
    }

    const message = new ContactMessage(
      uuidv4(),
      input.name,
      input.email,
      input.message,
      input.projectType,
      false,
      input.ipAddress,
      new Date(),
    )

    await this.messageRepo.save(message)

    await this.emailNotifier.send({
      to: process.env.NOTIFICATION_EMAIL ?? '',
      subject: `New contact: ${input.name} (${input.projectType})`,
      html: `<p><strong>${input.name}</strong> (${input.email}) sent a message:</p><blockquote>${input.message}</blockquote>`,
    })
  }
}
