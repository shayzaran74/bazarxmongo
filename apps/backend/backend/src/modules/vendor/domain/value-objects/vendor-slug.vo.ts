// apps/backend/src/modules/vendor/domain/value-objects/vendor-slug.vo.ts

import { ValueObject } from '@barterborsa/shared-core';
import { Result, Ok, Err } from '@barterborsa/shared-core';
import { DomainException } from '@barterborsa/shared-core';

interface VendorSlugProps {
  value: string;
}

export class VendorSlug extends ValueObject<VendorSlugProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: VendorSlugProps) {
    super(props);
  }

  public static create(value: string): Result<VendorSlug, DomainException> {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(value)) {
      return Err(new DomainException('Geçersiz slug formatı. Sadece küçük harf, rakam ve tire içerebilir.'));
    }
    return Ok(new VendorSlug({ value }));
  }

  public static fromStoreName(name: string): VendorSlug {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return new VendorSlug({ value: slug });
  }
}
