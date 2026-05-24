// apps/backend/src/modules/menu/application/commands/create-gift-card-on-membership.handler.ts
// Düzeltme 3: Üyelik aktivasyonunda %50 hediye kartı oluştur

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IGiftCard } from '@barterborsa/shared-persistence/schemas/financial/giftCard.schema';
import { CreateGiftCardOnMembershipCommand } from './create-gift-card-on-membership.command';
import { QrGeneratorService } from '../services/qr-generator.service';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

@CommandHandler(CreateGiftCardOnMembershipCommand)
export class CreateGiftCardOnMembershipHandler implements ICommandHandler<CreateGiftCardOnMembershipCommand> {
  private readonly logger = new Logger(CreateGiftCardOnMembershipHandler.name);

  constructor(
    @InjectModel('GiftCard') private readonly giftCardModel: Model<IGiftCard>,
    private readonly qr: QrGeneratorService,
  ) {}

  async execute(cmd: CreateGiftCardOnMembershipCommand): Promise<{ giftCardId: string; code: string; value: number }> {
    const { userId, membershipId, aidatAmount, membershipEndsAt } = cmd;

    // %50 hediye kartı — floor aşağı
    const giftCardValue = Math.floor(aidatAmount * 0.50);
    const expiresAt = addDays(membershipEndsAt, 30);
    const code = this.qr.generate();

    const newId = new Types.ObjectId().toString();
    await this.giftCardModel.create([{
      _id: newId,
      id: newId,
      code,
      currentValue: Types.Decimal128.fromString(giftCardValue.toString()),
      initialValue: Types.Decimal128.fromString(giftCardValue.toString()),
      customerId: userId,
      status: 'Active',
      giftCardSource: 'MEMBERSHIP_ACTIVATION',
      membershipId,
      activationPercent: 50,
      expiresAt,
    }]);

    this.logger.log(
      `Hediye kartı oluşturuldu: userId=${userId} membershipId=${membershipId} value=${giftCardValue}`,
    );

    return { giftCardId: newId, code, value: giftCardValue };
  }
}