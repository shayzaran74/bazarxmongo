// apps/backend/src/modules/catalog/application/queries/get-product-stats.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductStatsQuery } from './get-product-stats.query';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';

@QueryHandler(GetProductStatsQuery)
export class GetProductStatsHandler implements IQueryHandler<GetProductStatsQuery> {
  async execute() {
    const [total, active, pending] = await Promise.all([
      CatalogProduct.countDocuments(),
      Listing.countDocuments({ status: 'ACTIVE' }),
      Listing.countDocuments({ status: 'PENDING' }),
    ]);

    return { total, active, pending };
  }
}
