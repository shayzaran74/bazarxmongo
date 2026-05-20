// apps/backend/src/modules/garage-sale/application/commands/purchase-from-garage-sale.command.ts

export class PurchaseFromGarageSaleCommand {
  constructor(
    public readonly userId: string,         // İstek atan kullanıcı (bayi vendor user'ı)
    public readonly garageSaleId: string,
    public readonly quantity: number,
  ) {}
}
