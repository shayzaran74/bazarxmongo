// apps/backend/src/modules/vendor/application/queries/get-ecosystem-dashboard.query.ts
// Master Plan v4.3 §4 — Marka Yönetim Paneli: bayi TrustScore + stok hareketleri

export class GetEcosystemDashboardQuery {
  constructor(
    public readonly actorUserId: string,
    public readonly ecosystemId: string,
  ) {}
}
