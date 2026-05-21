// apps/backend/src/modules/vendor/application/commands/update-vendor-profile.command.ts
export class UpdateVendorProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly data:   Record<string, unknown>,
  ) {}
}
