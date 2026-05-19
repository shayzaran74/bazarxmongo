import { PrismaService } from '@barterborsa/shared-persistence';
import { RedisService } from '@barterborsa/shared-security';
export declare class SessionService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<{
        id: string;
        userId: string;
        userAgent: string;
        ipAddress: string;
        lastActiveAt: Date;
        createdAt: Date;
        tokenHash: string;
    }>;
    invalidateSession(sessionId: string): Promise<void>;
    invalidateAllUserSessions(userId: string): Promise<void>;
}
