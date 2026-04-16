// apps/backend/src/modules/communication/presentation/notification.controller.ts

import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetNotificationsQuery } from '../application/queries/get-notifications.query';
import { GetNotificationUnreadCountQuery } from '../application/queries/get-notification-unread-count.query';
import { MarkNotificationReadCommand } from '../application/commands/mark-notification-read.command';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.queryBus.execute(
      new GetNotificationsQuery(user.id, limit ? Number(limit) : 20, offset ? Number(offset) : 0)
    );
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return this.queryBus.execute(new GetNotificationUnreadCountQuery(user.id));
  }

  @Patch(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.commandBus.execute(new MarkNotificationReadCommand(id, user.id));
  }
}
