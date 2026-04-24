export class UpdateListingCommand {
  constructor(
    public readonly userId: string,
    public readonly userRole: string | string[],
    public readonly id: string,
    public readonly dto: any
  ) {}
}
