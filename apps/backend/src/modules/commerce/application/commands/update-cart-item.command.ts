export class UpdateCartItemCommand {
  constructor(
    public readonly itemId: string,
    public readonly quantity: number
  ) {}
}
