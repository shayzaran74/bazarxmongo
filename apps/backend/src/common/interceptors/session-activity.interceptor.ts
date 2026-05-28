// apps/backend/src/common/interceptors/session-activity.interceptor.ts
// Her authenticated istekte session.lastActiveAt günceller (Redis debounce: 30s).
// Fire-and-forget — hata olursa request bloklanmaz.

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ISession } from '@barterborsa/shared-persistence';
import { RedisService } from '@barterborsa/shared-security';

interface AuthenticatedRequest {
  user?: { id: string };
}

@Injectable()
export class SessionActivityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SessionActivityInterceptor.name);

  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<ISession>,
    private readonly redis: RedisService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = req.user?.id;

    if (userId) {
      // Debounce: 30 saniyede bir güncelleme yap
      const debounceKey = `session-activity:${userId}`;
      this.redis.get(debounceKey).then(existing => {
        if (existing) return;

        // lastActiveAt güncelle — userId'ye ait tüm aktif session'ları güncelle
        this.sessionModel
          .updateMany({ userId }, { $set: { lastActiveAt: new Date() } })
          .exec()
          .catch((err: Error) => {
            this.logger.warn(`Session activity update başarısız: ${err.message}`);
          });

        // 30 saniye boyunca aynı kullanıcı için tekrar güncelleme yapma
        this.redis.set(debounceKey, '1', 30).catch((err: Error) => {
          this.logger.warn(`Redis debounce set başarısız: ${err.message}`);
        });
      }).catch((err: Error) => {
        this.logger.warn(`Redis debounce get başarısız: ${err.message}`);
      });
    }

    return next.handle();
  }
}
