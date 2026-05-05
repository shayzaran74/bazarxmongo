// apps/backend/src/modules/commerce/application/queries/get-order-details.query.ts

export class GetOrderDetailsQuery {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
  ) {}
}
