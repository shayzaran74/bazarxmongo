export class UpdateAdminVendorCommand {
  constructor(
    public readonly vendorId: string,
    public readonly data: {
      isFeatured?: boolean;
      storeName?: string;
      description?: string;
      city?: string;
      district?: string;
      [key: string]: any;
    }
  ) {}
}
