// apps/backend/src/common/filters/all-exceptions.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * Tüm hataları yakalayıp detaylıca loglayan merkezi hata filtresi.
 * 500 hatalarının gerçek sebebini görmek için kritik öneme sahiptir.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Hata detaylarını terminale bas (Stack Trace dahil)
    let errorDetails = '';
    try {
      errorDetails = exception instanceof Error ? exception.stack || exception.message : JSON.stringify(exception);
    } catch (e) {
      errorDetails = 'Could not stringify exception: ' + String(exception);
    }

    this.logger.error(
      `Hata: ${request.method} ${request.url}`,
      errorDetails
    );

    response.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: (exception as any)?.message || 'Internal server error',
    });
  }
}
