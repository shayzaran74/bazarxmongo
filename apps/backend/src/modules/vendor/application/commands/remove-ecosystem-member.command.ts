// apps/backend/src/modules/vendor/application/commands/remove-ecosystem-member.command.ts

export class RemoveEcosystemMemberCommand {
  constructor(
    public readonly userId: string,
    public readonly memberVendorId: string,
    public readonly ecosystemId: string,
  ) {}
}
