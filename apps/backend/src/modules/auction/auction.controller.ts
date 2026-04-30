// apps/backend/src/modules/auction/auction.controller.ts

import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiProperty } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { PlaceBidCommand } from './application/commands/place-bid.command';
import { DrawLotteryCommand } from './application/commands/draw-lottery.command';
import { PlaceBidDto } from './place-bid.dto';
import { DrawLotteryDto } from './draw-lottery.dto';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Aktif açık artırmaları listele' })
  @ApiQuery({ name: 'status', required: false, example: 'ACTIVE' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async getActiveAuctions(@Query() query: any) {
    const page  = parseInt(query.page, 10)  || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip  = (page - 1) * limit;

    const statusFilter = (query.status || 'ACTIVE').toUpperCase();
    const now = new Date();

    const where: any =
      statusFilter === 'ACTIVE'
        ? { status: 'ACTIVE', startTime: { lte: now }, endTime: { gte: now } }
        : { status: statusFilter };

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
                email: true, 
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
  async placeBid(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: PlaceBidDto) {
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
            email: true,
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
  async getParticipation(@Param('id') id: string, @CurrentUser() user: any) {
    const p = await this.prisma.auctionParticipation.findUnique({
      where: { auctionId_userId: { auctionId: id, userId: user.id } }
    });
    return { success: true, data: p };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/participate')
  async participate(@Param('id') id: string, @CurrentUser() user: any) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) return { success: false, message: 'Açık artırma bulunamadı' };

    const p = await this.prisma.auctionParticipation.upsert({
      where: { auctionId_userId: { auctionId: id, userId: user.id } },
      update: { status: 'ACTIVE' },
      create: {
        auctionId: id,
        userId: user.id,
        status: 'ACTIVE',
        blockedAmount: auction.participationDeposit || 0
      }
    });
    return { success: true, data: p };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/claim')
  async claim(@Param('id') id: string, @CurrentUser() user: any) {
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
