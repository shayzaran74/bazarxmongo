// apps/backend/src/modules/catalog/domain/value-objects/slug.vo.ts

import { ValueObject, Result, Ok, Err } from '@barterborsa/shared-core';

interface SlugProps {
  value: string;
}

export class Slug extends ValueObject<SlugProps> {
  private constructor(props: SlugProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(slug: string): Result<Slug> {
    if (!slug || slug.length < 3) {
      return Err(new Error('Slug en az 3 karakter olmalıdır.'));
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return Err(new Error('Geçersiz slug formatı.'));
    }

    return Ok(new Slug({ value: slug }));
  }

  public static fromText(text: string): Slug {
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return new Slug({ value: slug });
  }
}
