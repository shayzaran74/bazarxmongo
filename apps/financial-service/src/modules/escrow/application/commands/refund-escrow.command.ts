
export class RefundEscrowCommand {
  constructor(
    public readonly orderId: string,
    public readonly reason?: string,
    public readonly idempotencyKey?: string
  ) {}
}
