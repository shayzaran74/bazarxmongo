// apps/backend/src/modules/auction/auction-admin.controller.ts

import { Controller, Get, Post, Put, Body, Param, UseGuards, Delete, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CurrentUser } from '@barterborsa/shared-nest';
import { AuditLogService } from '../audit/application/audit-log.service';

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
  private readonly logger = new Logger(AuctionAdminController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  @ApiOperation({ summary: 'Tüm açık artırmaları listele (Admin)' })
  @Get()
  async getAuctions() {
    const items = await this.prisma.auction.findMany({
      include: {
        listing: {
          include: {
            catalogProduct: {
              include: { media: true }
            }
          }
        },
        _count: { select: { bids: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Yeni açık artırma oluştur' })
  @Post()
  async createAuction(@CurrentUser() user: AuthenticatedUser, @Body() dto: Record<string, unknown>) {
    try {
      const startPrice = Number((dto.startPrice as string | undefined) || (dto.startingPrice as string | undefined) || 0);
      
      // 1. Ürün ID'sinin (Listing veya CatalogProduct) geçerliliğini kontrol et
      let listing = await this.prisma.listing.findUnique({
        where: { id: dto.productId as string }
      });

      if (!listing) {
        listing = await this.prisma.listing.findFirst({
          where: { catalogProductId: dto.productId as string }
        });
      }

      if (!listing) {
        throw new BadRequestException('Seçilen ürün için aktif bir satış ilanı (listing) bulunamadı.');
      }

      // 2. Açık artırmayı oluştur
      const item = await this.prisma.auction.create({
        data: {
          startingPrice: startPrice,
          currentPrice: startPrice,
          minBidIncrement: Number((dto.minBidIncrement as string | undefined) || 1),
          participationDeposit: dto.participationDeposit ? Number(dto.participationDeposit as string) : 0,
          startTime: dto.startTime ? new Date(dto.startTime as string) : new Date(),
          endTime: new Date(dto.endTime as string),
          status: 'ACTIVE',
          userId: user.id,
          listing: { connect: { id: listing.id } }
        }
      });

      // 3. İlgili ilanı güncelle
      await this.prisma.listing.update({
        where: { id: listing.id },
        data: {
          title: dto.title || listing.title,
          description: dto.description || listing.description,
          isAuctionEnabled: true
        }
      });

      return { success: true, data: item };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      this.logger.error('Açık artırma oluşturma hatası', msg);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Açık artırmayı güncelle' })
  @Put(':id')
  async updateAuction(@Param('id') id: string, @Body() dto: Record<string, unknown>) {
    try {
      const data: Record<string, unknown> = {};
      if (dto.startPrice !== undefined) data.startingPrice = Number(dto.startPrice as string);
      if (dto.minBidIncrement !== undefined) data.minBidIncrement = Number(dto.minBidIncrement as string);
      if (dto.participationDeposit !== undefined) data.participationDeposit = Number(dto.participationDeposit as string);
      if (dto.startTime) data.startTime = new Date(dto.startTime as string);
      if (dto.endTime) data.endTime = new Date(dto.endTime as string);
      if (dto.status) data.status = (dto.status as string).toUpperCase();

      const item = await this.prisma.auction.update({
        where: { id },
        data: data as any
      });

      const auction = await this.prisma.auction.findUnique({ where: { id }, select: { listingId: true } });
      if (auction && (dto.title || dto.description)) {
        await this.prisma.listing.update({
          where: { id: auction.listingId },
          data: {
            title: dto.title as string | undefined,
            description: dto.description as string | undefined,
          }
        });
      }

      return { success: true, data: item };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      this.logger.error('Açık artırma güncelleme hatası', msg);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Tüm katılım taleplerini listele (Admin)' })
  @Get('participations')
  async getParticipations() {
    const items = await this.prisma.auctionParticipation.findMany({
      include: {
        user: { 
          include: { 
            profile: { select: { firstName: true, lastName: true } } 
          } 
        },
        auction: { include: { listing: { select: { title: true } } } }
      },
      orderBy: { createdAt: 'desc' }
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

    // Yalnızca DEPOSIT_HELD veya PENDING durumundaki katılımlar onaylanabilir
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
  async deleteAuction(@Param('id') id: string) {
    await this.prisma.auction.delete({ where: { id } });
    return { success: true };
  }
}
