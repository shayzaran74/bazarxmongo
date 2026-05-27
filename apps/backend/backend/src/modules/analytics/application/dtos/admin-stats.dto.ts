// apps/backend/src/modules/analytics/application/dtos/admin-stats.dto.ts

export class AdminStatsDto {
  users!: {
    total: number;
    newLast24h: number;
    active: number;
  };
  vendors!: {
    total: number;
    pending: number;
    active: number;
  };
  catalog!: {
    totalProducts: number;
    totalCategories: number;
    totalListings: number;
    totalAuctions: number;
    totalLotteries: number;
  };
  sales!: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  };
}
