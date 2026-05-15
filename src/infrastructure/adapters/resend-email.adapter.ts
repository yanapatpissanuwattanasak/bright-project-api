import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'
import { EmailPayload, IEmailNotifier } from '@application/ports/i-email-notifier.port'

@Injectable()
export class ResendEmailAdapter implements IEmailNotifier {
  private readonly resend = new Resend(process.env.RESEND_API_KEY)
  private readonly logger = new Logger(ResendEmailAdapter.name)
  private readonly from = 'portfolio@bright.dev'

  async send(payload: EmailPayload): Promise<void> {
    if (!process.env.RESEND_API_KEY) return
    try {
      await this.resend.emails.send({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      })
    } catch (err) {
      // Log but don't throw — contact submission should succeed even if email fails
      this.logger.error('Failed to send notification email', err)
    }
  }
}
