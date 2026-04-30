export class DeleteBrandCommand {
  constructor(
    public readonly userId: string,
    public readonly brandId: string,
  ) {}
}
