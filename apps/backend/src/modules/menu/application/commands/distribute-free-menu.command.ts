// apps/backend/src/modules/menu/application/commands/distribute-free-menu.command.ts
// BazarX Go: restaurantId/menuId → vendorId/listingId

export class DistributeFreeMenuCommand {
  constructor(
    public readonly vendorId:  string,
    public readonly listingId: string,
    public readonly userIds:   string[],
    public readonly adminId:   string,
  ) {}
}
