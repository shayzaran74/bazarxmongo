export class ReinstateVendorCommand {
  constructor(
    public readonly vendorId: string,
    public readonly adminId: string,
  ) {}
}
