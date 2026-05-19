// packages/shared/shared-persistence/src/mongodb/barter/barter.repository.ts
// Barter + Auction + Lottery repositories — MongoDB transaction pattern
// ADR-005 §8: barter/auction/lottery/barterborsa module repositories

import { Injectable } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Types } from 'mongoose';

import { SwapSession, ISwapSession, SwapSessionStatusType, CollateralStatus } from '../../schemas/backend/swapSession.schema';
import { BarterDisputeLog, IBarterDisputeLog, DisputeResolutionStatusType } from '../../schemas/backend/barterDisputeLog.schema';
import { BarterPart, IBarterPart, BarterPartStatusType } from '../../schemas/backend/barterPart.schema';
import { TradeOffer, ITradeOffer, TradeOfferStatusType } from '../../schemas/backend/tradeOffer.schema';
import { SurplusItem, ISurplusItem, SurplusStatusType } from '../../schemas/backend/surplusItem.schema';

import { Auction, IAuction, AuctionStatus } from '../../schemas/backend/auction.schema';
import { AuctionBid, IAuctionBid } from '../../schemas/backend/auctionBid.schema';
import { AuctionParticipation, IAuctionParticipation, ParticipationStatus } from '../../schemas/backend/auctionParticipation.schema';
import { AuctionWinner, IAuctionWinner } from '../../schemas/backend/auctionWinner.schema';

import { Lottery, ILottery, LotteryStatus } from '../../schemas/backend/lottery.schema';
import { LotteryTicket, ILotteryTicket } from '../../schemas/backend/lotteryTicket.schema';

import { BlindPool, IBlindPool } from '../../schemas/backend/blindPool.schema';
import { BlindPoolEntry, IBlindPoolEntry } from '../../schemas/backend/blindPoolEntry.schema';

import { EcosystemAuditLog, IEcosystemAuditLog, EcosystemAuditSeverityType } from '../../schemas/backend/ecosystemAuditLog.schema';

// === Barter (Swap) Repositories ===

@Injectable()
export class SwapSessionRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    tradeOfferId: string;
    initiatorId: string;
    receiverId: string;
    shipmentMode: string;
    collateralAmount: Types.Decimal128;
    collateralCurrency?: string;
    timeoutAt: Date;
  }): Promise<ISwapSession> {
    const doc = new SwapSession({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'PENDING',
      collateralStatus: 'NONE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByTradeOffer(tradeOfferId: string): Promise<ISwapSession | null> {
    return SwapSession.findOne({ tradeOfferId }).lean();
  }

  async findById(id: string): Promise<ISwapSession | null> {
    return SwapSession.findById(id).lean();
  }

  async updateStatus(id: string, status: SwapSessionStatusType): Promise<boolean> {
    const res = await SwapSession.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async lockCollateral(id: string, fromHoldId: string, toHoldId: string): Promise<boolean> {
    const res = await SwapSession.updateOne(
      { _id: id },
      {
        $set: {
          collateralStatus: 'HELD',
          fromCollateralHoldId: fromHoldId,
          toCollateralHoldId: toHoldId,
          collateralLockedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    return res.modifiedCount > 0;
  }

  async releaseCollateral(id: string): Promise<boolean> {
    const res = await SwapSession.updateOne(
      { _id: id },
      {
        $set: {
          collateralStatus: 'RELEASED',
          collateralReleasedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    return res.modifiedCount > 0;
  }

  async forfeitCollateral(id: string): Promise<boolean> {
    const res = await SwapSession.updateOne(
      { _id: id },
      {
        $set: {
          collateralStatus: 'FORFEITED',
          collateralForfeitedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class BarterDisputeRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    swapSessionId: string;
    tradeOfferId: string;
    openedById: string;
    respondentId: string;
    tradeValueInKurus: number;
    reason: string;
    evidence?: Record<string, unknown>;
  }): Promise<IBarterDisputeLog> {
    const doc = new BarterDisputeLog({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findBySwapSession(swapSessionId: string): Promise<IBarterDisputeLog | null> {
    return BarterDisputeLog.findOne({ swapSessionId }).lean();
  }

  async updateStatus(id: string, status: DisputeResolutionStatusType, note?: string): Promise<boolean> {
    const update: Record<string, unknown> = { status };
    if (status === 'RESOLVED') update.resolvedAt = new Date();
    if (note) update.resolutionNote = note;
    const res = await BarterDisputeLog.updateOne(
      { _id: id },
      { $set: { ...update, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class BarterPartRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    swapSessionId: string;
    partNumber: number;
    senderId: string;
    recipientId: string;
  }): Promise<IBarterPart> {
    const doc = new BarterPart({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findBySwapSession(swapSessionId: string): Promise<IBarterPart[]> {
    return BarterPart.find({ swapSessionId }).sort({ partNumber: 1 }).lean();
  }

  async updateStatus(id: string, status: BarterPartStatusType, trackingCode?: string): Promise<boolean> {
    const update: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === 'SHIPPED' && trackingCode) update.trackingCode = trackingCode;
    if (status === 'DELIVERED') update.deliveredAt = new Date();
    if (status === 'CONFIRMED') update.confirmedAt = new Date();
    const res = await BarterPart.updateOne({ _id: id }, { $set: update });
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class TradeOfferRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    tradeOfferId: string;
    initiatorId: string;
    receiverId: string;
    cashAmount: Types.Decimal128;
    cashDirection?: string;
    cashCurrency?: string;
    expiresAt: Date;
    fromCompanyId?: string;
    toCompanyId?: string;
  }): Promise<ITradeOffer> {
    const doc = new TradeOffer({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findById(id: string): Promise<ITradeOffer | null> {
    return TradeOffer.findById(id).lean();
  }

  async findByCompany(companyId: string, limit = 50): Promise<ITradeOffer[]> {
    return TradeOffer.find({
      $or: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async updateStatus(id: string, status: TradeOfferStatusType): Promise<boolean> {
    const update: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === 'ACCEPTED') update.acceptedAt = new Date();
    if (status === 'REJECTED') update.rejectedAt = new Date();
    if (status === 'CANCELLED') update.cancelledAt = new Date();
    if (status === 'COMPLETED') update.completedAt = new Date();
    const res = await TradeOffer.updateOne({ _id: id }, { $set: update });
    return res.modifiedCount > 0;
  }

  async expireOldOffers(): Promise<number> {
    const res = await TradeOffer.updateMany(
      { status: 'PENDING', expiresAt: { $lt: new Date() } },
      { $set: { status: 'EXPIRED', updatedAt: new Date() } }
    );
    return res.modifiedCount;
  }
}

@Injectable()
export class SurplusItemRepository {
  constructor(private readonly connection: Connection) {}

  async findById(id: string): Promise<ISurplusItem | null> {
    return SurplusItem.findById(id).lean();
  }

  async findByCompany(companyId: string, limit = 100): Promise<ISurplusItem[]> {
    return SurplusItem.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async findByCity(city: string, status: SurplusStatusType = 'APPROVED', limit = 100): Promise<ISurplusItem[]> {
    return SurplusItem.find({ city, status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async updateStatus(id: string, status: SurplusStatusType, approvedBy?: string, rejectionReason?: string): Promise<boolean> {
    const update: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === 'REACTIVATED') update.lastReactivatedAt = new Date();
    if (approvedBy) update.approvedBy = approvedBy;
    if (rejectionReason) update.rejectionReason = rejectionReason;
    const res = await SurplusItem.updateOne({ _id: id }, { $set: update });
    return res.modifiedCount > 0;
  }
}

// === Auction Repositories ===

@Injectable()
export class AuctionRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    listingId: string;
    userId: string;
    startingPrice: Types.Decimal128;
    currentPrice: Types.Decimal128;
    minBidIncrement: Types.Decimal128;
    startTime: Date;
    endTime: Date;
    participationDeposit?: Types.Decimal128;
  }): Promise<IAuction> {
    const doc = new Auction({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'SCHEDULED',
      currentWinnerStep: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findById(id: string): Promise<IAuction | null> {
    return Auction.findById(id).lean();
  }

  async findActive(limit = 100): Promise<IAuction[]> {
    return Auction.find({ status: 'ACTIVE' }).sort({ endTime: 1 }).limit(limit).lean();
  }

  async findEndedUncompleted(limit = 50): Promise<IAuction[]> {
    return Auction.find({ status: 'ACTIVE', endTime: { $lt: new Date() } })
      .limit(limit)
      .lean();
  }

  async closeAuction(id: string, winnerId: string): Promise<boolean> {
    const res = await Auction.updateOne(
      { _id: id, status: 'ACTIVE' },
      { $set: { status: 'ENDED', winnerId, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async updateCurrentPrice(id: string, newPrice: Types.Decimal128, winnerStep: number): Promise<boolean> {
    const res = await Auction.updateOne(
      { _id: id },
      { $set: { currentPrice: newPrice, currentWinnerStep: winnerStep, updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class AuctionBidRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: { auctionId: string; userId: string; amount: Types.Decimal128; holdId?: string }): Promise<IAuctionBid> {
    const doc = new AuctionBid({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByAuction(auctionId: string, limit = 50): Promise<IAuctionBid[]> {
    return AuctionBid.find({ auctionId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findHighestBid(auctionId: string): Promise<IAuctionBid | null> {
    return AuctionBid.findOne({ auctionId }).sort({ amount: -1 }).lean();
  }
}

@Injectable()
export class AuctionParticipationRepository {
  constructor(private readonly connection: Connection) {}

  async findByAuctionAndUser(auctionId: string, userId: string): Promise<IAuctionParticipation | null> {
    return AuctionParticipation.findOne({ auctionId, userId }).lean();
  }

  async create(input: { auctionId: string; userId: string; blockedAmount: Types.Decimal128; holdId: string }): Promise<IAuctionParticipation> {
    const doc = new AuctionParticipation({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'DEPOSIT_HELD',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async approveParticipation(id: string): Promise<boolean> {
    const res = await AuctionParticipation.updateOne(
      { _id: id },
      { $set: { status: 'ACTIVE', updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }
}

@Injectable()
export class AuctionWinnerRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: { auctionId: string; userId: string; position: number; amount?: Types.Decimal128 }): Promise<IAuctionWinner> {
    const doc = new AuctionWinner({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByAuction(auctionId: string): Promise<IAuctionWinner[]> {
    return AuctionWinner.find({ auctionId }).sort({ position: 1 }).lean();
  }
}

// === Lottery Repositories ===

@Injectable()
export class LotteryRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    ownerId: string;
    listingId?: string;
    title: string;
    ticketPrice: Types.Decimal128;
    prizeValue?: Types.Decimal128;
    ticketDigits?: number;
    numbersPerTicket?: number;
    totalTickets?: number;
    maxTicketsPerUser?: number;
    startTime: Date;
    endTime: Date;
  }): Promise<ILottery> {
    const doc = new Lottery({
      id: new Types.ObjectId().toString(),
      ...input,
      status: 'SCHEDULED',
      ticketDigits: input.ticketDigits ?? 3,
      numbersPerTicket: input.numbersPerTicket ?? 1,
      totalTickets: input.totalTickets ?? 100,
      maxTicketsPerUser: input.maxTicketsPerUser ?? 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findById(id: string): Promise<ILottery | null> {
    return Lottery.findById(id).lean();
  }

  async findActive(limit = 50): Promise<ILottery[]> {
    return Lottery.find({ status: 'ACTIVE' }).sort({ endTime: 1 }).limit(limit).lean();
  }

  async findExpiredUncompleted(limit = 50): Promise<ILottery[]> {
    return Lottery.find({ status: 'ACTIVE', endTime: { $lt: new Date() } })
      .limit(limit)
      .lean();
  }

  async setWinner(id: string, winnerId: string, winningNumber: string): Promise<boolean> {
    const res = await Lottery.updateOne(
      { _id: id },
      { $set: { winnerId, winningNumber, status: 'COMPLETED', updatedAt: new Date() } }
    );
    return res.modifiedCount > 0;
  }

  async drawWinner(id: string): Promise<ILottery | null> {
    const lottery = await Lottery.findOne({ _id: id, status: 'ACTIVE', endTime: { $lt: new Date() } }).lean();
    if (!lottery) return null;

    // Generate winning number
    const digits = lottery.ticketDigits;
    const max = Math.pow(10, digits) - 1;
    const winNum = Math.floor(Math.random() * (max + 1)).toString().padStart(digits, '0');

    await Lottery.updateOne(
      { _id: id },
      { $set: { winningNumber: winNum, status: 'DRAWING', updatedAt: new Date() } }
    );

    return Lottery.findOne({ _id: id }).lean();
  }
}

@Injectable()
export class LotteryTicketRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: { lotteryId: string; userId: string; numbers: string }): Promise<ILotteryTicket> {
    const doc = new LotteryTicket({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByLottery(lotteryId: string, limit = 1000): Promise<ILotteryTicket[]> {
    return LotteryTicket.find({ lotteryId }).lean();
  }

  async countByUser(lotteryId: string, userId: string): Promise<number> {
    return LotteryTicket.countDocuments({ lotteryId, userId });
  }

  async findByWinningNumber(lotteryId: string, winningNumber: string): Promise<ILotteryTicket | null> {
    return LotteryTicket.findOne({ lotteryId, numbers: winningNumber }).lean();
  }
}

// === BlindPool / BarterBorsa Repository ===

@Injectable()
export class BlindPoolRepository {
  constructor(private readonly connection: Connection) {}

  async findByGroup(groupId: string): Promise<IBlindPool[]> {
    return BlindPool.find({ groupId, isActive: true }).lean();
  }

  async findById(id: string): Promise<IBlindPool | null> {
    return BlindPool.findById(id).lean();
  }

  async create(input: { groupId: string; name: string; totalStock: Types.Decimal128; smartCapPct?: Types.Decimal128 }): Promise<IBlindPool> {
    const doc = new BlindPool({
      id: new Types.ObjectId().toString(),
      ...input,
      availableStock: input.totalStock,
      isActive: true,
      smartCapPct: input.smartCapPct ?? Types.Decimal128.fromString('25'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async requestStock(poolId: string, vendorId: string, listingId: string, quantity: Types.Decimal128): Promise<IBlindPoolEntry | null> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        const pool = await BlindPool.findOne({ _id: poolId, isActive: true }).session(session).lean();
        if (!pool) return null;

        const qtyNum = parseFloat(quantity.toString());
        const availNum = parseFloat(pool.availableStock.toString());
        if (availNum < qtyNum) return null;

        await BlindPool.updateOne(
          { _id: poolId },
          { $inc: { availableStock: Types.Decimal128.fromString((-qtyNum).toFixed(2)) } },
          { session }
        );

        const entry = new BlindPoolEntry({
          id: new Types.ObjectId().toString(),
          poolId,
          vendorId,
          listingId,
          quantity,
          isReserved: false,
          createdAt: new Date(),
        });
        await entry.save({ session });
        return entry;
      });
    } finally {
      await session.endSession();
    }
  }

  async findEntriesByPool(poolId: string): Promise<IBlindPoolEntry[]> {
    return BlindPoolEntry.find({ poolId }).lean();
  }
}

// === Ecosystem Audit Log Repository ===

@Injectable()
export class EcosystemAuditLogRepository {
  constructor(private readonly connection: Connection) {}

  async create(input: {
    ecosystemId?: string;
    vendorId?: string;
    action: string;
    severity: EcosystemAuditSeverityType;
    details?: Record<string, unknown>;
  }): Promise<IEcosystemAuditLog> {
    const doc = new EcosystemAuditLog({
      id: new Types.ObjectId().toString(),
      ...input,
      createdAt: new Date(),
    });
    await doc.save();
    return doc;
  }

  async findByEcosystem(ecosystemId: string, limit = 200): Promise<IEcosystemAuditLog[]> {
    return EcosystemAuditLog.find({ ecosystemId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findByVendor(vendorId: string, limit = 200): Promise<IEcosystemAuditLog[]> {
    return EcosystemAuditLog.find({ vendorId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async findBySeverity(severity: EcosystemAuditSeverityType, limit = 200): Promise<IEcosystemAuditLog[]> {
    return EcosystemAuditLog.find({ severity }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}