// apps/backend/src/modules/barter/domain/repositories/barter-part.repository.interface.ts

export interface BarterPart {
  id: string;
  swapSessionId: string;
  partNumber: number;
  senderId: string;
  recipientId: string;
  status: string;
  trackingCode?: string;
  carrier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  confirmedAt?: Date;
  disputedAt?: Date;
  disputeWindowEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBarterPartRepository {
  findById(id: string): Promise<BarterPart | null>;
  findBySwapSessionAndSender(swapSessionId: string, senderId: string): Promise<BarterPart | null>;
  findBySwapSessionAndRecipient(swapSessionId: string, recipientId: string): Promise<BarterPart | null>;
  findAllBySwapSession(swapSessionId: string): Promise<BarterPart[]>;
  create(data: {
    id: string;
    swapSessionId: string;
    partNumber: number;
    senderId: string;
    recipientId: string;
    status?: string;
  }): Promise<BarterPart>;
  updateShipping(id: string, data: {
    trackingCode: string;
    carrier: string;
    status: string;
    shippedAt: Date;
  }): Promise<void>;
  updateConfirmation(id: string, data: {
    status: string;
    deliveredAt: Date;
    confirmedAt: Date;
    disputeWindowEndsAt: Date;
  }): Promise<void>;
}