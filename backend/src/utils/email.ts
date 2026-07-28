import { logger } from './logger'

export interface EmailMessage {
  to: string
  subject: string
  body: string
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>
}

/**
 * Default sender — no SMTP/email provider is configured in this environment, so links are
 * logged server-side instead of emailed. Swapping in a real provider (SMTP, Resend, SES, ...)
 * means implementing EmailSender and selecting it here; no caller needs to change.
 */
class ConsoleEmailSender implements EmailSender {
  send(message: EmailMessage): Promise<void> {
    logger.info('email.send (no provider configured — logging instead)', {
      to: message.to,
      subject: message.subject,
      body: message.body,
    })
    return Promise.resolve()
  }
}

const sender: EmailSender = new ConsoleEmailSender()

export function sendEmail(message: EmailMessage): Promise<void> {
  return sender.send(message)
}
