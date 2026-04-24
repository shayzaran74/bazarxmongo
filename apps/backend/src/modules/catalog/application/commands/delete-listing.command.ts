export class DeleteListingCommand {
  constructor(
    public readonly userId: string,
    public readonly userRole: string | string[],
    public readonly id: string
  ) {}
}
