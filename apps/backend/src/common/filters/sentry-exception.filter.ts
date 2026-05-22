// apps/backend/src/common/filters/sentry-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { DomainException } from '@barterborsa/shared-core';

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SentryExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{ method: string; url: string; user?: { id: string } }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' && res !== null && 'message' in res
        ? (res as { message: string | string[] }).message
        : exception.message;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Sadece 5xx hatalar Sentry'e gönderilir (domain/validasyon hataları değil)
    if (status >= 500 && process.env.SENTRY_DSN) {
      Sentry.withScope((scope) => {
        scope.setTag('url', request?.url);
        scope.setTag('method', request?.method);
        scope.setTag('statusCode', String(status));
        if (request?.user?.id) {
          scope.setUser({ id: request.user.id });
        }
        Sentry.captureException(exception);
      });
    }

    const logMessage = `${request?.method} ${request?.url} [${status}]`;
    if (status >= 500) {
      this.logger.error(`${logMessage} — ${exception instanceof Error ? exception.message : String(exception)}`);
    } else if (status >= 400) {
      this.logger.warn(`${logMessage} — ${Array.isArray(message) ? message[0] : message}`);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request?.url,
      message: Array.isArray(message) ? message[0] : message,
      details: Array.isArray(message) ? message : undefined,
    });
  }
}
