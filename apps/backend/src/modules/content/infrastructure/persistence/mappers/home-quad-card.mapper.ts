// apps/backend/src/modules/content/infrastructure/persistence/mappers/home-quad-card.mapper.ts

import { HomeQuadCard } from '../../../domain/entities/home-quad-card.entity';
import { HomeQuadCardItem } from '../../../domain/entities/home-quad-card-item.entity';

export class HomeQuadCardMapper {
  static toDomain(raw: any): HomeQuadCard {
    const items: HomeQuadCardItem[] = (raw.items || []).map((item: any) =>
      HomeQuadCardItem.create({
        title: item.title,
        image: item.image,
        link: item.link,
        productId: item.productId,
        order: item.order,
        quadCardId: raw.id,
      }, item.id)
    );

    return HomeQuadCard.create({
      title: raw.title,
      order: raw.order,
      isActive: raw.isActive,
      platform: raw.platform,
      items,
    }, raw.id);
  }

  static toPersistence(domain: HomeQuadCard): any {
    const props = domain.getProps();
    return {
      id: domain.id.toString(),
      title: props.title,
      order: props.order,
      isActive: props.isActive,
      platform: props.platform,
      items: (props.items || []).map((item: any) => {
        const itemProps = typeof item.getProps === 'function' ? item.getProps() : item;
        return {
          id: item.id,
          title: itemProps.title,
          subtitle: itemProps.subtitle,
          image: itemProps.image,
          link: itemProps.link,
          productId: itemProps.productId,
          order: itemProps.order,
        };
      }),
    };
  }
}