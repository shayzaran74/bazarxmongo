// apps/backend/src/modules/content/domain/value-objects/slug.vo.ts

import { ValueObject, Result, Ok, Err, DomainException } from '@barterborsa/shared-core';

interface SlugProps {
  value: string;
}

export class Slug extends ValueObject<SlugProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: SlugProps) {
    super(props);
  }

  public static create(text: string): Result<Slug, DomainException> {
    if (!text || text.trim().length === 0) {
      return Err(new DomainException('Slug cannot be empty'));
    }

    const trMap: Record<string, string> = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
    };

    const slugValue = text
      .replace(/[çğışöüÇĞİŞÖÜ]/g, match => trMap[match])
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return Ok(new Slug({ value: slugValue }));
  }
}
