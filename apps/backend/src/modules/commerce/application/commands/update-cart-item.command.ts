export class UpdateCartItemCommand {
  constructor(
    public readonly userId: string,
    public readonly itemId: string,
    public readonly quantity: number
  ) {}
}
