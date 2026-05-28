// packages/domain-identity/src/application/dtos/online-stats.dto.ts

export class OnlineStatsDto {
  onlineNow!: number;
  activeToday!: number;
  newTodayCount!: number;
  totalActiveUsers!: number;
  cachedAt!: string; // ISO timestamp — verinin Redis'ten mi yoksa DB'den mi geldiğini gösterir
}
