// apps/backend/src/modules/bazarxgo/application/commands/validate-coupon.command.ts

export class ValidateGoCouponCommand {
  constructor(
    public readonly code: string,
    public readonly orderAmount: string,
  ) {}
}
