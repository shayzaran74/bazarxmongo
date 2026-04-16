// apps/backend/src/modules/catalog/application/queries/get-product-by-slug/get-product-by-slug.handler.ts
import { IQueryHandler, QueryHandler, QueryBus } from '@nestjs/cqrs';
import { GetProductBySlugQuery } from './get-product-by-slug.query';
import { GetProductDetailsQuery } from '../get-product-details/get-product-details.query';
import { ProductDetailsDto } from '../../dtos/catalog-response.dtos';

// GetProductBySlug, GetProductDetails'ın slug versiyonu.
// Mantığı tekrar yazmak yerine QueryBus üzerinden delegate ediyoruz.
// findByIdOrSlug zaten slug'ı destekliyor — ek DB sorgusu yok.
@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugHandler
  implements IQueryHandler<GetProductBySlugQuery, ProductDetailsDto>
{
  constructor(private readonly queryBus: QueryBus) {}

  execute({ slug }: GetProductBySlugQuery): Promise<ProductDetailsDto> {
    return this.queryBus.execute(new GetProductDetailsQuery(slug));
  }
}
