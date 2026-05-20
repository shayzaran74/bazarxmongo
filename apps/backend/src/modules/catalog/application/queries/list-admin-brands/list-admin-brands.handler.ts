// apps/backend/src/modules/catalog/application/queries/list-admin-brands/list-admin-brands.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAdminBrandsQuery } from './list-admin-brands.query';
import { Brand } from '@barterborsa/shared-persistence/schemas/backend/brand.schema';

@QueryHandler(ListAdminBrandsQuery)
export class ListAdminBrandsHandler implements IQueryHandler<ListAdminBrandsQuery> {
  async execute(query: ListAdminBrandsQuery) {
    const { search, status, letter, page = 1, limit = 50 } = query.filters;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status) filter.status = status;
    if (letter && letter !== 'ALL') filter.name = { ...filter.name, $regex: `^${letter}`, $options: 'i' };

    const [rawItems, total, pending] = await Promise.all([
      Brand.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Brand.countDocuments(filter).exec(),
      Brand.countDocuments({ status: 'PENDING' }).exec()
    ]);

    // Normalize: bazı markalar id alanı olmadan sadece _id ile kaydedilmiş
    const items = rawItems.map((b: any) => ({
      ...b,
      id: b.id || b._id?.toString(),
    }));

    return { items, total, pending, page, limit };
  }
}
