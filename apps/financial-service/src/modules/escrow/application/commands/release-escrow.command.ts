
import { Decimal } from 'decimal.js';

export class ReleaseEscrowCommand {
  constructor(
    public readonly orderId: string,
    public readonly idempotencyKey?: string
  ) {}
}
