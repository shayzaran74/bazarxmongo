export class DeleteBannerCommand {
  constructor(
    public readonly userId: string,
    public readonly bannerId: string,
  ) {}
}
