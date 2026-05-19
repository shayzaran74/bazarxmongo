import { Injectable } from '@nestjs/common';
import { Session as SessionModel } from '@barterborsa/shared-persistence';

@Injectable()
export class SessionService {

  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    return SessionModel.create({
      userId,
      userAgent,
      ipAddress,
      lastActiveAt: new Date()
    });
  }

  async invalidateSession(sessionId: string) {
    await SessionModel.deleteOne({ id: sessionId }).exec();
  }

  async invalidateAllUserSessions(userId: string) {
    await SessionModel.deleteMany({ userId }).exec();
  }
}
