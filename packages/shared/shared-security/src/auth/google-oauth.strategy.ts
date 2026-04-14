// packages/shared/shared-security/src/auth/google-oauth.strategy.ts

import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

/**
 * Google OAuth2 Giriş Stratejisi.
 */
@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleOAuthStrategy');

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
    super({
      clientID: clientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1.nip.io:3001/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });
    this.logger.warn(`[DEBUG] Strateji yüklendi. ClientID: ${clientId.substring(0, 15)}...`);
  }

  /**
   * Google'dan başarılı dönen profil verilerini işleriz.
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: {
        id: string;
        emails: Array<{ value: string; verified: boolean }>;
        name: { givenName: string; familyName: string };
        photos: Array<{ value: string }>;
    },
    done: VerifyCallback
  ): Promise<void> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    
    done(null, user);
  }
}
