// apps/backend/src/modules/subscription/application/commands/downgrade-tier.command.ts
// Master Plan v4.3 §2.7 — Tier düşürme (downgrade) komutu.
// Kullanıcı isteğiyle veya ödeme başarısızlığı sonucu tetiklenir.

import { SubscriptionTier } from '../../../loyalty/domain/enums/loyalty.enums';

export class DowngradeTierCommand {
  constructor(
    public readonly userId: string,
    public readonly newTier: SubscriptionTier,
    public readonly reason: 'USER_REQUESTED' | 'PAYMENT_FAILED' | 'ADMIN_FORCED' = 'USER_REQUESTED',
  ) {}
}
