// packages/shared/shared-nest/src/decorators/idempotent.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const IDEMPOTENT_KEY = 'idempotent_key';

/**
 * Bu dekoratör, bir metodun idempotent (tekrarlanabilir ama yan etkisiz) 
 * olması gerektiğini belirtir. Financial Service gibi hassas servislerde
 * mükerrer işlemleri önlemek için kullanılır.
 */
export const Idempotent = (options?: { ttl?: number }) => 
  SetMetadata(IDEMPOTENT_KEY, options || { ttl: 86400 }); // Varsayılan 24 saat
