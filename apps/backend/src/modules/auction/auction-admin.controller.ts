// apps/backend/src/modules/auction/auction-admin.controller.ts

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Delete, BadRequestException, Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { AuditLogService } from '../audit/application/audit-log.service';
import { CreateAuctionDto } from './application/dtos/create-auction.dto';
import { UpdateAuctionDto } from './application/dtos/update-auction.dto';
import { AdvanceWinnerCommand } from './application/commands/advance-winner.command';
import { AuctionStatus } from './domain/enums/auction-status.enum';
import { IAuctionRepository } from './domain/repositories/auction.repository.interface';
import { IListingRepository } from '../catalog/domain/repositories/listing.repository.interface';
import { Auction } from './domain/entities/auction.entity';

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
    @Inject('IAuctionRepository') private readonly auctionRepository: IAuctionRepository,
    @Inject('IListingRepository') private readonly listingRepository: IListingRepository,
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

    const filter: Record<string, unknown> = {};
    if (status && Object.values(AuctionStatus).includes(status as AuctionStatus)) {
      filter.status = status as AuctionStatus;
    }

    const result = await this.auctionRepository.findWithFilters(filter, skip, limitNum);
    const { populateAuctions } = await import('./application/helpers/auction-population.helper');
    const populated = await populateAuctions(result.items);
    return { success: true, data: { items: populated, total: result.total } };
  }

  @ApiOperation({ summary: 'Yeni açık artırma oluştur' })
  @Post()
  async createAuction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAuctionDto,
  ) {
    // productId hem Listing.id hem CatalogProduct.id olabilir
    let listing = await this.listingRepository.findById(dto.productId);
    if (!listing) {
      listing = await this.listingRepository.findByProductId(dto.productId);
    }
    if (!listing) {
      throw new BadRequestException('Seçilen ürün için aktif bir satış ilanı (listing) bulunamadı.');
    }

    const now = new Date();
    const id = 'auction-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const props = {
      listingId: listing.id,
      userId: user.id,
      startingPrice: dto.startPrice as any,
      currentPrice: dto.startPrice as any,
      minBidIncrement: (dto.minBidIncrement ?? 1) as any,
      participationDeposit: dto.participationDeposit as any,
      startTime: dto.startTime ? new Date(dto.startTime) : now,
      endTime: new Date(dto.endTime),
      status: AuctionStatus.ACTIVE,
      currentWinnerStep: 1,
      createdAt: now,
      updatedAt: now,
    };
    const auction = Auction.createFrom(props, id);
    await this.auctionRepository.save(auction);

    // Listing'i açık artırma için etkinleştir
    const listingProps = listing.getProps();
    await this.listingRepository.updateListing(listing.id, {
      title: dto.title ?? listingProps.title,
      description: dto.description ?? listingProps.description,
      isAuctionEnabled: true,
    } as any);

    await this.auditLog.log({
      actorId: user.id,
      action: 'AUCTION_CREATED',
      resourceType: 'Auction',
      resourceId: auction.id,
      newValue: { startingPrice: String(dto.startPrice), endTime: dto.endTime },
    });

    const { populateAuctions } = await import('./application/helpers/auction-population.helper');
    const populated = await populateAuctions([auction]);
    return { success: true, data: populated[0] };
  }

  @ApiOperation({ summary: 'Açık artırmayı güncelle' })
  @Put(':id')
  async updateAuction(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateAuctionDto,
  ) {
    const auction = await this.auctionRepository.findById(id);
    if (!auction) throw new BadRequestException('Açık artırma bulunamadı');

    const props = auction.getProps();
    if (dto.startPrice !== undefined) (props as any).startingPrice = dto.startPrice;
    if (dto.minBidIncrement !== undefined) (props as any).minBidIncrement = dto.minBidIncrement;
    if (dto.participationDeposit !== undefined) (props as any).participationDeposit = dto.participationDeposit;
    if (dto.startTime !== undefined) (props as any).startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) (props as any).endTime = new Date(dto.endTime);
    if (dto.status !== undefined) (props as any).status = dto.status;

    await this.auctionRepository.save(auction);

    // Listing alanlarını sadece sağlanan değerlerle güncelle
    if (dto.title !== undefined || dto.description !== undefined) {
      const listing = await this.listingRepository.findById(props.listingId);
      if (listing) {
        await this.listingRepository.updateListing(props.listingId, {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
        } as any);
      }
    }

    await this.auditLog.log({
      actorId: user.id,
      action: 'AUCTION_UPDATED',
      resourceType: 'Auction',
      resourceId: id,
      newValue: dto as Record<string, unknown>,
    });

    const { populateAuctions } = await import('./application/helpers/auction-population.helper');
    const populated = await populateAuctions([auction]);
    return { success: true, data: populated[0] };
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
    // Admin katılım listesi için repository metodu eklenmeli
    // Şimdilik basit bir placeholder döndür
    return { success: true, data: [] };
  }

  @ApiOperation({ summary: 'Katılım talebini onayla' })
  @Post('participations/:id/approve')
  async approveParticipation(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const participation = await this.auctionRepository.findParticipationById(id);
    if (!participation) throw new BadRequestException('Katılım bulunamadı');

    if (!['DEPOSIT_HELD', 'PENDING'].includes(participation.status)) {
      throw new BadRequestException('Bu katılım onaylanamaz: geçersiz durum');
    }

    await this.auctionRepository.updateParticipationStatus(id, 'APPROVED');

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
    const participation = await this.auctionRepository.findParticipationById(id);
    if (!participation) throw new BadRequestException('Katılım bulunamadı');

    await this.auctionRepository.updateParticipationStatus(id, 'REJECTED');

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
    await this.auctionRepository.deleteAuction(id);
    await this.auditLog.log({
      actorId: admin.id,
      action: 'AUCTION_DELETED',
      resourceType: 'Auction',
      resourceId: id,
    });
    return { success: true };
  }
}