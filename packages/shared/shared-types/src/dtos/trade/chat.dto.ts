export type MessageStatus = 'pending' | 'sent' | 'error' | 'warning' | 'delivered' | 'read' | 'moderated';

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  readAt?: string;
  tempId?: string;
  status?: MessageStatus;
  isFromMe?: boolean;
}
