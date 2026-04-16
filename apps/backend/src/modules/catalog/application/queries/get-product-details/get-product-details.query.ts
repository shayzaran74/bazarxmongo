// apps/backend/src/modules/catalog/application/queries/get-product-details/get-product-details.query.ts
export class GetProductDetailsQuery {
  constructor(
    // UUID veya slug olabilir — handler findByIdOrSlug ile çözer
    readonly idOrSlug: string,
  ) {}
}
