// apps/backend/src/common/middleware/csrf.middleware.ts
// Double-submit cookie pattern: csrf_token cookie == X-CSRF-Token header
// GET/HEAD/OPTIONS ve unauthenticated auth endpoint'leri muaf tutulur.

import { Injectable, NestMiddleware, ForbiddenException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// NestJS, consumer.apply().forRoutes('*') ile middleware'i her route handler'ın
// Express mount noktasına bağlar. Bu durumda req.path her zaman '/' döner.
// Doğru yol karşılaştırması için req.originalUrl kullanılmalıdır.
const CSRF_EXEMPT_PREFIXES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/verify-email',
  '/api/v1/auth/resend-verification',
  '/api/v1/auth/google',
  '/api/v1/auth/csrf',
  '/api/v1/analytics/track',
];

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction): void {
    // Güvenli HTTP metodları — CSRF riski yok
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    // req.originalUrl: Express sub-router'dan etkilenmeyen tam istek yolu
    // Query string varsa temizle (?foo=bar kısmını at)
    const fullPath = (req.originalUrl || req.url).split('?')[0];

    // Muaf uç noktalar — unauthenticated veya token tabanlı akışlar
    const isExempt = CSRF_EXEMPT_PREFIXES.some(p =>
      fullPath === p || fullPath.startsWith(`${p}/`),
    );

    if (isExempt) {
      return next();
    }

    // csrf_token cookie yoksa — API client veya eski istemci, doğrulama atla
    const cookieToken = (req.cookies as Record<string, string>)?.csrf_token;
    if (!cookieToken) {
      return next();
    }

    // Cookie varsa X-CSRF-Token header'ı ile eşleşmeli
    const headerToken = req.headers['x-csrf-token'] as string | undefined;
    
    this.logger.debug(`CSRF Check -> Cookie: ${cookieToken}, Header: ${headerToken}, URL: ${req.originalUrl}`);

    if (!headerToken || headerToken !== cookieToken) {
      this.logger.warn(
        `CSRF doğrulama hatası — path: ${fullPath}, ip: ${req.ip ?? 'unknown'}`,
      );
      throw new ForbiddenException('CSRF token geçersiz veya eksik.');
    }

    next();
  }
}

