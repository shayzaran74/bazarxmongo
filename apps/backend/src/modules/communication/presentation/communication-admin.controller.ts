// apps/backend/src/modules/communication/presentation/communication-admin.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
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
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Şikayetleri listele (Admin)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  @Get('complaints')
  async getComplaints(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.userComplaint.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userComplaint.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { page: parseInt(page, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }

  @ApiOperation({ summary: 'Send bulk notification (Admin)' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201 })
  @Post('notifications/bulk')
  async sendBulkNotification(@Body() dto: CreateNotificationDto) {
    return this.commandBus.execute(
      new CreateNotificationCommand(dto.userId, dto.type, dto.title, dto.message, dto.link),
    );
  }
}
