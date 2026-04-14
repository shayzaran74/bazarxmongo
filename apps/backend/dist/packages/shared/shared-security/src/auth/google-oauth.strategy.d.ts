import { Strategy, VerifyCallback } from 'passport-google-oauth20';
declare const GoogleOAuthStrategy_base: new (...args: any[]) => Strategy;
/**
 * Google OAuth2 Giriş Stratejisi.
 */
export declare class GoogleOAuthStrategy extends GoogleOAuthStrategy_base {
    private readonly logger;
    constructor();
    /**
     * Google'dan başarılı dönen profil verilerini işleriz.
     */
    validate(accessToken: string, refreshToken: string, profile: {
        id: string;
        emails: Array<{
            value: string;
            verified: boolean;
        }>;
        name: {
            givenName: string;
            familyName: string;
        };
        photos: Array<{
            value: string;
        }>;
    }, done: VerifyCallback): Promise<void>;
}
export {};
