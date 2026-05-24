// apps/backend/src/modules/loyalty/application/commands/xp-management.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EarnXpCommand }  from './earn-xp.command';
import { SpendXpCommand } from './spend-xp.command';
import {
  IUserLevelRepository,
  IXpTransactionRepository,
  IXpBatchRepository,
} from '../../domain/repositories/loyalty.repository.interfaces';
import { UserLevel }                from '../../domain/entities/user-level.entity';
import { XpTransaction, XpBatch }   from '../../domain/entities/loyalty-misc.entities';
import { LevelCalculatorService }   from '../services/level-calculator.service';
import { SpendingLimitService }     from '../services/spending-limit.service';
import { XpRulesService }           from '../services/xp-rules.service';
import { Logger }                   from '@nestjs/common';

@CommandHandler(EarnXpCommand)
export class EarnXpHandler implements ICommandHandler<EarnXpCommand> {
  private readonly logger = new Logger(EarnXpHandler.name);

  constructor(
    @Inject('IUserLevelRepository')    private readonly userLevelRepo: IUserLevelRepository,
    @Inject('IXpTransactionRepository')private readonly txRepo:        IXpTransactionRepository,
    @Inject('IXpBatchRepository')      private readonly batchRepo:     IXpBatchRepository,
    private readonly levelCalc: LevelCalculatorService,
    private readonly xpRules: XpRulesService,
  ) {}

  async execute(command: EarnXpCommand) {
    const { userId, amount, sourceType, referenceId, referenceType, metadata } = command;

    // İlk işlem kontrolü — ilk siparişte XP kazanılmaz
    const isFirstOrder = await this.xpRules.checkFirstOrderBlock(userId);
    if (isFirstOrder) {
      this.logger.debug('İlk işlem — XP kazanımı engellendi', { userId });
      return { success: true, blocked: true };
    }

    let userLevel = await this.userLevelRepo.findByUserId(userId);
    if (!userLevel) userLevel = UserLevel.create(userId);

    const transaction = XpTransaction.create({ userId, amount, type: sourceType, referenceId, referenceType, metadata });
    await this.txRepo.save(transaction);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);
    const batch = XpBatch.create({
      accountId: userId, originalAmount: amount,
      sourceType, sourceRefId: referenceId, expiresAt,
    });
    await this.batchRepo.save(batch);

    userLevel.addXp(amount);
    const newLevel = this.levelCalc.calculateLevel(userLevel.getProps().lifetimeXp);
    userLevel.setLevel(newLevel);

    await this.userLevelRepo.save(userLevel);
    return { success: true };
  }
}

@CommandHandler(SpendXpCommand)
export class SpendXpHandler implements ICommandHandler<SpendXpCommand> {
  constructor(
    @Inject('IUserLevelRepository')    private readonly userLevelRepo:   IUserLevelRepository,
    @Inject('IXpTransactionRepository')private readonly txRepo:          IXpTransactionRepository,
    @Inject('IXpBatchRepository')      private readonly batchRepo:       IXpBatchRepository,
    private readonly spendingLimitService: SpendingLimitService,
  ) {}

  async execute(command: SpendXpCommand) {
    const { userId, amount, cartTotal, vendorTier, loyaltyTier } = command;

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

    if (remaining > 0) throw new Error('Available batches cannot satisfy spending');

    const transaction = XpTransaction.create({ userId, amount: -amount, type: 'SPEND', description: 'XP used for purchase' });
    await this.txRepo.save(transaction);

    userLevel.spendXp(amount);
    await this.userLevelRepo.save(userLevel);

    return { success: true };
  }
}
