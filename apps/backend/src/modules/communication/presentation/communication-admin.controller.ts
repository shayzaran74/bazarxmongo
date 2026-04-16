// apps/backend/src/modules/communication/presentation/communication-admin.controller.ts

import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '@barterborsa/shared-nest';
import { CreateNotificationDto } from '../application/dtos/notification-complaint.dtos';
import { CreateNotificationCommand } from '../application/commands/create-notification.command';

@Controller('admin/communication')
@Roles('ADMIN')
export class CommunicationAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('complaints')
  async getComplaints(@Query('status') status?: string) {
    // Should use GetComplaintsQuery
    return [];
  }

  @Post('notifications/bulk')
  async sendBulkNotification(@Body() dto: CreateNotificationDto) {
    return this.commandBus.execute(
      new CreateNotificationCommand(dto.userId, dto.type, dto.title, dto.message, dto.link)
    );
  }
}
