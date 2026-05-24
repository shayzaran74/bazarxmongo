// apps/backend/src/modules/catalog/application/queries/get-favorites/get-favorites.handler.ts

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFavoritesQuery } from './get-favorites.query';
import { Favorite } from '@barterborsa/shared-persistence/schemas/backend/favorite.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';

@QueryHandler(GetFavoritesQuery)
export class GetFavoritesHandler implements IQueryHandler<GetFavoritesQuery> {
  async execute(query: GetFavoritesQuery) {
    const favorites = await Favorite.find({ userId: query.userId })
      .populate('product')
      .exec();

    return favorites.map(f => (f as unknown as { product: unknown }).product);
  }
}
