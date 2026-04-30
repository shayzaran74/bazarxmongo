export class AdvanceLaunchPartnerPhaseCommand {
  constructor(
    public readonly restaurantId: string,
    public readonly adminId:      string,
    public readonly notes?:       string,
  ) {}
}
