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
import { CreateLotteryDto } from './application/dtos/create-lottery.dto';
import { UpdateLotteryDto } from './application/dtos/update-lottery.dto';
import { LotteryStatus } from './domain/enums/lottery-status.enum';

interface AuthenticatedUser {
  id: string;
  role: string;
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
  async getLotteries(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.LotteryWhereInput = {};
    if (status && Object.values(LotteryStatus).includes(status as LotteryStatus)) {
      where.status = status as LotteryStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.lottery.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          listing: {
            include: {
              catalogProduct: { include: { media: true } },
            },
          },
          _count: { select: { tickets: true } },
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
    @Body() dto: CreateLotteryDto,
  ) {
    const item = await this.prisma.lottery.create({
      data: {
        title: dto.title,
        prizeDescription: dto.prizeDescription ?? '',
        ticketPrice: dto.ticketPrice,
        totalTickets: dto.totalTickets,
        maxTicketsPerUser: dto.maxTicketsPerUser,
        ticketDigits: dto.ticketDigits,
        numbersPerTicket: dto.numbersPerTicket,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        prizeValue: dto.prizeValue,
        status: LotteryStatus.ACTIVE,
        ownerId: user.id,
        ...(dto.listingId ? { listing: { connect: { id: dto.listingId } } } : {}),
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
    @Body() dto: UpdateLotteryDto,
  ) {
    const data: Prisma.LotteryUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.prizeDescription !== undefined) data.prizeDescription = dto.prizeDescription;
    if (dto.ticketPrice !== undefined) data.ticketPrice = dto.ticketPrice;
    if (dto.totalTickets !== undefined) data.totalTickets = dto.totalTickets;
    if (dto.maxTicketsPerUser !== undefined) data.maxTicketsPerUser = dto.maxTicketsPerUser;
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.prizeValue !== undefined) data.prizeValue = dto.prizeValue;

    const item = await this.prisma.lottery.update({ where: { id }, data });

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_UPDATED',
      resourceType: 'Lottery',
      resourceId: id,
      newValue: data as Record<string, unknown>,
    });

    return { success: true, data: item };
  }

  @ApiOperation({ summary: 'Çekilişi sonlandır ve kazananı belirle' })
  @Post(':id/end')
  async endLottery(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
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
