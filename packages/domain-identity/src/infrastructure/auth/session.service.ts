import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { RedisService } from '@barterborsa/shared-security'; // or wherever it is

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService
  ) {}

  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    return this.prisma.session.create({
      data: {
        userId,
        userAgent,
        ipAddress,
        lastActiveAt: new Date()
      }
    });
  }

  async invalidateSession(sessionId: string) {
    await this.prisma.session.delete({ where: { id: sessionId } });
  }

  async invalidateAllUserSessions(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
