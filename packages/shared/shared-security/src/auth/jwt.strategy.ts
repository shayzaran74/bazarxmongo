// packages/shared/shared-security/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// import type { Request } from 'express'; // Removed to fix frontend build errors

/**
 * JWT Access Token doğrulama stratejisi.
 * Access Token ömrü: 15 dakika (Config üzerinden yönetilir).
 *
 * Token kaynak öncelikleri:
 *  1. Authorization: Bearer ... header (mobile / API client'lar için)
 *  2. httpOnly access_token cookie (web SSR / SPA için — XSS güvenli)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is required but not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any & { cookies?: Record<string, string> }) => {
          const cookies = req.cookies;
          return cookies?.access_token ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Token doğrulandıktan sonra payload içindeki verileri döner.
   * Bu veri request nesnesine (req.user) eklenir.
   */
  async validate(payload: { sub: string; email: string; role: string; platform: string }): Promise<Record<string, unknown>> {
    // Burada gerekirse Redis üzerinden token blacklist kontrolü yapılabilir.
    
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role,
      platform: payload.platform 
    };
  }
}
