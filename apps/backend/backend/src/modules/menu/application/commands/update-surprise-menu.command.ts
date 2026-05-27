// apps/backend/src/modules/menu/application/commands/update-surprise-menu.command.ts
export interface SurpriseMenuTimeBlock { start: string; end: string }

export class UpdateSurpriseMenuCommand {
  constructor(
    public readonly vendorId:     string,
    public readonly listingId:    string,
    public readonly isActive:     boolean,
    public readonly activeHours:  SurpriseMenuTimeBlock[],
    public readonly dailyQuota:   number,
    public readonly radiusMeters: number,
  ) {}
}
