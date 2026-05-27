// apps/backend/src/modules/commerce/infrastructure/persistence/mappers/cart.mapper.ts
// CartMapper — Prisma → Mongoose (ADR-005 Faz 2a)

import { ICart } from '@barterborsa/shared-persistence/schemas/backend/cart.schema';
import { Cart, CartProps } from '../../../domain/entities/cart.entity';
import { CartItem } from '../../../domain/entities/cart-item.entity';

export interface CartDocument extends ICart {
  _id?: string;
}

export class CartMapper {
  public static toDomain(doc: CartDocument): Cart {
    const props: CartProps = {
      userId: doc.userId,
      items: [],
    };

    return Cart.fromPersistence(props, doc.id);
  }

  public static toPersistence(domain: Cart): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      userId: props.userId,
    };
  }
}