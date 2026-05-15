// apps/backend/src/modules/barter/application/commands/offboard-vendor.command.ts
// Master Plan v4.3 §3.4 — Çıkış Mekanizması
// Sistemden ayrılırken XP komisyon payı 90 gün kullanılabilir; kalan silinir.

export class OffboardVendorCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly vendorId:    string,
    public readonly reason?:     string,
  ) {}
}
