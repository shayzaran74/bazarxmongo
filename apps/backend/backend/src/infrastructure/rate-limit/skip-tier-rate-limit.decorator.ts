// apps/backend/src/infrastructure/rate-limit/skip-tier-rate-limit.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const SKIP_TIER_RATE_LIMIT = 'skipTierRateLimit';

/** Admin endpoint'leri veya public route'lar için tier rate limit'i devre dışı bırakır. */
export const SkipTierRateLimit = () => SetMetadata(SKIP_TIER_RATE_LIMIT, true);
