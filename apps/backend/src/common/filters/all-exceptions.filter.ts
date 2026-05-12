// apps/backend/src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DomainException } from '@barterborsa/shared-core';

/**
 * Tüm hataları yakalayıp detaylıca loglayan merkezi hata filtresi.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = (res as any).message || exception.message;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 4xx → WARN, 5xx → ERROR
    const logMessage = `Hata: ${request?.method} ${request?.url} [${status}]`;
    if (status >= 400 && status < 500) {
      this.logger.warn(`${logMessage} — ${Array.isArray(message) ? message[0] : message}`);
    } else {
      const errorStack = exception instanceof Error ? exception.stack : JSON.stringify(exception);
      this.logger.error(logMessage, errorStack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message[0] : message, // İlk hatayı dön veya mesajı dön
      details: Array.isArray(message) ? message : undefined,
    });
  }
}
