// apps/backend/src/modules/auction/domain/repositories/auction-bid.repository.interface.ts

export interface AuctionBid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  holdId?: string;
  createdAt: Date;
}

export interface IAuctionBidRepository {
  findByAuctionId(auctionId: string, limit?: number): Promise<AuctionBid[]>;
  create(data: { auctionId: string; userId: string; amount: number; holdId?: string }): Promise<AuctionBid>;
}