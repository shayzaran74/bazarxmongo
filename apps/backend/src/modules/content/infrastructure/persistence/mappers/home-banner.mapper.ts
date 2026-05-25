// apps/backend/src/modules/content/infrastructure/persistence/mappers/home-banner.mapper.ts

import { HomeBanner } from '../../../domain/entities/home-banner.entity';

export class HomeBannerMapper {
  static toDomain(raw: Record<string, unknown>): HomeBanner {
    return HomeBanner.create({
      title: raw.title as string,
      description: raw.description as string | undefined,
      order: raw.order as number,
      buttonText: raw.buttonText as string | undefined,
      image: raw.image as string,
      isActive: raw.isActive as boolean,
      link: raw.link as string | undefined,
      platform: raw.platform as string,
      subtitle: raw.subtitle as string | undefined,
      tag: raw.tag as string | undefined,
      startDate: raw.startDate as Date | undefined,
      endDate: raw.endDate as Date | undefined,
    }, raw.id as string);
  }

  static toPersistence(domain: HomeBanner): Record<string, unknown> {
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
