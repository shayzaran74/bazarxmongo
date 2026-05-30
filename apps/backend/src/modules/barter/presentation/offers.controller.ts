// apps/backend/src/modules/barter/presentation/offers.controller.ts

import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, NotFoundException, BadRequestException, ForbiddenException, Inject,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { AcceptTradeOfferCommand } from '../application/commands/accept-trade-offer.command';
import { CreateTradeOfferCommand } from '../application/commands/create-trade-offer.command';
import { CounterTradeOfferCommand } from '../application/commands/counter-trade-offer.command';
import { TradeOfferItem as TradeOfferItemModel } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICompany } from '@barterborsa/shared-persistence';
import { ISwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { IEcosystemMembershipRepository } from '../../vendor/domain/repositories/i-ecosystem-membership.repository';
import { ITradeOfferRepository } from '../domain/repositories/trade-offer.repository.interface';
import { ISurplusItemRepository } from '../domain/repositories/surplus-item.repository.interface';
import { BarterVendorGuardService, ApprovedVendorWithCompany } from '../application/services/barter-vendor-guard.service';

interface AuthenticatedUser { id: string; role: string; }

interface TradeOfferItemBody {
  quantity?: number;
  estimatedValue?: number;
  listingId?: string;
  surplusItemId?: string;
}

interface CreateOfferBody {
  toCompanyId?: string;
  surplusItemId?: string;
  offeredItemId?: string;
  offeredItems?: TradeOfferItemBody[];
  requestedItems?: TradeOfferItemBody[];
  cashAmount?: number;
  cashDirection?: string;
  currency?: string;
  expiresInDays?: number;
  message?: string;
  note?: string;
  type?: string;
  barterAmount?: number;
  receiverId?: string;
}

interface CounterOfferBody {
  surplusItemId?: string;
  offeredItemId?: string;
  offeredItems?: TradeOfferItemBody[];
  requestedItems?: TradeOfferItemBody[];
  cashAmount?: number;
  cashDirection?: string;
  currency?: string;
  expiresInDays?: number;
  message?: string;
  note?: string;
  barterAmount?: number;
}

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('offers')
export class OffersController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('IEcosystemMembershipRepository')
    private readonly membershipRepo: IEcosystemMembershipRepository,
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepository: ITradeOfferRepository,
    @Inject('ISurplusItemRepository') private readonly surplusItemRepository: ISurplusItemRepository,
    @InjectModel('Company') private readonly companyModel: Model<ICompany>,
    @InjectModel('SwapSession') private readonly swapSessionModel: Model<ISwapSession>,
    private readonly vendorGuard: BarterVendorGuardService,
  ) {}

  @ApiOperation({ summary: 'Gelen/giden teklifleri listele' })
  @Get('my')
  async getMyOffers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('companyId') _companyId?: string,
    @Query('type') _type?: string,
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const result = await this.tradeOfferRepository.findByCompanyWithFilters(
      vendor.company.id,
      0,
      100,
      ['PENDING', 'COUNTER_OFFERED', 'ACCEPTED', 'COMPLETED'],
    );

    const plainOffers = result.items.map(o => ({ ...o.getProps(), id: o.id }) as Record<string, unknown>);
    const enriched = await Promise.all(plainOffers.map(o => this.enrichOffer(o)));

    return { success: true, data: enriched };
  }

  @ApiOperation({ summary: 'Takas teklifi oluştur' })
  @ApiResponse({ status: 201 })
  @Post()
  async createOffer(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateOfferBody) {
    // İş mantığı CreateTradeOfferHandler'a taşındı (DDD — controller yalnızca delege eder)
    const data = await this.commandBus.execute(new CreateTradeOfferCommand(user.id, body));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Teklife karşı teklif ver' })
  @ApiParam({ name: 'id', description: 'Orijinal teklif ID' })
  @Post(':id/counter')
  async counterOffer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') originalOfferId: string,
    @Body() body: CounterOfferBody,
  ) {
    // İş mantığı CounterTradeOfferHandler'a taşındı (DDD — controller yalnızca delege eder)
    const data = await this.commandBus.execute(new CounterTradeOfferCommand(user.id, originalOfferId, body));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Teklif detayı' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const raw = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!raw) throw new NotFoundException('Teklif bulunamadı');

    if (raw.fromCompanyId !== vendor.company.id && raw.toCompanyId !== vendor.company.id) {
      throw new NotFoundException('Teklif bulunamadı');
    }

    const enriched = await this.enrichOffer(raw);
    return { success: true, data: enriched };
  }

  @ApiOperation({ summary: 'Teklifi kabul et' })
  @ApiParam({ name: 'id' })
  @Post(':id/accept')
  async acceptOffer(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { xpToApply?: number } = {},
  ) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer || offer.toCompanyId !== vendor.company.id || offer.status !== 'PENDING') {
      throw new NotFoundException('Teklif bulunamadı');
    }

    // Opt-in XP indirimi — kabul eden tarafın kendi komisyonuna uygulanır
    const xpToApply = Math.max(0, Number(body.xpToApply ?? 0));

    return this.commandBus.execute(new AcceptTradeOfferCommand(id, user.id, xpToApply));
  }

  @ApiOperation({ summary: 'Teklif durumunu güncelle (reddet vb.)' })
  @ApiParam({ name: 'id' })
  @Patch(':id/status')
  async updateOfferStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    const vendor = await this.getVendorWithCompany(user.id);
    const newStatus = (body.status ?? '').toUpperCase();

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer) throw new NotFoundException('Teklif bulunamadı');

    const isReceiver  = offer.toCompanyId === vendor.company.id;
    const isInitiator = offer.fromCompanyId === vendor.company.id;

    if (newStatus === 'REJECTED') {
      if (!isReceiver) throw new ForbiddenException('Sadece alıcı taraf teklifi reddedebilir.');
      if (!['PENDING', 'COUNTER_OFFERED'].includes(offer.status)) {
        throw new BadRequestException(`Mevcut durumda (${offer.status}) reddedilemez.`);
      }
      await this.tradeOfferRepository.updateStatus(id, 'REJECTED');
      return { success: true };
    }

    if (newStatus === 'CANCELLED') {
      if (!isInitiator) throw new ForbiddenException('Sadece teklif veren taraf iptal edebilir.');
      if (!['PENDING', 'COUNTER_OFFERED'].includes(offer.status)) {
        throw new BadRequestException(`Mevcut durumda (${offer.status}) iptal edilemez.`);
      }
      await this.tradeOfferRepository.updateStatus(id, 'CANCELLED');
      return { success: true };
    }

    throw new BadRequestException(`Desteklenmeyen durum: ${body.status}`);
  }

  @ApiOperation({ summary: 'Teklifi iptal et' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  async cancelOffer(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const vendor = await this.getVendorWithCompany(user.id);

    const offer = await this.tradeOfferRepository.findByIdWithRelations(id);
    if (!offer || offer.fromCompanyId !== vendor.company.id) {
      throw new NotFoundException('İptal edilebilir teklif bulunamadı');
    }

    if (!['PENDING', 'COUNTER_OFFERED', 'ACCEPTED'].includes(offer.status)) {
      throw new NotFoundException('İptal edilebilir teklif bulunamadı');
    }

    await this.tradeOfferRepository.updateStatus(id, 'CANCELLED');
    return { success: true };
  }

  // ─── Yardımcı ─────────────────────────────────────────────────────────────

  // Onaylı satıcı + onaylı firma doğrulaması — paylaşılan guard servisine delege edilir (DRY)
  private getVendorWithCompany(userId: string): Promise<ApprovedVendorWithCompany> {
    return this.vendorGuard.requireApprovedVendorWithCompany(userId);
  }

  private normalizeImages(images: unknown): string[] {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map(img => {
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return (img as { url: string }).url;
        }
        return String(img);
      }).filter((url): url is string => Boolean(url));
    }
    return [];
  }

  private async enrichOffer(raw: Record<string, unknown>): Promise<Record<string, unknown>> {
    const fromCompanyId = raw['fromCompanyId'] as string | undefined;
    const toCompanyId   = raw['toCompanyId']   as string | undefined;
    const requestedItemId = raw['requestedItemId'] as string | undefined;
    const offeredItemId   = raw['offeredItemId']   as string | undefined;
    const offerId = raw['id'] as string | undefined;

    const companyIds = [fromCompanyId, toCompanyId].filter(Boolean) as string[];
    const companies = companyIds.length
      ? await this.companyModel.find({ id: { $in: companyIds } }).lean()
      : [];
    const companyMap = new Map(companies.map(c => [c.id, { id: c.id, name: c.name ?? '' }]));

    // TradeOfferItem kayıtlarından çoklu ürünleri al
    const tradeOfferItems = offerId
      ? await TradeOfferItemModel.find({ $or: [{ offeredOfferId: offerId }, { requestedOfferId: offerId }] }).lean()
      : [];

    const offeredItemIds   = tradeOfferItems.filter(i => i.offeredOfferId   === offerId).map(i => i.surplusItemId).filter(Boolean) as string[];
    const requestedItemIds = tradeOfferItems.filter(i => i.requestedOfferId === offerId).map(i => i.surplusItemId).filter(Boolean) as string[];
    const allItemIds = [...new Set([...offeredItemIds, ...requestedItemIds, requestedItemId, offeredItemId].filter(Boolean))] as string[];

    const surplusItems = allItemIds.length
      ? await this.surplusItemRepository.findWithFilters({ id: { $in: allItemIds } }, 0, allItemIds.length)
      : { items: [] };
    const itemMap = new Map<string, { id: string; title: string; images: string[] }>(
      surplusItems.items.map(item => {
        const p = item.getProps();
        const normalizedImages = this.normalizeImages(p.images);
        return [item.id, { id: item.id, title: p.title, images: normalizedImages }] as [string, { id: string; title: string; images: string[] }];
      })
    );

    const status  = raw['status'] as string | undefined;
    let swapSession: { id: string } | null = null;
    if ((status === 'ACCEPTED' || status === 'COMPLETED') && offerId) {
      const session = await this.swapSessionModel.findOne({ tradeOfferId: offerId }, { id: 1 }).lean();
      if (session) swapSession = { id: session.id };
    }

    return {
      ...raw,
      fromCompany:    fromCompanyId ? (companyMap.get(fromCompanyId) ?? null) : null,
      toCompany:      toCompanyId   ? (companyMap.get(toCompanyId)   ?? null) : null,
      requestedItems: requestedItemIds.map(id => itemMap.get(id)).filter(Boolean) as unknown[],
      offeredItems:   offeredItemIds.map(id => itemMap.get(id)).filter(Boolean) as unknown[],
      swapSession,
    };
  }
}