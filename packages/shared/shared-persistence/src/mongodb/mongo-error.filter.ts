// packages/shared/shared-persistence/src/mongodb/mongo-error.filter.ts
// MongoDB duplicate key error (11000) → NestJS ConflictException

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';

@Catch(MongoError)
export class MongoErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoErrorFilter.name);

  catch(exception: MongoError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 11000) {
      // Duplicate key — 11000
      const match = exception.message.match(/index: (\w+)\.(\w+)_/);
      const collection = match?.[1] ?? 'unknown';
      const field = match?.[2] ?? 'unknown';

      this.logger.warn(`Duplicate key: ${collection}.${field}`);

      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: `Kayıt zaten mevcut: ${field}`,
        error: 'Conflict',
      });
      return;
    }

    // Diğer MongoError'lar — yetkilendirme, schema validation, vb.
    this.logger.error(`MongoDB error: ${exception.message}`, exception.stack);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Veritabanı hatası',
      error: 'Internal Server Error',
    });
  }
}

// MongoError 11000 harici durumlar için yardımcı
export function isDuplicateKeyError(exception: MongoError): boolean {
  return exception.code === 11000;
}

export function extractDuplicateField(exception: MongoError): string {
  const match = exception.message.match(/index: (\w+)\.(\w+)_/);
  return match?.[2] ?? 'unknown';
}