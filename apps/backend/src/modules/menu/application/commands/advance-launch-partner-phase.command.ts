// apps/backend/src/modules/menu/application/commands/advance-launch-partner-phase.command.ts
// BazarX Go: LaunchPartner artık vendorId kullanıyor

export class AdvanceLaunchPartnerPhaseCommand {
  constructor(
    public readonly vendorId: string,
    public readonly adminId:  string,
    public readonly notes?:   string,
  ) {}
}
