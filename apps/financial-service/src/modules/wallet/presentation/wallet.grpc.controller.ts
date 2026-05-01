import { Controller, Inject, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { GetBalanceQuery } from '../application/queries/get-balance.query';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { TopUpWalletCommand } from '../application/commands/topup-wallet.command';
import { Decimal } from 'decimal.js';
import { PaymentMethod, TopUpStatus, WithdrawalStatus } from '../../../generated/client';

import { ApproveTopUpCommand } from '../application/commands/approve-topup.command';
import { RejectTopUpCommand } from '../application/commands/reject-topup.command';
import { GetTransactionsQuery } from '../application/queries/get-transactions.query';
import { Wallet } from '../domain/entities/wallet.entity';
import { IWalletRepository } from '../domain/repositories/wallet.repository.interface';

interface TopUpRequestFilter {
  userId?: string;
  status?: TopUpStatus;
}

interface WithdrawalRequestFilter {
  userId?: string;
  status?: WithdrawalStatus;
}

function extractError(error: unknown): string {
  return error instanceof Error ? error.message : 'Bilinmeyen hata oluştu.';
}

@Controller()
export class WalletGrpcController {
  private readonly logger = new Logger(WalletGrpcController.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
  ) {}

  @GrpcMethod('FinancialService', 'GetTransactions')
  async getTransactions(data: {
    userId: string;
    accountType?: string;
    page?: number;
    limit?: number;
    accountId?: string;
  }) {
    return this.queryBus.execute(
      new GetTransactionsQuery(
        data.userId,
        data.accountType,
        data.page || 1,
        data.limit || 20,
        data.accountId,
      ),
    );
  }

  @GrpcMethod('FinancialService', 'ProcessWalletRequest')
  async processWalletRequest(data: {
    requestId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    try {
      if (data.action === 'approve') {
        await this.commandBus.execute(new ApproveTopUpCommand(data.requestId, data.adminId));
      } else {
        await this.commandBus.execute(
          new RejectTopUpCommand(data.requestId, data.adminId, data.reason || ''),
        );
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'GetWallet')
  async getWallet(data: { userId: string }) {
    this.logger.log({ userId: data.userId }, '[GetWallet] İstek alındı.');

    // 1. Cüzdan entity'si — bakiye için kaynak
    let walletEntity = await this.walletRepository.findByUserId(data.userId);
    if (!walletEntity) {
      walletEntity = Wallet.create(data.userId);
      await this.walletRepository.save(walletEntity);
    }

    // 2. Account kayıtları — hesap ID ve tipleri için kaynak
    let accounts = await this.prisma.account.findMany({
      where: { userId: data.userId },
    });

    if (accounts.length === 0) {
      this.logger.log(
        { userId: data.userId },
        '[GetWallet] Hesap bulunamadı, varsayılan hesaplar oluşturuluyor.',
      );
      await this.prisma.account.createMany({
        data: [
          { userId: data.userId, type: 'MAIN', currency: 'TRY' },
          { userId: data.userId, type: 'BARTER', currency: 'BARTER' },
          { userId: data.userId, type: 'XP_COMMISSION', currency: 'TRY' },
          { userId: data.userId, type: 'XP_ADS', currency: 'TRY' },
        ],
      });
      accounts = await this.prisma.account.findMany({
        where: { userId: data.userId },
      });
    }

    const [topupRequests, withdrawalRequests, giftCards] = await Promise.all([
      this.prisma.accountTopUpRequest.findMany({
        where: { userId: data.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.accountWithdrawalRequest.findMany({
        where: { userId: data.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.giftCard.findMany({
        where: { customerId: data.userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    this.logger.log(
      { userId: data.userId, accountCount: accounts.length, balanceTL: walletEntity.balanceTL.amount.toString() },
      '[GetWallet] Hesap verileri hazırlandı.',
    );

    return {
      accounts: accounts.map(acc => {
        // MAIN ve BARTER hesapları için bakiye Wallet entity'den alınır
        let balance = acc.balance.toString();
        let available = acc.availableBalance.toString();

        if (acc.type === 'MAIN') {
          balance = walletEntity.balanceTL.amount.toString();
          available = walletEntity.balanceTL.amount
            .minus(new Decimal(acc.blockedBalance.toString()))
            .toString();
        } else if (acc.type === 'BARTER') {
          balance = walletEntity.barterBalance.amount.toString();
          available = walletEntity.barterBalance.amount
            .minus(new Decimal(acc.blockedBalance.toString()))
            .toString();
        }

        return {
          id: acc.id,
          type: acc.type,
          balance,
          availableBalance: available,
          blockedBalance: acc.blockedBalance.toString(),
          currency: acc.currency,
        };
      }),
      requests: topupRequests.map(req => ({
        id: req.id,
        userId: req.userId,
        type: 'TOPUP',
        amount: req.amount.toString(),
        status: req.status,
        createdAt: req.createdAt.toISOString(),
      })),
      withdrawalRequests: withdrawalRequests.map(req => ({
        id: req.id,
        userId: req.userId,
        amount: req.amount.toString(),
        status: req.status,
        iban: req.iban,
        accountHolder: req.accountHolder || '',
        bankName: req.bankName || '',
        createdAt: req.createdAt.toISOString(),
        processedAt: req.processedAt ? req.processedAt.toISOString() : '',
        rejectionReason: req.rejectionReason || '',
      })),
      giftCards: giftCards.map(g => ({
        id: g.id,
        code: g.code,
        initialValue: g.initialValue.toString(),
        currentValue: g.currentValue.toString(),
        status: g.status,
        expiresAt: g.expiresAt ? g.expiresAt.toISOString() : '',
        customerId: g.customerId || '',
        note: g.note || '',
        createdAt: g.createdAt.toISOString(),
      })),
    };
  }

  @GrpcMethod('FinancialService', 'GetBalance')
  async getBalance(data: { userId: string; accountType: string }) {
    const result = await this.queryBus.execute(
      new GetBalanceQuery(data.userId, data.accountType),
    );

    return {
      balance: result.balance.toString(),
      availableBalance: result.availableBalance.toString(),
      blockedBalance: result.blockedBalance.toString(),
    };
  }

  @GrpcMethod('FinancialService', 'TopUpWallet')
  async topUpWallet(data: {
    userId: string;
    amount: string;
    paymentMethod: string;
    idempotencyKey: string;
  }) {
    // Tutar doğrulama
    const amount = new Decimal(data.amount);
    if (!amount.isPositive()) {
      return { success: false, error: 'Yükleme tutarı sıfırdan büyük olmalıdır.' };
    }

    // Banka transferi / EFT: anında işlem yerine onay bekleyen istek oluştur
    if (data.paymentMethod === 'BANK_TRANSFER' || data.paymentMethod === 'EFT') {
      const request = await this.prisma.accountTopUpRequest.create({
        data: {
          userId: data.userId,
          amount,
          paymentMethod: data.paymentMethod as PaymentMethod,
          status: 'PENDING',
          notes: `${data.paymentMethod} ile yükleme isteği`,
        },
      });
      return { success: true, data: { requestId: request.id } };
    }

    // Kredi kartı vb.: anında işle
    try {
      await this.commandBus.execute(
        new TopUpWalletCommand(
          data.userId,
          amount,
          'TRY',
          data.idempotencyKey || `CC-${Date.now()}`,
        ),
      );
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'GetWalletRequests')
  async getWalletRequests(data: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: TopUpRequestFilter = {};
    if (data.userId) where.userId = data.userId;
    if (data.status) where.status = data.status as TopUpStatus;

    const [items, total] = await Promise.all([
      this.prisma.accountTopUpRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.accountTopUpRequest.count({ where }),
    ]);

    return {
      items: items.map(item => ({
        id: item.id,
        userId: item.userId,
        type: 'TOPUP',
        amount: item.amount.toString(),
        status: item.status,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  @GrpcMethod('FinancialService', 'GetWithdrawals')
  async getWithdrawals(data: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: WithdrawalRequestFilter = {};
    if (data.userId) where.userId = data.userId;
    if (data.status) where.status = data.status as WithdrawalStatus;

    const [items, total] = await Promise.all([
      this.prisma.accountWithdrawalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.accountWithdrawalRequest.count({ where }),
    ]);

    return {
      items: items.map(item => ({
        id: item.id,
        userId: item.userId,
        amount: item.amount.toString(),
        status: item.status,
        iban: item.iban,
        accountHolder: item.accountHolder || '',
        bankName: item.bankName || '',
        createdAt: item.createdAt.toISOString(),
        processedAt: item.processedAt ? item.processedAt.toISOString() : '',
        rejectionReason: item.rejectionReason || '',
      })),
      total,
    };
  }

  @GrpcMethod('FinancialService', 'RequestWithdrawal')
  async requestWithdrawal(data: {
    userId: string;
    amount: string;
    iban: string;
    accountHolder: string;
    bankName: string;
    idempotencyKey?: string;
  }) {
    try {
      const amount = new Decimal(data.amount);
      if (!amount.isPositive()) {
        return { success: false, error: 'Çekim tutarı sıfırdan büyük olmalıdır.' };
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Check balance (Simple check)
        const wallet = await tx.wallet.findUnique({ where: { userId: data.userId } });
        const mainAccount = await tx.account.findFirst({
          where: { userId: data.userId, type: 'MAIN' }
        });

        if (!wallet || !mainAccount || mainAccount.availableBalance.lessThan(amount)) {
          throw new Error('Yetersiz bakiye.');
        }

        const request = await tx.accountWithdrawalRequest.create({
          data: {
            userId: data.userId,
            amount,
            iban: data.iban,
            accountHolder: data.accountHolder,
            bankName: data.bankName,
            status: 'PENDING',
          },
        });

        // Block funds
        await tx.account.update({
          where: { id: mainAccount.id },
          data: {
            availableBalance: { decrement: amount },
            blockedBalance: { increment: amount }
          }
        });

        // Create a pending transaction record so it shows in history
        await tx.accountTransaction.create({
          data: {
            accountId: mainAccount.id,
            amount,
            type: 'WITHDRAWAL',
            direction: 'DEBIT',
            status: 'PENDING',
            description: `${data.bankName} - ${data.iban} hesabına çekim talebi`,
            referenceId: request.id,
            referenceType: 'WITHDRAWAL_REQUEST'
          }
        });

        return { withdrawalId: request.id };
      });

      return { success: true, withdrawalId: result.withdrawalId };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'ProcessWithdrawal')
  async processWithdrawal(data: {
    withdrawalId: string;
    action: string;
    adminId: string;
    reason?: string;
  }) {
    try {
      const request = await this.prisma.accountWithdrawalRequest.findUnique({
        where: { id: data.withdrawalId },
      });

      if (!request) {
        return { success: false, error: 'Talep bulunamadı.' };
      }

      if (request.status !== 'PENDING') {
        return { success: false, error: 'Talep zaten işlenmiş.' };
      }

      if (data.action === 'approve') {
        await this.prisma.$transaction(async (tx) => {
          await tx.accountWithdrawalRequest.update({
            where: { id: data.withdrawalId },
            data: {
              status: 'APPROVED',
              processedAt: new Date(),
              processedBy: data.adminId,
            },
          });

          // Deduct from blocked balance and wallet balance
          await tx.wallet.update({
            where: { userId: request.userId },
            data: { balanceTL: { decrement: request.amount } }
          });

          await tx.account.update({
            where: { userId_type: { userId: request.userId, type: 'MAIN' } },
            data: {
              balance: { decrement: request.amount },
              blockedBalance: { decrement: request.amount }
            }
          });

          // Update transaction status
          await tx.accountTransaction.updateMany({
            where: { referenceId: data.withdrawalId, referenceType: 'WITHDRAWAL_REQUEST' },
            data: { status: 'COMPLETED' }
          });
        });
      } else {
        await this.prisma.$transaction(async (tx) => {
          await tx.accountWithdrawalRequest.update({
            where: { id: data.withdrawalId },
            data: {
              status: 'REJECTED',
              processedAt: new Date(),
              processedBy: data.adminId,
              rejectionReason: data.reason || '',
            },
          });

          // Return to available balance
          await tx.account.update({
            where: { userId_type: { userId: request.userId, type: 'MAIN' } },
            data: {
              availableBalance: { increment: request.amount },
              blockedBalance: { decrement: request.amount }
            }
          });

          // Update transaction status
          await tx.accountTransaction.updateMany({
            where: { referenceId: data.withdrawalId, referenceType: 'WITHDRAWAL_REQUEST' },
            data: { status: 'FAILED' }
          });
        });
      }

      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'CreateGiftCard')
  async createGiftCard(data: {
    code?: string;
    amount: string;
    expiresAt?: string;
    customerId?: string;
    note?: string;
  }) {
    try {
      let code = data.code;
      if (!code || code.trim() === '') {
        // Otomatik kod üret: BZX-XXXX-XXXX formatında
        const suffix = Math.random().toString(36).substring(2, 10).toUpperCase();
        code = `BZX-${suffix.substring(0, 4)}-${suffix.substring(4, 8)}`;
      }
      
      const amount = new Decimal(data.amount || '0');
      if (amount.isNegative()) throw new Error('Tutar negatif olamaz.');

      // gRPC boş stringleri undefined/null yerine "" olarak gönderebilir
      const expiresAt = (data.expiresAt && data.expiresAt.trim() !== '') 
        ? new Date(data.expiresAt) 
        : null;
        
      const customerId = (data.customerId && data.customerId.trim() !== '')
        ? data.customerId
        : null;

      const giftCard = await this.prisma.giftCard.create({
        data: {
          code: code!,
          initialValue: amount,
          currentValue: amount,
          expiresAt: expiresAt,
          customerId: customerId,
          note: data.note || '',
          status: 'Active',
        },
      });
      return { success: true, giftCardId: giftCard.id };
    } catch (error: unknown) {
      return { success: false, error: extractError(error) };
    }
  }

  @GrpcMethod('FinancialService', 'ListGiftCards')
  async listGiftCards(data: { customerId?: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (data.customerId) where.customerId = data.customerId;

    const [items, total] = await Promise.all([
      this.prisma.giftCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.giftCard.count({ where }),
    ]);

    return {
      items: items.map(item => ({
        id: item.id,
        code: item.code,
        initialValue: item.initialValue.toString(),
        currentValue: item.currentValue.toString(),
        status: item.status,
        expiresAt: item.expiresAt ? item.expiresAt.toISOString() : '',
        customerId: item.customerId || '',
        note: item.note || '',
        createdAt: item.createdAt.toISOString(),
      })),
      total,
    };
  }

  @GrpcMethod('FinancialService', 'GetGiftCard')
  async getGiftCard(data: { id: string }) {
    if (!data.id) {
      throw new Error('Hediye kartı ID bilgisi gereklidir.');
    }

    const giftCard = await this.prisma.giftCard.findUnique({
      where: { id: data.id },
    });

    if (!giftCard) {
      throw new Error('Hediye kartı bulunamadı.');
    }

    return {
      id: giftCard.id,
      code: giftCard.code,
      initialValue: giftCard.initialValue.toString(),
      currentValue: giftCard.currentValue.toString(),
      status: giftCard.status,
      expiresAt: giftCard.expiresAt ? giftCard.expiresAt.toISOString() : '',
      customerId: giftCard.customerId || '',
      note: giftCard.note || '',
      createdAt: giftCard.createdAt.toISOString(),
    };
  }
}
