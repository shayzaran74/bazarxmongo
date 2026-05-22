// apps/backend/src/modules/auction/auction.controller.ts

import { Controller, Get, Post, Body, Query, Param, UseGuards, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public, JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PlaceBidCommand } from './application/commands/place-bid.command';
import { PlaceBidDto } from './place-bid.dto';
import { AuctionStatus } from './domain/enums/auction-status.enum';
import { FinancialGatewayService } from '../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../audit/application/audit-log.service';
import { IAuctionRepository } from './domain/repositories/auction.repository.interface';
import { IAuctionBidRepository } from './domain/repositories/auction-bid.repository.interface';
import { IAuctionParticipationRepository } from './domain/repositories/auction-participation.repository.interface';

interface AuctionListQuery {
  page?: string;
  limit?: string;
  status?: string;
}

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
}

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('IAuctionRepository') private readonly auctionRepository: IAuctionRepository,
    @Inject('IAuctionBidRepository') private readonly bidRepository: IAuctionBidRepository,
    @Inject('IAuctionParticipationRepository') private readonly participationRepository: IAuctionParticipationRepository,
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

    const requestedStatus = (query.status ?? 'ACTIVE').toUpperCase();
    const validStatus = Object.values(AuctionStatus).includes(requestedStatus as AuctionStatus)
      ? (requestedStatus as AuctionStatus)
      : AuctionStatus.ACTIVE;

    const filter: Record<string, unknown> = { status: validStatus };
    if (validStatus === AuctionStatus.ACTIVE) {
      const now = new Date();
      filter.startTime = { $lte: now };
      filter.endTime = { $gte: now };
    }

    const result = await this.auctionRepository.findWithFilters(filter, skip, limit);
    const { populateAuctions } = await import('./application/helpers/auction-population.helper');
    const populated = await populateAuctions(result.items);
    
    return {
      success: true,
      data: populated,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  @Public()
  @ApiOperation({ summary: 'Artırma detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async getAuction(@Param('id') id: string) {
    const auction = await this.auctionRepository.findById(id);
    if (!auction) return { success: false, error: 'Bulunamadı' };

    const { populateAuctions } = await import('./application/helpers/auction-population.helper');
    const populated = await populateAuctions([auction]);
    const bids = await this.bidRepository.findByAuctionId(id, 20);
    return { success: true, data: { ...populated[0], bids } };
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
    const bids = await this.bidRepository.findByAuctionId(id, 50);
    return { success: true, data: bids };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/participation')
  async getParticipation(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const p = await this.participationRepository.findByAuctionAndUser(id, user.id);
    return { success: true, data: p };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/participate')
  async participate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const auction = await this.auctionRepository.findById(id);
    if (!auction) return { success: false, message: 'Açık artırma bulunamadı' };
    if (auction.getProps().status !== 'ACTIVE') {
      return { success: false, message: 'Bu açık artırma şu an katılıma açık değil' };
    }

    // Mevcut katılım varsa ve teminat alınmışsa idempotent dön
    const existing = await this.participationRepository.findByAuctionAndUser(id, user.id);
    if (existing && existing.status !== 'PENDING') {
      return { success: true, data: existing };
    }

    const props = auction.getProps();
    const hasDeposit = props.participationDeposit !== null && Number(props.participationDeposit) > 0;

    let holdId: string | null = null;

    if (hasDeposit) {
      // Financial Service'ten gerçek teminat blokajı al
      const idempotencyKey = `auction-participate-${id}-${user.id}`;
      const referenceId = `auction-participate-${id}-${user.id}`;
      try {
        const holdResult = await this.financialGateway.holdFunds(
          user.id,
          props.participationDeposit!.toString(),
          'AUCTION_BID',
          referenceId,
          'AUCTION_PARTICIPATION',
          idempotencyKey,
        );
        holdId = holdResult.holdId as string;
      } catch (error: any) {
        return { success: false, message: error?.message || 'Bakiye yetersiz veya teminat alınamadı.' };
      }
    }

    // Teminat alındıysa DEPOSIT_HELD, yoksa doğrudan ACTIVE
    const status = hasDeposit ? 'DEPOSIT_HELD' : 'ACTIVE';

    const participation = await this.participationRepository.create({
      auctionId: id,
      userId: user.id,
      status,
      holdId: holdId ?? undefined,
      blockedAmount: Number(props.participationDeposit ?? 0),
    });

    await this.auditLog.log({
      actorId: user.id,
      action: 'AUCTION_PARTICIPATE',
      resourceType: 'AuctionParticipation',
      resourceId: participation.id,
      newValue: {
        auctionId: id,
        holdId,
        blockedAmount: String(props.participationDeposit ?? 0),
        status,
      },
    });

    return { success: true, data: participation };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/claim')
  async claim(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const auction = await this.auctionRepository.findById(id);
    if (!auction || auction.getProps().winnerId !== user.id) {
      return { success: false, message: 'Bu açık artırmayı kazanan siz değilsiniz.' };
    }
    // İleride burada ödeme/teslimat mantığı eklenebilir
    return { success: true, message: 'Kazanım onaylandı' };
  }
}