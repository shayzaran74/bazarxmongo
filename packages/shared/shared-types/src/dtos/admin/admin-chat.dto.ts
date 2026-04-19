import type { ChatMessage } from '../trade/chat.dto';
import type { Offer } from '../barter/offer.dto';

export interface AdminMessage extends ChatMessage {
  readAt?: string;
  hasRiskyContent?: boolean;
  riskScore?: number;
  metadata?: {
    fromAdmin?: boolean;
    [key: string]: any;
  };
  sender?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface AdminChatRoom {
  id: string;
  tradeOfferId: string;
  tradeOffer?: Offer;
  lastMessage?: AdminMessage;
  updatedAt: string;
  messageCount?: number;
  isHot?: boolean;
  hasRiskyContent?: boolean;
  userAId?: string;
  userBId?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: any;
  createdAt: string;
}
