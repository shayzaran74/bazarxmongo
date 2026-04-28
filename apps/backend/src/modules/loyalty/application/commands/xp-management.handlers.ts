// apps/backend/src/modules/loyalty/application/commands/xp-management.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EarnXpCommand } from './earn-xp.command';
import { SpendXpCommand } from './spend-xp.command';
import { 
  IUserLevelRepository, 
  IXpTransactionRepository, 
  IXpBatchRepository 
} from '../../domain/repositories/loyalty.repository.interfaces';
import { UserLevel } from '../../domain/entities/user-level.entity';
import { XpTransaction, XpBatch } from '../../domain/entities/loyalty-misc.entities';
import { LevelCalculatorService } from '../services/level-calculator.service';
import { SpendingLimitService } from '../services/spending-limit.service';
import { PrismaService } from '@barterborsa/shared-persistence';

@CommandHandler(EarnXpCommand)
export class EarnXpHandler implements ICommandHandler<EarnXpCommand> {
  constructor(
    @Inject('IUserLevelRepository') private readonly userLevelRepo: IUserLevelRepository,
    @Inject('IXpTransactionRepository') private readonly txRepo: IXpTransactionRepository,
    @Inject('IXpBatchRepository') private readonly batchRepo: IXpBatchRepository,
    private readonly levelCalc: LevelCalculatorService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: EarnXpCommand) {
    const { userId, amount, sourceType, referenceId, referenceType, metadata } = command;

    return await this.prisma.$transaction(async (tx) => {
      let userLevel = await this.userLevelRepo.findByUserId(userId);
      if (!userLevel) {
        userLevel = UserLevel.create(userId);
      }

      const transaction = XpTransaction.create({
        userId, amount, type: sourceType, referenceId, referenceType, metadata
      });
      await this.txRepo.save(transaction);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);
      const batch = XpBatch.create({
        accountId: userId,
        originalAmount: amount,
        sourceType,
        sourceRefId: referenceId,
        expiresAt
      });
      await this.batchRepo.save(batch);

      userLevel.addXp(amount);
      const newLevel = this.levelCalc.calculateLevel(userLevel.getProps().lifetimeXp);
      userLevel.setLevel(newLevel);

      await this.userLevelRepo.save(userLevel);
      return { success: true };
    });
  }
}

@CommandHandler(SpendXpCommand)
export class SpendXpHandler implements ICommandHandler<SpendXpCommand> {
  constructor(
    @Inject('IUserLevelRepository') private readonly userLevelRepo: IUserLevelRepository,
    @Inject('IXpTransactionRepository') private readonly txRepo: IXpTransactionRepository,
    @Inject('IXpBatchRepository') private readonly batchRepo: IXpBatchRepository,
    private readonly spendingLimitService: SpendingLimitService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: SpendXpCommand) {
    const { userId, amount, cartTotal, vendorTier, loyaltyTier } = command;

    return await this.prisma.$transaction(async (tx) => {
      const userLevel = await this.userLevelRepo.findByUserId(userId);
      if (!userLevel || userLevel.getProps().currentXp < amount) {
        throw new Error('Insufficient XP');
      }

      await this.spendingLimitService.validateSpending(userId, amount, cartTotal, vendorTier, loyaltyTier);

      const batches = await this.batchRepo.findAvailableBatches(userId);
      let remaining = amount;
      for (const batch of batches) {
        if (remaining <= 0) break;
        const deductAmount = Math.min(batch.getProps().currentBalance, remaining);
        batch.deduct(deductAmount);
        remaining -= deductAmount;
        await this.batchRepo.save(batch);
      }

      if (remaining > 0) throw new Error('Available batches count not satisfy spending');

      const transaction = XpTransaction.create({
        userId, amount: -amount, type: 'SPEND', description: 'XP used for purchase'
      });
      await this.txRepo.save(transaction);

      userLevel.spendXp(amount);
      await this.userLevelRepo.save(userLevel);

      return { success: true };
    });
  }
}
