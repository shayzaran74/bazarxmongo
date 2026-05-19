// apps/backend/src/modules/catalog/application/queries/list-admin-brands/list-admin-brands.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAdminBrandsQuery } from './list-admin-brands.query';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';

@QueryHandler(ListAdminBrandsQuery)
export class ListAdminBrandsHandler implements IQueryHandler<ListAdminBrandsQuery> {
  async execute(query: ListAdminBrandsQuery) {
    const { search, page = 1, limit = 50 } = query.filters;
    const skip = (page - 1) * limit;
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};

    const [items, total] = await Promise.all([
      Brand.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Brand.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }
}
