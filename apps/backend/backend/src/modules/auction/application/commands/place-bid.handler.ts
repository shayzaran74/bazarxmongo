// apps/backend/src/modules/auction/application/commands/place-bid.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlaceBidCommand } from './place-bid.command';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { AuctionBid } from '../../domain/entities/auction-bid.entity';
import { DomainException } from '@barterborsa/shared-core';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';

interface WalletBalance {
  balance: string | number;
}

const VALID_PARTICIPATION_STATUSES = ['DEPOSIT_HELD', 'APPROVED', 'ACTIVE'] as const;

@CommandHandler(PlaceBidCommand)
export class PlaceBidHandler implements ICommandHandler<PlaceBidCommand> {
  constructor(
    @Inject('IAuctionRepository') private readonly repository: IAuctionRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: PlaceBidCommand) {
    const auction = await this.repository.findById(command.auctionId);
    if (!auction) throw new DomainException('Auction not found');

    // Teklif verenin geçerli katılım kaydı olmalı
    const participation = await this.repository.findParticipation(command.auctionId, command.userId);
    if (!participation || !VALID_PARTICIPATION_STATUSES.includes(participation.status as typeof VALID_PARTICIPATION_STATUSES[number])) {
      throw new DomainException('Bu açık artırmaya katılım kaydınız bulunmuyor');
    }

    const amount = Number(command.amount);

    // Cüzdan bakiyesi kontrolü
    const wallet = (await this.financialGateway.getWallet(command.userId)) as WalletBalance;
    const balance = Number(wallet.balance);
    if (balance < amount) {
      throw new DomainException(`Yetersiz bakiye. Mevcut: ${balance} TL, Teklif: ${amount} TL`);
    }

    // Domain logic: validate and update current price
    auction.placeBid(command.userId, amount);

    // 1. Önceki en yüksek teklifi bul (iade için)
    const previousBids = await this.repository.findBidsByAuctionId(auction.id, 1);
    const previousBid = previousBids[0] ?? null;

    // 2. Yeni teklif için blokaj al
    const idempotencyKey = `bid-${auction.id}-${command.userId}-${command.amount}`;
    const referenceId = `bid-${auction.id}-${command.userId}`;
    const holdResult = await this.financialGateway.holdFunds(
      command.userId,
      String(amount),
      'AUCTION_BID',
      referenceId,
      'AUCTION_BID',
      idempotencyKey,
    );

    // 3. Önceki teklif sahibinin parasını iade et (eğer varsa)
    const prevBidHoldId = (previousBid as { holdId?: string })?.holdId;
    if (prevBidHoldId) {
      await this.financialGateway.releaseFunds(
        prevBidHoldId,
        `release-bid-${(previousBid as { id?: string }).id}`,
      );
    }

    // 4. Teklifi ve artırmayı kaydet
    await this.repository.save(auction);

    const bid = AuctionBid.create(
      auction.id,
      command.userId,
      amount,
      holdResult.holdId as string,
    );

    await this.repository.createBid(bid);

    await this.auditLog.log({
      actorId: command.userId,
      action: 'AUCTION_BID_PLACED',
      resourceType: 'Auction',
      resourceId: command.auctionId,
      newValue: {
        amount: command.amount,
        bidId: bid.id,
        holdId: bid.getProps().holdId,
      },
    });

    return {
      success: true,
      data: {
        id: bid.id,
        auctionId: bid.getProps().auctionId,
        userId: bid.getProps().userId,
        amount: bid.getProps().amount,
        createdAt: bid.getProps().createdAt,
      },
      currentPrice: String(auction.getProps().currentPrice),
    };
  }
}