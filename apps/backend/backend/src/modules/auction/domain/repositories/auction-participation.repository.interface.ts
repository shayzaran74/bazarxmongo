// apps/backend/src/modules/auction/domain/repositories/auction-participation.repository.interface.ts

export interface AuctionParticipation {
  id: string;
  auctionId: string;
  userId: string;
  status: string;
  holdId?: string;
  blockedAmount: number;
  createdAt: Date;
}

export interface IAuctionParticipationRepository {
  findByAuctionAndUser(auctionId: string, userId: string): Promise<AuctionParticipation | null>;
  create(data: { auctionId: string; userId: string; status: string; holdId?: string; blockedAmount: number }): Promise<AuctionParticipation>;
  updateStatus(id: string, status: string): Promise<void>;
}