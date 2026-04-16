// apps/backend/src/modules/analytics/application/dtos/vendor-stats.dto.ts

export class VendorStatsDto {
  products!: {
    total: number;
    active: number;
    outOfStock: number;
  };
  sales!: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    shippedOrders: number;
  };
  customers!: {
    totalFollowers: number;
    reviewCount: number;
    averageRating: number;
  };
  performance!: {
    returnRate: number;
    cancellationRate: number;
  };
}
