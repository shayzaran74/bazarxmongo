// apps/backend/src/modules/content/infrastructure/persistence/mappers/home-quad-card.mapper.ts

import { HomeQuadCard } from '../../../domain/entities/home-quad-card.entity';
import { HomeQuadCardItem } from '../../../domain/entities/home-quad-card-item.entity';

export interface HomeQuadCardItemRaw {
  id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  productId?: string;
  order?: number;
}

export interface HomeQuadCardRaw {
  id?: string;
  title?: string;
  order?: number;
  isActive?: boolean;
  platform?: string;
  items?: HomeQuadCardItemRaw[];
}

export class HomeQuadCardMapper {
  static toDomain(raw: HomeQuadCardRaw): HomeQuadCard {
    const items: HomeQuadCardItem[] = (raw.items || []).map((item: HomeQuadCardItemRaw) =>
      HomeQuadCardItem.create({
        title: item.title ?? '',
        image: item.image ?? '',
        link: item.link,
        productId: item.productId,
        order: item.order ?? 0,
        quadCardId: raw.id ?? '',
      }, item.id || '')
    );

    return HomeQuadCard.create({
      title: raw.title ?? '',
      order: raw.order ?? 0,
      isActive: raw.isActive ?? true,
      platform: raw.platform ?? '',
      items,
    }, raw.id || '');
  }

  static toPersistence(domain: HomeQuadCard): Record<string, unknown> {
    const props = domain.getProps();
    return {
      id: domain.id.toString(),
      title: props.title,
      order: props.order,
      isActive: props.isActive,
      platform: props.platform,
      items: (props.items || []).map((item: HomeQuadCardItem | Record<string, unknown>) => {
        const itemProps = typeof item.getProps === 'function' ? item.getProps() : item as Record<string, unknown>;
        return {
          id: (item as { id?: string }).id,
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