// apps/backend/src/modules/communication/communication.module.ts

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RabbitMQModule } from '@barterborsa/shared-messaging';
import { PrismaService } from '@barterborsa/shared-persistence';

import { ChatController } from './presentation/chat.controller';
import { NotificationController } from './presentation/notification.controller';
import { ComplaintController } from './presentation/complaint.controller';
import { CommunicationAdminController } from './presentation/communication-admin.controller';

import { CreateChatRoomHandler } from './application/commands/create-chat-room.handler';
import { SendMessageHandler } from './application/commands/send-message.handler';
import { CreateNotificationHandler } from './application/commands/create-notification.handler';
import { CreateComplaintHandler } from './application/commands/create-complaint.handler';
import { MarkMessagesReadHandler } from './application/commands/mark-messages-read.handler';
import { MarkNotificationReadHandler } from './application/commands/mark-notification-read.handler';

import { GetChatRoomsHandler } from './application/queries/get-chat-rooms.handler';
import { GetMessagesHandler } from './application/queries/get-messages.handler';
import { GetNotificationsHandler } from './application/queries/get-notifications.handler';
import { GetNotificationUnreadCountHandler } from './application/queries/get-notification-unread-count.handler';

import { PrismaChatRoomRepository } from './infrastructure/persistence/prisma-chat-room.repository';
import { ChatRoomMapper } from './infrastructure/persistence/mappers/chat-room.mapper';
import { PrismaChatMessageRepository } from './infrastructure/persistence/prisma-chat-message.repository';
import { ChatMessageMapper } from './infrastructure/persistence/mappers/chat-message.mapper';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';
import { NotificationMapper } from './infrastructure/persistence/mappers/notification.mapper';
import { PrismaUserComplaintRepository } from './infrastructure/persistence/prisma-user-complaint.repository';
import { UserComplaintMapper } from './infrastructure/persistence/mappers/user-complaint.mapper';

import { ChatGateway } from './infrastructure/websocket/chat.gateway';
import { NotificationTemplateService } from './application/services/notification-template.service';
import { OrderCreatedNotificationHandler } from './application/event-handlers/order-created-notification.handler';
import { TradeOfferAcceptedNotificationHandler } from './application/event-handlers/trade-offer-accepted-notification.handler';

@Module({
  imports: [
    CqrsModule,
    RabbitMQModule,
  ],
  controllers: [
    ChatController, 
    NotificationController, 
    ComplaintController, 
    CommunicationAdminController
  ],
  providers: [
    PrismaService,
    ChatGateway,
    NotificationTemplateService,
    // Handlers (Commands)
    CreateChatRoomHandler,
    SendMessageHandler,
    CreateNotificationHandler,
    CreateComplaintHandler,
    MarkMessagesReadHandler,
    MarkNotificationReadHandler,
    // Handlers (Queries)
    GetChatRoomsHandler,
    GetMessagesHandler,
    GetNotificationsHandler,
    GetNotificationUnreadCountHandler,
    // Handlers (Events)
    OrderCreatedNotificationHandler,
    TradeOfferAcceptedNotificationHandler,
    // Mappers
    ChatRoomMapper,
    ChatMessageMapper,
    NotificationMapper,
    UserComplaintMapper,
    // Repositories
    { provide: 'IChatRoomRepository', useClass: PrismaChatRoomRepository },
    { provide: 'IChatMessageRepository', useClass: PrismaChatMessageRepository },
    { provide: 'INotificationRepository', useClass: PrismaNotificationRepository },
    { provide: 'IUserComplaintRepository', useClass: PrismaUserComplaintRepository },
  ],
  exports: [NotificationTemplateService],
})
export class CommunicationModule {}
