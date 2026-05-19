// apps/backend/src/modules/auction/domain/repositories/auction.repository.interface.ts

import { IRepository } from '@barterborsa/shared-core';
import { Auction } from '../entities/auction.entity';
import { AuctionBid } from '../entities/auction-bid.entity';

export interface IAuctionRepository extends IRepository<Auction> {
  findById(id: string): Promise<Auction | null>;
  findAll(): Promise<Auction[]>;
  save(auction: Auction): Promise<void>;
  delete(id: string): Promise<void>;
  findByListingId(listingId: string): Promise<Auction | null>;
  findActive(): Promise<Auction[]>;
  findEndingSoon(): Promise<Auction[]>;
  createBid(bid: AuctionBid): Promise<void>;
  findBidsByAuctionId(auctionId: string, limit?: number): Promise<AuctionBid[]>;
  findParticipation(auctionId: string, userId: string): Promise<any | null>;
  updateAuctionStatus(auctionId: string, status: string, winnerId?: string): Promise<void>;
  findWithFilters(filter: Record<string, unknown>, skip: number, take: number): Promise<{ items: Auction[]; total: number }>;
  updateStatus(id: string, status: string): Promise<void>;
  findParticipationById(id: string): Promise<any | null>;
  updateParticipationStatus(id: string, status: string): Promise<void>;
  deleteAuction(id: string): Promise<void>;
  findByIdWithRelations(id: string): Promise<any | null>;
  findWinnersByAuctionId(auctionId: string): Promise<any[]>;
  createWinner(data: { auctionId: string; userId: string; position: number; amount: number }): Promise<void>;
  updateManyParticipations(auctionId: string, userId: string, status: string): Promise<void>;
  refundParticipation(participationId: string): Promise<any | null>;
}
