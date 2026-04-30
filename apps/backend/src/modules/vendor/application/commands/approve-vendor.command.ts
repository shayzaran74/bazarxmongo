export class ApproveVendorCommand {
  constructor(
    public readonly vendorId: string,
    public readonly adminId: string,
  ) {}
}
