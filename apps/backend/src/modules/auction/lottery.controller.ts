// apps/backend/src/modules/auction/lottery.controller.ts

import * as crypto from 'crypto';
import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Inject } from '@nestjs/common';
import { DomainException } from '@barterborsa/shared-core';
import { FinancialGatewayService } from '../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../audit/application/audit-log.service';
import { LotteryParticipateDto } from './lottery-participate.dto';
import { ILotteryRepository } from './domain/repositories/lottery.repository.interface';
import { ILotteryTicket } from './domain/repositories/lottery.repository.interface';
import { IListingRepository } from '../catalog/domain/repositories/listing.repository.interface';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { ProductMedia } from '@barterborsa/shared-persistence/schemas/backend/productMedia.schema';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
  firstName?: string;
  lastName?: string;
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
    @Inject('ILotteryRepository') private readonly lotteryRepository: ILotteryRepository,
    @Inject('IListingRepository') private readonly listingRepository: IListingRepository,
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

    const filter: Record<string, unknown> = { status: 'ACTIVE' };
    if (query.categoryId) filter['listing.categoryId'] = query.categoryId;

    const result = await this.lotteryRepository.findWithFilters(filter, skip, limit);
    const populatedItems = await this.populateProducts(result.items);
    return { success: true, data: populatedItems, meta: { page, limit, total: result.total } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my/tickets')
  @ApiOperation({ summary: 'Kullanıcının biletlerini listele' })
  async getMyTickets(@CurrentUser() user: AuthenticatedUser) {
    const tickets = await this.lotteryRepository.findTicketsByUserId(user.id);
    return { success: true, data: tickets };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  @ApiOperation({ summary: 'Kullanıcının katıldığı çekilişleri listele' })
  async getMyLotteries(@CurrentUser() user: AuthenticatedUser) {
    const tickets = await this.lotteryRepository.findTicketsByUserId(user.id);
    const lotteryIds = Array.from(new Set(tickets.map(t => t.lotteryId)));
    if (lotteryIds.length === 0) {
      return { success: true, data: [] };
    }
    const lotteries = await Promise.all(
      lotteryIds.map(id => this.lotteryRepository.findById(id))
    );
    const activeLotteries = lotteries.filter(Boolean);
    const populated = await this.populateProducts(activeLotteries);
    return { success: true, data: populated };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Çekiliş detayını getir' })
  async getLottery(@Param('id') id: string) {
    const item = await this.lotteryRepository.findById(id);
    if (!item) return { success: false, message: 'Çekiliş bulunamadı' };
    const populated = await this.populateProducts([item]);
    return { success: true, data: populated[0] };
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
    const lottery = await this.lotteryRepository.findById(id);
    if (!lottery) return { success: false, message: 'Çekiliş bulunamadı' };
    if (lottery.getProps().status !== 'ACTIVE') return { success: false, message: 'Çekiliş aktif değil' };
    if (new Date() > lottery.getProps().endTime) return { success: false, message: 'Çekiliş süresi dolmuş' };

    const quantity = dto.quantity;
    const props = lottery.getProps();

    // Kullanıcının mevcut bilet sayısı kontrolü
    const userTicketCount = await this.lotteryRepository.countTickets(id, user.id);
    if (userTicketCount + quantity > props.maxTicketsPerUser) {
      return {
        success: false,
        message: `Kişi başı maksimum ${props.maxTicketsPerUser} bilet alınabilir`,
      };
    }

    // Toplam bilet kotası kontrolü
    const totalSold = await this.lotteryRepository.countTickets(id);
    if (totalSold + quantity > props.totalTickets) {
      return { success: false, message: 'Yeterli bilet kalmadı' };
    }

    // Her bilet için çakışmasız numaralar üret
    const ticketNumbers: string[][] = [];
    for (let i = 0; i < quantity; i++) {
      const numbers = await this.generateUniqueNumbers(
        id,
        props.ticketDigits,
        props.numbersPerTicket,
        props.totalTickets,
      );
      ticketNumbers.push(numbers);
    }

    // Bilet ücreti kadar cüzdandan teminat al (ownerId = satıcı/çekiliş sahibi)
    const totalAmount = Number(props.ticketPrice) * quantity;
    const idempotencyKey = `lottery-ticket-${id}-${user.id}-${Date.now()}`;
    const holdResult = await this.financialGateway.holdFunds(
      user.id,
      totalAmount.toString(),
      'LOTTERY_TICKET',
      id,
      'LOTTERY',
      idempotencyKey,
      props.ownerId,
    );
    const holdId = holdResult.holdId as string;

    // Biletleri atomik işlem içinde kaydet
    const createdTickets: ILotteryTicket[] = [];
    for (const numbers of ticketNumbers) {
      const ticket = await this.lotteryRepository.createTicket({ lotteryId: id, userId: user.id, numbers });
      createdTickets.push(ticket);
    }

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
      const collision = await this.lotteryRepository.findTicketWithNumbers(lotteryId, candidates);

      if (!collision) return candidates;
    }

    throw new DomainException(
      'Benzersiz bilet numarası üretilemedi; çekiliş biletleri dolmuş olabilir',
    );
  }

  private async populateProducts(lotteries: any[]): Promise<any[]> {
    if (!lotteries || lotteries.length === 0) return [];

    const listingIds = lotteries.map(l => {
      if (l.getProps) {
        return l.getProps().listingId;
      }
      return l.listingId;
    }).filter(Boolean);

    if (listingIds.length === 0) {
      return lotteries.map(l => {
        const raw = l.toJSON ? l.toJSON() : (l.getProps ? { id: l.id, ...l.getProps() } : l);
        return { ...raw, Product: null };
      });
    }

    const listings = await this.listingRepository.findByIds(listingIds);
    const catalogProductIds = listings.map(lst => {
      if (lst.getProps) {
        return lst.getProps().catalogProductId;
      }
      return (lst as any).catalogProductId;
    }).filter(Boolean);

    const products = catalogProductIds.length > 0
      ? await CatalogProduct.find({ id: { $in: catalogProductIds } }).lean()
      : [];

    const media = catalogProductIds.length > 0
      ? await ProductMedia.find({ productId: { $in: catalogProductIds } }).sort({ sortOrder: 1 }).lean()
      : [];

    return lotteries.map(l => {
      const raw = l.toJSON ? l.toJSON() : (l.getProps ? { id: l.id, ...l.getProps() } : l);
      
      // Convert Decimal128 objects to numbers/strings
      if (raw.ticketPrice && raw.ticketPrice.$numberDecimal !== undefined) {
        raw.ticketPrice = raw.ticketPrice.$numberDecimal;
      }
      if (raw.prizeValue && raw.prizeValue.$numberDecimal !== undefined) {
        raw.prizeValue = raw.prizeValue.$numberDecimal;
      }

      const listingId = l.getProps ? l.getProps().listingId : l.listingId;

      const listing = listings.find(lst => lst.id === listingId);
      if (!listing) {
        return { ...raw, Product: null };
      }

      const catalogProductId = listing.getProps ? listing.getProps().catalogProductId : (listing as any).catalogProductId;
      const product = products.find(p => p.id === catalogProductId);
      if (!product) {
        return { ...raw, Product: null };
      }

      const prodMedia = media.filter(m => m.productId === product.id);

      return {
        ...raw,
        Product: {
          id: product.id,
          name: product.name,
          image: prodMedia[0]?.url || 'https://placehold.co/600x600?text=PRODUCT',
          description: product.description,
        }
      };
    });
  }
}