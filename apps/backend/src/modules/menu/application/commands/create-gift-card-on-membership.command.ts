// apps/backend/src/modules/menu/application/commands/create-gift-card-on-membership.command.ts
// Düzeltme 3: Üyelik aktivasyonunda %50 hediye kartı oluştur

import { ICommand } from '@nestjs/cqrs';

export class CreateGiftCardOnMembershipCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly membershipId: string,
    readonly aidatAmount: number,
    readonly membershipEndsAt: Date,
  ) {}
}