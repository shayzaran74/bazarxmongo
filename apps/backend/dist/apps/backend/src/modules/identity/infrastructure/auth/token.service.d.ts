import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@barterborsa/shared-security';
/**
 * Token yönetimi ve rotasyonundan sorumlu servis.
 */
export declare class TokenService {
    private readonly jwtService;
    private readonly redisService;
    constructor(jwtService: JwtService, redisService: RedisService);
    /**
     * 15 dakika ömürlü Access Token üretir.
     */
    generateAccessToken(user: {
        id: string;
        email: string;
        role: string;
        platform: string;
    }): Promise<string>;
    /**
     * 7 gün ömürlü Refresh Token üretir.
     */
    generateRefreshToken(user: {
        id: string;
        email: string;
    }): Promise<string>;
    /**
     * Token'ı Redis blacklist'e ekleyerek geçersiz kılar (Logout için).
     */
    blacklistToken(token: string, expiresInSeconds: number): Promise<void>;
    /**
     * Token'ın blacklist'te olup olmadığını kontrol eder.
     */
    isTokenBlacklisted(token: string): Promise<boolean>;
}
