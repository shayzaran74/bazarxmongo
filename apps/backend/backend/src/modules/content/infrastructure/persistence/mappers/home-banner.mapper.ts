// apps/backend/src/modules/content/infrastructure/persistence/mappers/home-banner.mapper.ts

import { HomeBanner } from '../../../domain/entities/home-banner.entity';

export class HomeBannerMapper {
  static toDomain(raw: any): HomeBanner {
    return HomeBanner.create({
      title: raw.title,
      description: raw.description || undefined,
      order: raw.order,
      buttonText: raw.buttonText || undefined,
      image: raw.image,
      isActive: raw.isActive,
      link: raw.link || undefined,
      platform: raw.platform,
      subtitle: raw.subtitle || undefined,
      tag: raw.tag || undefined,
      startDate: raw.startDate || undefined,
      endDate: raw.endDate || undefined,
    }, raw.id);
  }

  static toPersistence(domain: HomeBanner): any {
    const props = domain.getProps();
    return {
      id: domain.id.toString(),
      title: props.title,
      description: props.description,
      order: props.order,
      buttonText: props.buttonText,
      image: props.image,
      isActive: props.isActive,
      link: props.link,
      platform: props.platform,
      subtitle: props.subtitle,
      tag: props.tag,
      startDate: props.startDate,
      endDate: props.endDate,
    };
  }
}
