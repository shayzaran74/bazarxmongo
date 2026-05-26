// apps/backend/src/modules/vendor/application/commands/suspend-vendor.command.ts

export class SuspendVendorCommand {
  constructor(
    public readonly vendorId: string,
    public readonly reason: string,
    public readonly adminId: string,
  ) {}
}