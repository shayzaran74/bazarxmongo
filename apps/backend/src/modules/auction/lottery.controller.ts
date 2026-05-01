// apps/backend/src/modules/auction/lottery.controller.ts

import * as crypto from 'crypto';
import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { Prisma } from '@prisma/client';
import { DomainException } from '@barterborsa/shared-core';
import { FinancialGatewayService } from '../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../audit/application/audit-log.service';
import { LotteryParticipateDto } from './lottery-participate.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
}

interface LotteryListQuery {
  page?: string;
  limit?: string;
  categoryId?: string;
}

@ApiTags('Lotteries')
@Controller('lotteries')
export class LotteryController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Aktif çekilişleri listele' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  async getActiveLotteries(@Query() query: LotteryListQuery) {
    const page = parseInt(query.page ?? '1', 10) || 1;
    const limit = parseInt(query.limit ?? '20', 10) || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.LotteryWhereInput = { status: 'ACTIVE' };
    if (query.categoryId) where.listing = { categoryId: query.categoryId };

    const [items, total] = await Promise.all([
      this.prisma.lottery.findMany({
        where,
        skip,
        take: limit,
        include: {
          listing: {
            include: {
              catalogProduct: { include: { media: true } },
              vendor: { include: { profile: true } },
            },
          },
          _count: { select: { tickets: true } },
        },
        orderBy: { endTime: 'asc' },
      }),
      this.prisma.lottery.count({ where }),
    ]);

    return { success: true, data: items, meta: { page, limit, total } };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Çekiliş detayını getir' })
  async getLottery(@Param('id') id: string) {
    const item = await this.prisma.lottery.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            catalogProduct: { include: { media: true } },
            vendor: { include: { profile: true } },
          },
        },
        _count: { select: { tickets: true } },
      },
    });

    return { success: true, data: item };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/participate')
  @ApiOperation({ summary: 'Çekilişe katıl (Bilet al)' })
  async participate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: LotteryParticipateDto,
  ) {
    const lottery = await this.prisma.lottery.findUnique({ where: { id } });
    if (!lottery) return { success: false, message: 'Çekiliş bulunamadı' };
    if (lottery.status !== 'ACTIVE') return { success: false, message: 'Çekiliş aktif değil' };
    if (new Date() > lottery.endTime) return { success: false, message: 'Çekiliş süresi dolmuş' };

    const quantity = dto.quantity;

    // Kullanıcının mevcut bilet sayısı kontrolü
    const userTicketCount = await this.prisma.lotteryTicket.count({
      where: { lotteryId: id, userId: user.id },
    });
    if (userTicketCount + quantity > lottery.maxTicketsPerUser) {
      return {
        success: false,
        message: `Kişi başı maksimum ${lottery.maxTicketsPerUser} bilet alınabilir`,
      };
    }

    // Toplam bilet kotası kontrolü
    const totalSold = await this.prisma.lotteryTicket.count({ where: { lotteryId: id } });
    if (totalSold + quantity > lottery.totalTickets) {
      return { success: false, message: 'Yeterli bilet kalmadı' };
    }

    // Her bilet için çakışmasız numaralar üret
    const ticketNumbers: string[][] = [];
    for (let i = 0; i < quantity; i++) {
      const numbers = await this.generateUniqueNumbers(
        id,
        lottery.ticketDigits,
        lottery.numbersPerTicket,
        lottery.totalTickets,
      );
      ticketNumbers.push(numbers);
    }

    // Bilet ücreti kadar cüzdandan teminat al (ownerId = satıcı/çekiliş sahibi)
    const totalAmount = Number(lottery.ticketPrice) * quantity;
    const idempotencyKey = `lottery-ticket-${id}-${user.id}-${Date.now()}`;
    const holdResult = await this.financialGateway.holdFunds(
      user.id,
      totalAmount.toString(),
      'LOTTERY_TICKET',
      id,
      'LOTTERY',
      idempotencyKey,
      lottery.ownerId,
    );
    const holdId = holdResult.holdId as string;

    // Biletleri atomik işlem içinde kaydet
    const createdTickets = await this.prisma.$transaction(
      ticketNumbers.map((numbers) =>
        this.prisma.lotteryTicket.create({
          data: { lotteryId: id, userId: user.id, numbers },
        }),
      ),
    );

    await this.auditLog.log({
      actorId: user.id,
      action: 'LOTTERY_TICKET_PURCHASED',
      resourceType: 'LotteryTicket',
      resourceId: id,
      newValue: {
        lotteryId: id,
        quantity,
        totalAmount: totalAmount.toString(),
        holdId,
        ticketIds: createdTickets.map((t) => t.id),
      },
    });

    return { success: true, data: { tickets: createdTickets, holdId } };
  }

  // Çakışmasız benzersiz bilet numaraları üretir (maks 5 deneme)
  private async generateUniqueNumbers(
    lotteryId: string,
    ticketDigits: number,
    numbersPerTicket: number,
    totalTickets: number,
  ): Promise<string[]> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidates: string[] = [];
      for (let i = 0; i < numbersPerTicket; i++) {
        const n = crypto.randomInt(0, totalTickets);
        candidates.push(n.toString().padStart(ticketDigits, '0'));
      }

      // Aynı çekilişte bu numaralardan herhangi biri başka bilette var mı?
      const collision = await this.prisma.lotteryTicket.findFirst({
        where: { lotteryId, numbers: { hasSome: candidates } },
      });

      if (!collision) return candidates;
    }

    throw new DomainException(
      'Benzersiz bilet numarası üretilemedi; çekiliş biletleri dolmuş olabilir',
    );
  }
}
