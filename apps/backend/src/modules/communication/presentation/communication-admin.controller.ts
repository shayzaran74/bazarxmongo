// apps/backend/src/modules/communication/presentation/communication-admin.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { IUserComplaint } from '@barterborsa/shared-persistence';
import { CreateNotificationDto } from '../application/dtos/create-notification.dto';
import { CreateNotificationCommand } from '../application/commands/create-notification.command';

@ApiTags('Communication Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/communication')
export class CommunicationAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectModel('UserComplaint') private readonly complaintModel: Model<IUserComplaint>,
  ) {}

  @ApiOperation({ summary: 'Şikayetleri listele (Admin)' })
  @Get('complaints')
  async getComplaints(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.complaintModel.find(where).skip(skip).limit(take).sort({ createdAt: -1 }).lean(),
      this.complaintModel.countDocuments(where),
    ]);

    return {
      success: true, data,
      meta: { page: parseInt(page, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  @ApiOperation({ summary: 'Send bulk notification (Admin)' })
  @Post('notifications/bulk')
  sendBulkNotification(@Body() dto: CreateNotificationDto) {
    return this.commandBus.execute(
      new CreateNotificationCommand(dto.userId, dto.type, dto.title, dto.message, dto.link),
    );
  }
}
