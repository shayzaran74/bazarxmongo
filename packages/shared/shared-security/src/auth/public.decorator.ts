// packages/shared/shared-security/src/auth/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

/**
 * Bu decorator ile işaretlenen route'lar kimlik doğrulaması gerektirmez.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
