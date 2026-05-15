export const I_EMAIL_NOTIFIER = Symbol('IEmailNotifier')

export interface EmailPayload {
  to: string
  subject: string
  html: string
}

export interface IEmailNotifier {
  send(payload: EmailPayload): Promise<void>
}
