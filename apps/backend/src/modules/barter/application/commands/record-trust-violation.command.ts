export type ViolationType = 'PRICE_FLOOR' | 'QUOTA_EXCEEDED' | 'INACTIVE' | 'SUSPICIOUS_ACTIVITY';

export class RecordTrustViolationCommand {
  constructor(
    public readonly vendorId:      string,
    public readonly violationType: ViolationType,
    public readonly description:   string,
    public readonly adminId:       string,
  ) {}
}
