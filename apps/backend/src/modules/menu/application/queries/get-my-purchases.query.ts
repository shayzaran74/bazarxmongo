export class GetMyPurchasesQuery {
  constructor(
    public readonly userId:      string,
    public readonly activeOnly:  boolean = true,
  ) {}
}
