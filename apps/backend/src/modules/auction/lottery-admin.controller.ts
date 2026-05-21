// apps/backend/src/modules/auction/lottery-admin.controller.ts

import { Controller, Get, Post, Put, Body, Param, UseGuards, Delete, Query, Inject, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { CommandBus } from '@nestjs/cqrs';
import { AuditLogService } from '../audit/application/audit-log.service';
import { DrawLotteryCommand } from './application/commands/draw-lottery.command';
import { CreateLotteryDto } from './application/dtos/create-lottery.dto';
import { UpdateLotteryDto } from './application/dtos/update-lottery.dto';
import { LotteryStatus } from './domain/enums/lottery-status.enum';
import { ILotteryRepository } from './domain/repositories/lottery.repository.interface';
import { Lottery, LotteryProps } from './domain/entities/lottery.entity';

// Mongoose Decimal128 değerlerini unwrap eden yardımcı
type MongoDecimalLike = { $numberDecimal: string };
function unwrapDecimal(val: number | MongoDecimalLike | undefined): number | string | undefined {
  if (val === undefined) return undefined;
  if (typeof val === 'object' && val !== null) return val.$numberDecimal;
  return Number(val?.toString() ?? 0);
}

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Admin/Lotteries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/lotteries')
export class LotteryAdminController {
  constructor(
    @Inject('ILotteryRepository') private readonly lotteryRepository: ILotteryRepository,
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

    const filter: Record<string, unknown> = {};
    if (status && Object.values(LotteryStatus).includes(status as LotteryStatus)) {
      filter.status = status as LotteryStatus;
    }

    const result = await this.lotteryRepository.findWithFilters(filter, skip, limitNum);
    
    // Flatten result items
    const items = result.items.map(l => {
      const props = l.getProps();
      return {
        id: l.id,
        ...props,
        ticketPrice: unwrapDecimal(props.ticketPrice as number | MongoDecimalLike),
        prizeValue: unwrapDecimal(props.prizeValue as number | MongoDecimalLike | undefined),
      };
    });

    return { success: true, data: { items, total: result.total } };
  }

  @ApiOperation({ summary: 'Yeni çekiliş oluştur' })
  @Post()
  async createLottery(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateLotteryDto,
  ) {
    const now = new Date();
    const id = 'lottery-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const props: LotteryProps = {
      title: dto.title,
      prizeDescription: dto.prizeDescription ?? '',
      ticketPrice: dto.ticketPrice,
      totalTickets: dto.totalTickets,
      maxTicketsPerUser: dto.maxTicketsPerUser,
      ticketDigits: dto.ticketDigits,
      numbersPerTicket: dto.numbersPerTicket,
      startTime: now,
      endTime: new Date(dto.endTime),
      prizeValue: dto.prizeValue,
      status: LotteryStatus.ACTIVE,
      ownerId: user.id,
      listingId: dto.listingId,
      imageUrl: dto.imageUrl,
      createdAt: now,
      updatedAt: now,
    };
    const lottery = Lottery.createFrom(props, id);
    await this.lotteryRepository.save(lottery);

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_CREATED',
      resourceType: 'Lottery',
      resourceId: lottery.id,
      newValue: { title: props.title, ticketPrice: String(dto.ticketPrice), totalTickets: props.totalTickets },
    });

    return { success: true, data: { id: lottery.id, ...lottery.getProps() } };
  }

  @ApiOperation({ summary: 'Çekilişi güncelle' })
  @Put(':id')
  async updateLottery(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateLotteryDto,
  ) {
    const lottery = await this.lotteryRepository.findById(id);
    if (!lottery) throw new NotFoundException('Çekiliş bulunamadı');

    lottery.updateProps({
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.prizeDescription !== undefined ? { prizeDescription: dto.prizeDescription } : {}),
      ...(dto.ticketPrice !== undefined ? { ticketPrice: dto.ticketPrice } : {}),
      ...(dto.totalTickets !== undefined ? { totalTickets: dto.totalTickets } : {}),
      ...(dto.maxTicketsPerUser !== undefined ? { maxTicketsPerUser: dto.maxTicketsPerUser } : {}),
      ...(dto.startTime !== undefined ? { startTime: new Date(dto.startTime) } : {}),
      ...(dto.endTime !== undefined ? { endTime: new Date(dto.endTime) } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.prizeValue !== undefined ? { prizeValue: dto.prizeValue } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
    });

    await this.lotteryRepository.save(lottery);

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_UPDATED',
      resourceType: 'Lottery',
      resourceId: id,
      newValue: dto as Record<string, unknown>,
    });

    return { success: true, data: { id: lottery.id, ...lottery.getProps() } };
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
    const lottery = await this.lotteryRepository.findById(id);
    if (!lottery) throw new NotFoundException('Çekiliş bulunamadı');

    await this.lotteryRepository.delete(id);

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_DELETED',
      resourceType: 'Lottery',
      resourceId: id,
      oldValue: { title: lottery.getProps().title, status: lottery.getProps().status },
    });

    return { success: true };
  }
}