export class ActivateOneFreeCommand {
  constructor(
    public readonly userId:     string,
    public readonly purchaseId: string,
  ) {}
}
