// packages/shared/shared-observability/src/logging/logger.module.ts

import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        level: process.env.LOG_LEVEL || 'info',
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.passwordConfirm',
            'req.body.newPassword',
            'req.body.token',
            'req.body.pin',
            'req.body.transactionPin',
            'req.body.creditCard',
            'req.body.cardNumber',
            'req.body.cvv',
          ],
          censor: '[REDACTED]',
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
