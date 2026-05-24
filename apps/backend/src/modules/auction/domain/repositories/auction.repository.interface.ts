// apps/backend/src/modules/auction/domain/repositories/auction.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Auction } from '../entities/auction.entity';
import { AuctionBid } from '../entities/auction-bid.entity';
import { Types } from 'mongoose';

export interface AuctionParticipationData {
  id: string;
  auctionId: string;
  userId: string;
  status: string;
  holdId?: string;
  depositAmount?: Types.Decimal128;
  createdAt: Date;
}

export interface AuctionWinnerData {
  id: string;
  auctionId: string;
  userId: string;
  position: number;
  amount: Types.Decimal128;
  createdAt: Date;
}

export interface AuctionBidData {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  holdId?: string;
  createdAt: Date;
}

export interface AuctionRefundResult {
  id: string;
  holdId?: string;
  status: string;
}

export interface AuctionWithRelations {
  id: string;
  status: string;
  listingId: string;
  userId: string;
  winners: AuctionWinnerData[];
  bids?: Array<{ id: string; userId: string; amount: number }>;
  participations?: Array<{ id: string; userId: string; status: string; holdId?: string }>;
}

export interface IAuctionRepository extends IRepository<Auction> {
  findById(id: string): Promise<Auction | null>;
  findAll(): Promise<Auction[]>;
  save(auction: Auction): Promise<void>;
  delete(id: string): Promise<void>;
  findByListingId(listingId: string): Promise<Auction | null>;
  findActive(): Promise<Auction[]>;
  findEndingSoon(): Promise<Auction[]>;
  createBid(bid: AuctionBid): Promise<void>;
  findBidsByAuctionId(auctionId: string, limit?: number): Promise<AuctionBidData[]>;
  findParticipation(auctionId: string, userId: string): Promise<AuctionParticipationData | null>;
  updateAuctionStatus(auctionId: string, status: string, winnerId?: string): Promise<void>;
  findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: Auction[]; total: number }>;
  updateStatus(id: string, status: string): Promise<void>;
  findParticipationById(id: string): Promise<AuctionParticipationData | null>;
  updateParticipationStatus(id: string, status: string): Promise<void>;
  deleteAuction(id: string): Promise<void>;
  findByIdWithRelations(id: string): Promise<AuctionWithRelations | null>;
  findWinnersByAuctionId(auctionId: string): Promise<AuctionWinnerData[]>;
  createWinner(data: { auctionId: string; userId: string; position: number; amount: number }): Promise<void>;
  updateManyParticipations(auctionId: string, userId: string, status: string): Promise<void>;
  refundParticipation(participationId: string): Promise<AuctionRefundResult | null>;
  findAllParticipations(filter: { auctionId?: string; status?: string }, skip: number, limit: number): Promise<{ items: AuctionParticipationData[]; total: number }>;
  atomicBidUpdate(auctionId: string, amount: number, userId: string): Promise<boolean>;
}
