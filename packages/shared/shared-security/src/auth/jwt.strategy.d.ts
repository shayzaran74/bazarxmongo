import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
/**
 * JWT Access Token doğrulama stratejisi.
 * Access Token ömrü: 15 dakika (Config üzerinden yönetilir).
 *
 * Token kaynak öncelikleri:
 *  1. Authorization: Bearer ... header (mobile / API client'lar için)
 *  2. httpOnly access_token cookie (web SSR / SPA için — XSS güvenli)
 */
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    /**
     * Token doğrulandıktan sonra payload içindeki verileri döner.
     * Bu veri request nesnesine (req.user) eklenir.
     */
    validate(payload: {
        sub: string;
        email: string;
        role: string;
        platform: string;
    }): Promise<Record<string, unknown>>;
}
export {};
