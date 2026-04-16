// apps/backend/src/modules/catalog/application/queries/get-listings/get-listings.query.ts
export class GetListingsQuery {
  constructor(
    readonly filters: {
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    } = {},
  ) {}
}
