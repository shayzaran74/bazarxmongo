export class DeleteAdminVendorCommand {
  constructor(public readonly vendorId: string, public readonly adminId: string) {}
}
