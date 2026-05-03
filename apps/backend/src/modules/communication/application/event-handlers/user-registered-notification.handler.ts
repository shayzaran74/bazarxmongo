import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { MailService } from '../../infrastructure/mail/mail.service';

@Injectable()
export class UserRegisteredNotificationHandler {
  private readonly logger = new Logger(UserRegisteredNotificationHandler.name);

  constructor(private readonly mailService: MailService) {}

  @RabbitSubscribe({
    exchange: 'identity.events',
    routingKey: 'user.registered',
    queue: 'communication.user.registered',
  })
  async handle(event: { userId: string; email: string; verificationCode?: string }) {
    this.logger.log(`Received user.registered event for: ${event.email}`);

    if (event.verificationCode) {
      try {
        await this.mailService.sendVerificationCode(event.email, event.verificationCode);
        this.logger.log(`Verification email sent to: ${event.email}`);
      } catch (error: any) {
        this.logger.error(`Failed to send verification email to ${event.email}: ${error.message}`);
      }
    } else {
      this.logger.warn(`No verification code found in event for ${event.email}`);
    }
  }
}
