export class RemoveVendorCategoryCommand {
  constructor(
    public readonly vendorId: string,
    public readonly categoryId: string
  ) {}
}
