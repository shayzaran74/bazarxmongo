// apps/backend/src/modules/auction/auction-admin.controller.ts

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Delete, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../audit/application/audit-log.service';
import { CreateAuctionDto } from './application/dtos/create-auction.dto';
import { UpdateAuctionDto } from './application/dtos/update-auction.dto';
import { AdvanceWinnerCommand } from './application/commands/advance-winner.command';
import { AuctionStatus } from './domain/enums/auction-status.enum';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Admin/Auctions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/auctions')
export class AuctionAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
    private readonly auditLog: AuditLogService,
  ) {}

  @ApiOperation({ summary: 'Tüm açık artırmaları listele (Admin)' })
  @Get()
  async getAuctions(
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.AuctionWhereInput = {};
    if (status && Object.values(AuctionStatus).includes(status as AuctionStatus)) {
      where.status = status as AuctionStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.auction.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          listing: {
            include: {
              catalogProduct: { include: { media: true } },
            },
          },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auction.count({ where }),
    ]);

    return { success: true, data: { items, total } };
  }

  @ApiOperation({ summary: 'Yeni açık artırma oluştur' })
  @Post()
  async createAuction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAuctionDto,
  ) {
    // productId hem Listing.id hem CatalogProduct.id olabilir
    let listing = await this.prisma.listing.findUnique({ where: { id: dto.productId } });
    if (!listing) {
      listing = await this.prisma.listing.findFirst({
        where: { catalogProductId: dto.productId },
      });
    }
    if (!listing) {
      throw new BadRequestException('Seçilen ürün için aktif bir satış ilanı (listing) bulunamadı.');
    }

    const item = await this.prisma.auction.create({
      data: {
        startingPrice: dto.startPrice,
        currentPrice: dto.startPrice,
        minBidIncrement: dto.minBidIncrement,
        participationDeposit: dto.participationDeposit ?? 0,
        startTime: dto.startTime ? new Date(dto.startTime) : new Date(),
        endTime: new Date(dto.endTime),
        status: AuctionStatus.ACTIVE,
        userId: user.id,
        listing: { connect: { id: listing.id } },
      },
    });

    if (dto.title || dto.description) {
      await this.prisma.listing.update({
        where: { id: listing.id },
        data: {
          title: dto.title ?? listing.title,
          description: dto.description ?? listing.description,
          isAuctionEnabled: true,
        },
      });
    } else {
      await this.prisma.listing.update({
        where: { id: listing.id },
        data: { isAuctionEnabled: true },
      });
    }

    await this.auditLog.log({
      actorId: user.id,
      action: 'AUCTION_CREATED',
      resourceType: 'Auction',
      resourceId: item.id,
      newValue: { startingPrice: item.startingPrice.toString(), endTime: item.endTime },
    });

    return { success: true, data: item };
  }

  @ApiOperation({ summary: 'Açık artırmayı güncelle' })
  @Put(':id')
  async updateAuction(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAuctionDto,
  ) {
    const data: Prisma.AuctionUpdateInput = {};
    if (dto.startPrice !== undefined) data.startingPrice = dto.startPrice;
    if (dto.minBidIncrement !== undefined) data.minBidIncrement = dto.minBidIncrement;
    if (dto.participationDeposit !== undefined) data.participationDeposit = dto.participationDeposit;
    if (dto.startTime !== undefined) data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.status !== undefined) data.status = dto.status;

    const item = await this.prisma.auction.update({ where: { id }, data });

    // Listing alanlarını sadece sağlanan değerlerle güncelle
    if (dto.title !== undefined || dto.description !== undefined) {
      const auction = await this.prisma.auction.findUnique({ where: { id }, select: { listingId: true } });
      if (auction) {
        await this.prisma.listing.update({
          where: { id: auction.listingId },
          data: {
            ...(dto.title !== undefined ? { title: dto.title } : {}),
            ...(dto.description !== undefined ? { description: dto.description } : {}),
          },
        });
      }
    }

    await this.auditLog.log({
      actorId: user.id,
      action: 'AUCTION_UPDATED',
      resourceType: 'Auction',
      resourceId: id,
      newValue: data as Record<string, unknown>,
    });

    return { success: true, data: item };
  }

  @ApiOperation({ summary: 'Sıradaki kazanana devret' })
  @Post(':id/advance-winner')
  async advanceWinner(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    const result = await this.commandBus.execute(new AdvanceWinnerCommand(id, admin.id));
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Tüm katılım taleplerini listele (Admin)' })
  @Get('participations')
  async getParticipations() {
    const items = await this.prisma.auctionParticipation.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        auction: {
          select: {
            id: true,
            participationDeposit: true,
            listing: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Katılım talebini onayla' })
  @Post('participations/:id/approve')
  async approveParticipation(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const participation = await this.prisma.auctionParticipation.findUniqueOrThrow({
      where: { id },
    });

    if (!['DEPOSIT_HELD', 'PENDING'].includes(participation.status)) {
      throw new BadRequestException('Bu katılım onaylanamaz: geçersiz durum');
    }

    await this.prisma.auctionParticipation.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    await this.auditLog.log({
      actorId: admin.id,
      action: 'AUCTION_PARTICIPATION_APPROVED',
      resourceType: 'AuctionParticipation',
      resourceId: id,
      oldValue: { status: participation.status },
      newValue: { status: 'APPROVED' },
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Katılım talebini reddet' })
  @Post('participations/:id/reject')
  async rejectParticipation(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const participation = await this.prisma.auctionParticipation.findUniqueOrThrow({
      where: { id },
    });

    await this.prisma.auctionParticipation.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await this.auditLog.log({
      actorId: admin.id,
      action: 'AUCTION_PARTICIPATION_REJECTED',
      resourceType: 'AuctionParticipation',
      resourceId: id,
      oldValue: { status: participation.status },
      newValue: { status: 'REJECTED' },
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Açık artırmayı sil' })
  @Delete(':id')
  async deleteAuction(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    await this.prisma.auction.delete({ where: { id } });
    await this.auditLog.log({
      actorId: admin.id,
      action: 'AUCTION_DELETED',
      resourceType: 'Auction',
      resourceId: id,
    });
    return { success: true };
  }
}
