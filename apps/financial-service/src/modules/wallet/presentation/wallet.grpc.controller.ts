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

    const [topupRequests, withdrawalRequests] = await Promise.all([
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
}
