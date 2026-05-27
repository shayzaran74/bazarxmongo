export class AddEcosystemMemberCommand {
  constructor(
    public readonly userId: string,
    public readonly memberVendorId: string
  ) {}
}
