// packages/domain-identity/src/domain/services/user-projection.service.interface.ts
// Kullanıcı projeksiyonu için domain boundary'yi koruyan sözleşme.
// Implementasyon Identity uygulama katmanında — $lookup aggregation ile tek sorgu.

import type { UserFullDto } from '../../application/dtos/user-full.dto';

export interface IUserProjectionService {
  getFullProfile(userId: string): Promise<UserFullDto | null>;
}
