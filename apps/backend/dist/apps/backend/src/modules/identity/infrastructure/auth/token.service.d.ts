import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@barterborsa/shared-security';
export declare class TokenService {
    private readonly jwtService;
    private readonly redisService;
    constructor(jwtService: JwtService, redisService: RedisService);
    generateAccessToken(user: {
        id: string;
        email: string;
        role: string;
        platform: string;
    }): Promise<string>;
    generateRefreshToken(user: {
        id: string;
        email: string;
    }): Promise<string>;
    verifyRefreshToken(token: string): Promise<any>;
    blacklistToken(token: string, expiresInSeconds: number): Promise<void>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    revokeRefreshToken(token: string): Promise<void>;
}
