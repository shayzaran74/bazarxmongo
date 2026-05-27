// apps/backend/src/modules/menu/application/commands/purchase-menu.command.ts
// BazarX Go — Abonelik QR satın alımı (artık Listing üzerinden çalışır)

export class PurchaseMenuCommand {
  constructor(
    public readonly userId:        string,
    public readonly listingId:     string,   // BazarXMenu yerine Listing FK
    public readonly useMenuCredit: boolean = true, // aylık krediyi kullan
  ) {}
}
