// apps/backend/src/modules/auction/auction.controller.ts

import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { PlaceBidCommand } from './application/commands/place-bid.command';
import { DrawLotteryCommand } from './application/commands/draw-lottery.command';
import { PlaceBidDto } from './place-bid.dto';
import { DrawLotteryDto } from './draw-lottery.dto';
import { FinancialGatewayService } from '../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../audit/application/audit-log.service';

interface AuctionListQuery {
  page?: string;
  limit?: string;
  status?: string;
}

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Aktif açık artırmaları listele' })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async getActiveAuctions(@Query() query: AuctionListQuery) {
    const page  = parseInt(query.page  ?? '1',  10) || 1;
    const limit = parseInt(query.limit ?? '20', 10) || 20;
    const skip  = (page - 1) * limit;

    const statusFilter = (query.status ?? 'ACTIVE').toUpperCase();
    const now = new Date();

    const where: Prisma.AuctionWhereInput =
      statusFilter === 'ACTIVE'
        ? { status: 'ACTIVE', startTime: { lte: now }, endTime: { gte: now } }
        : { status: statusFilter as any };

    const [items, total] = await Promise.all([
      this.prisma.auction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { endTime: 'asc' }, // en yakın biten önce
        include: {
          listing: {
            include: {
              catalogProduct: {
                include: { media: true }
              },
              vendor: {
                include: { profile: true }
              }
            }
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 1, // son teklif
            select: { amount: true, userId: true, createdAt: true },
          },
        },
      }),
      this.prisma.auction.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  @Public()
  @ApiOperation({ summary: 'Artırma detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async getAuction(@Param('id') id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            catalogProduct: {
              include: { media: true }
            },
            vendor: {
              include: { profile: true }
            }
          }
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { 
            user: { 
              select: { 
                profile: { select: { firstName: true, lastName: true } } 
              } 
            } 
          }
        },
      },
    });
    if (!auction) return { success: false, error: 'Bulunamadı' };
    return { success: true, data: auction };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Teklif ver' })
  @Post(':id/bid')
  async placeBid(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Body() dto: PlaceBidDto) {
    return this.commandBus.execute(new PlaceBidCommand(id, user.id, dto.amount));
  }

  @Public()
  @Get(':id/bids')
  async getAuctionBids(@Param('id') id: string) {
    const bids = await this.prisma.auctionBid.findMany({
      where: { auctionId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            profile: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
    return { success: true, data: bids };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/participation')
  async getParticipation(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const p = await this.prisma.auctionParticipation.findUnique({
      where: { auctionId_userId: { auctionId: id, userId: user.id } }
    });
    return { success: true, data: p };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/participate')
  async participate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) return { success: false, message: 'Açık artırma bulunamadı' };
    if (auction.status !== 'ACTIVE') {
      return { success: false, message: 'Bu açık artırma şu an katılıma açık değil' };
    }

    // Mevcut katılım varsa ve teminat alınmışsa idempotent dön
    const existing = await this.prisma.auctionParticipation.findUnique({
      where: { auctionId_userId: { auctionId: id, userId: user.id } },
    });
    if (existing && existing.status !== 'PENDING') {
      return { success: true, data: existing };
    }

    const hasDeposit =
      auction.participationDeposit !== null &&
      Number(auction.participationDeposit) > 0;

    let holdId: string | null = null;

    if (hasDeposit) {
      // Financial Service'ten gerçek teminat blokajı al
      const idempotencyKey = `auction-participate-${id}-${user.id}`;
      const referenceId = `auction-participate-${id}-${user.id}`;
      const holdResult = await this.financialGateway.holdFunds(
        user.id,
        auction.participationDeposit!.toString(),
        'AUCTION_BID',
        referenceId,
        'AUCTION_PARTICIPATION',
        idempotencyKey,
      );
      holdId = holdResult.holdId as string;
    }

    // Teminat alındıysa DEPOSIT_HELD, yoksa doğrudan ACTIVE
    const status = hasDeposit ? 'DEPOSIT_HELD' : 'ACTIVE';

    const p = await this.prisma.auctionParticipation.upsert({
      where: { auctionId_userId: { auctionId: id, userId: user.id } },
      update: { status, holdId, blockedAmount: auction.participationDeposit ?? 0 },
      create: {
        auctionId: id,
        userId: user.id,
        status,
        holdId,
        blockedAmount: auction.participationDeposit ?? 0,
      },
    });

    await this.auditLog.log({
      actorId: user.id,
      action: 'AUCTION_PARTICIPATE',
      resourceType: 'AuctionParticipation',
      resourceId: p.id,
      newValue: {
        auctionId: id,
        holdId,
        blockedAmount: auction.participationDeposit?.toString() ?? '0',
        status,
      },
    });

    return { success: true, data: p };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/claim')
  async claim(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction || auction.winnerId !== user.id) {
      return { success: false, message: 'Bu açık artırmayı kazanan siz değilsiniz.' };
    }
    // İleride burada ödeme/teslimat mantığı eklenebilir
    return { success: true, message: 'Kazanım onaylandı' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Piyango çekilişi (Admin)' })
  @Post('draw')
  async drawLottery(@Body() dto: DrawLotteryDto) {
    return this.commandBus.execute(new DrawLotteryCommand(dto.lotteryId));
  }
}
