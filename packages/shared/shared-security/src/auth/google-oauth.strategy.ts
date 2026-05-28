// packages/shared/shared-security/src/auth/google-oauth.strategy.ts

import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleOAuthStrategy');

  constructor() {
    const clientId     = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL  = process.env.GOOGLE_CALLBACK_URL || 'http://127.0.0.1.nip.io:3001/api/v1/auth/google/callback';

    GoogleOAuthStrategy.validateCredentials(clientId, clientSecret);

    super({
      clientID:     clientId     || 'google-oauth-disabled',
      clientSecret: clientSecret || 'google-oauth-disabled',
      callbackURL,
      scope: ['email', 'profile'],
    });

    if (clientId) {
      new Logger('GoogleOAuthStrategy').log('Google OAuth stratejisi aktif.');
    } else {
      new Logger('GoogleOAuthStrategy').warn('Google OAuth devre dışı — GOOGLE_CLIENT_ID tanımlı değil.');
    }
  }

  // Dummy veya boş değerler startup'ta hataya yol açar
  private static validateCredentials(clientId?: string, clientSecret?: string): void {
    const DUMMY = ['dummy-client-id', 'dummy-client-secret'];
    if (clientId && DUMMY.includes(clientId)) {
      throw new Error('GOOGLE_CLIENT_ID dummy değer içeriyor. Gerçek bir OAuth Client ID kullanın veya env\'den kaldırın.');
    }
    if (clientSecret && DUMMY.includes(clientSecret)) {
      throw new Error('GOOGLE_CLIENT_SECRET dummy değer içeriyor. Gerçek bir OAuth Client Secret kullanın veya env\'den kaldırın.');
    }
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      emails: Array<{ value: string; verified: boolean }>;
      name: { givenName: string; familyName: string };
      photos: Array<{ value: string }>;
    },
    done: VerifyCallback,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;
    done(null, {
      googleId:    id,
      email:       emails[0].value,
      firstName:   name.givenName,
      lastName:    name.familyName,
      picture:     photos[0].value,
      accessToken,
    });
  }
}
