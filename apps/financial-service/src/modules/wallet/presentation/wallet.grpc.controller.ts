import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { GetBalanceQuery } from '../application/queries/get-balance.query';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { TopUpWalletCommand } from '../application/commands/topup-wallet.command';
import { Decimal } from 'decimal.js';

import { ApproveTopUpCommand } from '../application/commands/approve-topup.command';
import { RejectTopUpCommand } from '../application/commands/reject-topup.command';

import { GetTransactionsQuery } from '../application/queries/get-transactions.query';
import { Wallet } from '../domain/entities/wallet.entity';
import { IWalletRepository } from '../domain/repositories/wallet.repository.interface';

@Controller()
export class WalletGrpcController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
  ) {}

  @GrpcMethod('FinancialService', 'GetTransactions')
  async getTransactions(data: { userId: string; accountType?: string; page?: number; limit?: number; accountId?: string }) {
    return this.queryBus.execute(
      new GetTransactionsQuery(
        data.userId,
        data.accountType,
        data.page || 1,
        data.limit || 20,
        data.accountId
      )
    );
  }

  @GrpcMethod('FinancialService', 'ProcessWalletRequest')
  async processWalletRequest(data: { requestId: string; action: string; adminId: string; reason?: string }) {
    try {
      if (data.action === 'approve') {
        await this.commandBus.execute(new ApproveTopUpCommand(data.requestId, data.adminId));
      } else {
        await this.commandBus.execute(new RejectTopUpCommand(data.requestId, data.adminId, data.reason || ''));
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  @GrpcMethod('FinancialService', 'GetWallet')
  async getWallet(data: { userId: string }) {
    console.log(`[FinancialService] GetWallet called for userId: ${data.userId}`);
    
    // 1. Get Wallet entity (Source of truth for legacy balance)
    let walletEntity = await this.walletRepository.findByUserId(data.userId);
    if (!walletEntity) {
      walletEntity = Wallet.create(data.userId);
      await this.walletRepository.save(walletEntity);
    }

    // 2. Get Account records (Source of truth for account IDs and types)
    const [accounts, topupRequests, withdrawalRequests] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId: data.userId }
      }),
      this.prisma.accountTopUpRequest.findMany({
        where: { userId: data.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      this.prisma.accountWithdrawalRequest.findMany({
        where: { userId: data.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    console.log(`[FinancialService] Found ${accounts.length} accounts. Wallet Balance: ${walletEntity.balanceTL.amount}`);
    
    return {
      accounts: accounts.map(acc => {
        // Map account balance from Wallet entity if it's MAIN or BARTER
        let balance = acc.balance.toString();
        let available = acc.availableBalance.toString();

        if (acc.type === 'MAIN') {
          balance = walletEntity.balanceTL.amount.toString();
          // Fix: If availableBalance is 0 in DB but balance is > 0, sync them
          available = (acc.availableBalance.isZero() && !walletEntity.balanceTL.amount.isZero()) 
            ? balance 
            : available;
        } else if (acc.type === 'BARTER') {
          balance = walletEntity.barterBalance.amount.toString();
          available = (acc.availableBalance.isZero() && !walletEntity.barterBalance.amount.isZero()) 
            ? balance 
            : available;
        }

        console.log(` - Account: ${acc.type}, Sync Balance: ${balance}, Available: ${available}`);
        
        return {
          id: acc.id,
          type: acc.type,
          balance,
          availableBalance: available,
          blockedBalance: acc.blockedBalance.toString(),
          currency: acc.currency
        };
      }),
      requests: topupRequests.map(req => ({
        id: req.id,
        userId: req.userId,
        type: 'TOPUP',
        amount: req.amount.toString(),
        status: req.status,
        createdAt: req.createdAt.toISOString()
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
        rejectionReason: req.rejectionReason || ''
      }))
    };
  }

  @GrpcMethod('FinancialService', 'GetBalance')
  async getBalance(data: { userId: string; accountType: string }) {
    const result = await this.queryBus.execute(
      new GetBalanceQuery(data.userId, data.accountType)
    );

    return {
      balance: result.balance.toString(),
      availableBalance: result.availableBalance.toString(),
      blockedBalance: result.blockedBalance.toString(),
    };
  }

  @GrpcMethod('FinancialService', 'TopUpWallet')
  async topUpWallet(data: { userId: string; amount: string; paymentMethod: string; idempotencyKey: string }) {
    // If it's Bank Transfer or EFT, create a request instead of instant top-up
    if (data.paymentMethod === 'BANK_TRANSFER' || data.paymentMethod === 'EFT') {
      const request = await this.prisma.accountTopUpRequest.create({
        data: {
          userId: data.userId,
          amount: new Decimal(data.amount),
          paymentMethod: data.paymentMethod as any,
          status: 'PENDING',
          notes: `Topup request via ${data.paymentMethod}`
        }
      });
      return { success: true, data: { requestId: request.id } };
    }

    // For other methods (like Credit Card), process instantly
    try {
      await this.commandBus.execute(
        new TopUpWalletCommand(
          data.userId, 
          new Decimal(data.amount), 
          'TRY',
          data.idempotencyKey || `CC-${Date.now()}`
        )
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  @GrpcMethod('FinancialService', 'GetWalletRequests')
  async getWalletRequests(data: { userId?: string; status?: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (data.userId && data.userId !== '') where.userId = data.userId;
    if (data.status && data.status !== '') where.status = data.status;

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
      items: items.map((item: any) => ({
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
  async getWithdrawals(data: { userId?: string; status?: string; page?: number; limit?: number }) {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (data.userId && data.userId !== '') where.userId = data.userId;
    if (data.status && data.status !== '') where.status = data.status;

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
      items: items.map((item: any) => ({
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
