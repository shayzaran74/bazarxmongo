// apps/backend/src/modules/communication/communication.module.ts
// CommunicationModule — Mongoose migration (ADR-005 Faz 2c)

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@barterborsa/shared-messaging';

import { ChatController } from './presentation/chat.controller';
import { NotificationController } from './presentation/notification.controller';
import { ComplaintController } from './presentation/complaint.controller';
import { CommunicationAdminController } from './presentation/communication-admin.controller';
import { ChatAdminController } from './presentation/chat-admin.controller';

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

import { MongoChatRoomRepository } from './infrastructure/persistence/mongo-chat-room.repository';
import { ChatRoomMapper } from './infrastructure/persistence/mappers/chat-room.mapper';
import { MongoChatMessageRepository } from './infrastructure/persistence/mongo-chat-message.repository';
import { ChatMessageMapper } from './infrastructure/persistence/mappers/chat-message.mapper';
import { MongoNotificationRepository } from './infrastructure/persistence/mongo-notification.repository';
import { NotificationMapper } from './infrastructure/persistence/mappers/notification.mapper';
import { MongoUserComplaintRepository } from './infrastructure/persistence/mongo-user-complaint.repository';
import { UserComplaintMapper } from './infrastructure/persistence/mappers/user-complaint.mapper';

import { ChatGateway } from './infrastructure/websocket/chat.gateway';
import { NotificationTemplateService } from './application/services/notification-template.service';
import { SilentHoursService } from './application/services/silent-hours.service';
import { OrderCreatedNotificationHandler } from './application/event-handlers/order-created-notification.handler';
import { TradeOfferAcceptedNotificationHandler } from './application/event-handlers/trade-offer-accepted-notification.handler';
import { UserRegisteredNotificationHandler } from './application/event-handlers/user-registered-notification.handler';
import { MailService } from './infrastructure/mail/mail.service';
import { FcmService } from './infrastructure/push/fcm.service';

import { ChatRoom, ChatRoomSchema } from '@barterborsa/shared-persistence/schemas/backend/chatRoom.schema';
import { ChatMessage, ChatMessageSchema } from '@barterborsa/shared-persistence/schemas/backend/chatMessage.schema';
import { Notification, NotificationSchema } from '@barterborsa/shared-persistence/schemas/backend/notification.schema';
import { UserComplaint, UserComplaintSchema } from '@barterborsa/shared-persistence/schemas/backend/userComplaint.schema';
import { OrderSchema, TradeOfferSchema } from '@barterborsa/shared-persistence';

@Module({
  imports: [
    CqrsModule,
    RabbitMQModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: 'ChatRoom', schema: ChatRoomSchema },
      { name: 'ChatMessage', schema: ChatMessageSchema },
      { name: 'Notification', schema: NotificationSchema },
      { name: 'UserComplaint', schema: UserComplaintSchema },
      { name: 'Order',      schema: OrderSchema },
      { name: 'TradeOffer', schema: TradeOfferSchema },
    ]),
  ],
  controllers: [
    ChatController,
    NotificationController,
    ComplaintController,
    CommunicationAdminController,
    ChatAdminController
  ],
  providers: [
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
    UserRegisteredNotificationHandler,
    // Mappers
    ChatRoomMapper,
    ChatMessageMapper,
    NotificationMapper,
    UserComplaintMapper,
    // Repositories
    { provide: 'IChatRoomRepository', useClass: MongoChatRoomRepository },
    { provide: 'IChatMessageRepository', useClass: MongoChatMessageRepository },
    { provide: 'INotificationRepository', useClass: MongoNotificationRepository },
    { provide: 'IUserComplaintRepository', useClass: MongoUserComplaintRepository },
    MailService,
    FcmService,
    SilentHoursService,
  ],
  exports: [NotificationTemplateService, MailService, FcmService, SilentHoursService],
})
export class CommunicationModule {}
