// apps/backend/src/modules/communication/presentation/chat-admin.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Chat Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/chats')
export class ChatAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Tüm chat odaları (Admin)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200 })
  @Get()
  async getChats(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.chatRoom.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { content: true, createdAt: true, senderId: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.chatRoom.count({ where }),
    ]);

    return {
      success: true,
      data,
      meta: { page: parseInt(page, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    };
  }
}
