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

    const slugValue = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return Ok(new Slug({ value: slugValue }));
  }
}
