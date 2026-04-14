// packages/shared/shared-security/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Access Token doğrulama stratejisi.
 * Access Token ömrü: 15 dakika (Config üzerinden yönetilir).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-123',
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
