// packages/domain-identity/src/application/queries/get-online-stats.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { IUser, ISession } from '@barterborsa/shared-persistence';
import { RedisService } from '@barterborsa/shared-security';
import { GetOnlineStatsQuery } from './get-online-stats.query';
import { OnlineStatsDto } from '../dtos/online-stats.dto';

const CACHE_KEY = 'admin:online-stats';
const CACHE_TTL_SECONDS = 60;

@QueryHandler(GetOnlineStatsQuery)
export class GetOnlineStatsHandler implements IQueryHandler<GetOnlineStatsQuery> {
  private readonly logger = new Logger(GetOnlineStatsHandler.name);

  constructor(
    @InjectModel('Session') private readonly sessionModel: Model<ISession>,
    @InjectModel('User')    private readonly userModel:    Model<IUser>,
    private readonly redis: RedisService,
  ) {}

  async execute(_query: GetOnlineStatsQuery): Promise<OnlineStatsDto> {
    // Önce Redis cache kontrol et
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as OnlineStatsDto;
    }

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Bugünün başlangıcı (UTC 00:00)
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    // 4 sorguyu paralel çalıştır
    const [onlineNow, activeToday, newTodayCount, totalActiveUsers] = await Promise.all([
      this.sessionModel.countDocuments({
        lastActiveAt: { $gte: fiveMinutesAgo },
      }),
      this.sessionModel.countDocuments({
        lastActiveAt: { $gte: startOfToday },
      }),
      this.userModel.countDocuments({
        createdAt: { $gte: startOfToday },
      }),
      this.userModel.countDocuments({
        status: 'ACTIVE',
        deletedAt: null,
      }),
    ]);

    const dto: OnlineStatsDto = {
      onlineNow,
      activeToday,
      newTodayCount,
      totalActiveUsers,
      cachedAt: new Date().toISOString(),
    };

    // Sonucu 60 saniye cache'le
    await this.redis.set(CACHE_KEY, JSON.stringify(dto), CACHE_TTL_SECONDS);
    this.logger.debug(`Online stats hesaplandı ve cache'lendi: onlineNow=${onlineNow}`);

    return dto;
  }
}
