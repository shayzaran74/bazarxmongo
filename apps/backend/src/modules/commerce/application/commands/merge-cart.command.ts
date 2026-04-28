// apps/backend/src/modules/commerce/application/commands/merge-cart.command.ts

export class MergeCartCommand {
  constructor(
    public readonly userId: string,
    public readonly guestItems: Array<{
      listingId: string;
      quantity: number;
    }>,
  ) {}
}
