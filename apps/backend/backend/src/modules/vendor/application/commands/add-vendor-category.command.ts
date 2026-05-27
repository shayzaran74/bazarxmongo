export class AddVendorCategoryCommand {
  constructor(
    public readonly vendorId: string,
    public readonly categoryId: string
  ) {}
}
