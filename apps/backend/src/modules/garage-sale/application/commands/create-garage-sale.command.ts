// apps/backend/src/modules/garage-sale/application/commands/create-garage-sale.command.ts
// Master Plan v4.3 §4.4 — Garaj Günü oluşturma komutu (sadece APEX fabrika).

export interface CreateGarageSaleDto {
  ecosystemId: string;
  listingId: string;
  normalPrice: string;        // Decimal string (örn: "1500.00") — float yasak
  discountRate: number;        // 0 < r < 1
  maxTotalQty: number;
  maxQtyPerDealer: number;
  startsAt: string | Date;
  endsAt: string | Date;
}

export class CreateGarageSaleCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: CreateGarageSaleDto,
  ) {}
}
