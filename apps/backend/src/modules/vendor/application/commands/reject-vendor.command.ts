export class RejectVendorCommand {
  constructor(
    public readonly vendorId: string,
    public readonly rejectionReason: string,
    public readonly adminId: string,
  ) {}
}
