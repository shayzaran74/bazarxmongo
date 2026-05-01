// apps/backend/src/modules/auction/lottery-admin.controller.ts

import { Controller, Get, Post, Put, Body, Param, UseGuards, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CommandBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../audit/application/audit-log.service';
import { DrawLotteryCommand } from './application/commands/draw-lottery.command';

interface AuthenticatedUser {
  id: string;
  role: string;
}

interface LotteryListQuery {
  status?: string;
  page?: string;
  limit?: string;
}

@ApiTags('Admin/Lotteries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/lotteries')
export class LotteryAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
    private readonly auditLog: AuditLogService,
  ) {}

  @ApiOperation({ summary: 'Tüm çekilişleri listele (Admin)' })
  @Get()
  async getLotteries(@Query() query: LotteryListQuery) {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const limit = parseInt(query.limit ?? '20', 10) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LotteryWhereInput = {};
    if (query.status) where.status = query.status as any;

    const [items, total] = await Promise.all([
      this.prisma.lottery.findMany({
        where,
        skip,
        take: limit,
        include: {
          listing: {
            include: {
              catalogProduct: { include: { media: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lottery.count({ where }),
    ]);

    return { success: true, data: { items, total } };
  }

  @ApiOperation({ summary: 'Yeni çekiliş oluştur' })
  @Post()
  async createLottery(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Record<string, unknown>,
  ) {
    const ticketPrice = Number((dto.ticketPrice as string | undefined) ?? 0);

    const item = await this.prisma.lottery.create({
      data: {
        title: dto.title as string,
        prizeDescription: (dto.prizeDescription as string | undefined) ?? '',
        ticketPrice,
        totalTickets: Number((dto.totalTickets as string | undefined) ?? 100),
        maxTicketsPerUser: Number((dto.maxTicketsPerUser as string | undefined) ?? 10),
        startTime: dto.startTime ? new Date(dto.startTime as string) : new Date(),
        endTime: new Date(dto.endTime as string),
        status: 'ACTIVE',
        ownerId: user.id,
        listing: { connect: { id: dto.listingId as string } },
      },
    });

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_CREATED',
      resourceType: 'Lottery',
      resourceId: item.id,
      newValue: { title: item.title, ticketPrice: item.ticketPrice.toString(), totalTickets: item.totalTickets },
    });

    return { success: true, data: item };
  }

  @ApiOperation({ summary: 'Çekilişi güncelle' })
  @Put(':id')
  async updateLottery(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: Record<string, unknown>,
  ) {
    const data: Record<string, unknown> = {};
    if (dto.title) data.title = dto.title as string;
    if (dto.prizeDescription) data.prizeDescription = dto.prizeDescription as string;
    if (dto.ticketPrice !== undefined) data.ticketPrice = Number(dto.ticketPrice as string);
    if (dto.totalTickets !== undefined) data.totalTickets = Number(dto.totalTickets as string);
    if (dto.maxTicketsPerUser !== undefined) data.maxTicketsPerUser = Number(dto.maxTicketsPerUser as string);
    if (dto.startTime) data.startTime = new Date(dto.startTime as string);
    if (dto.endTime) data.endTime = new Date(dto.endTime as string);
    if (dto.status) data.status = dto.status as string;

    const item = await this.prisma.lottery.update({ where: { id }, data });

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_UPDATED',
      resourceType: 'Lottery',
      resourceId: id,
      newValue: data,
    });

    return { success: true, data: item };
  }

  @ApiOperation({ summary: 'Çekilişi sonlandır ve kazananı belirle' })
  @Post(':id/end')
  async endLottery(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    // DrawLotteryCommand hem kura çeker hem kazananı atar hem de AuditLog yazar
    const result = await this.commandBus.execute(new DrawLotteryCommand(id, user.id));
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Çekilişi sil' })
  @Delete(':id')
  async deleteLottery(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const lottery = await this.prisma.lottery.findUniqueOrThrow({ where: { id } });
    await this.prisma.lottery.delete({ where: { id } });

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_DELETED',
      resourceType: 'Lottery',
      resourceId: id,
      oldValue: { title: lottery.title, status: lottery.status },
    });

    return { success: true };
  }
}
