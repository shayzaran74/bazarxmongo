export class PurchaseMenuCommand {
  constructor(
    public readonly userId:         string,
    public readonly menuId:         string,
    public readonly useMenuCredit:  boolean = true, // aylık krediyi kullan
  ) {}
}
