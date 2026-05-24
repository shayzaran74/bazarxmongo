// apps/backend/src/modules/barter/presentation/barter-admin.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { IDemandMatch } from '@barterborsa/shared-persistence/schemas/backend/demandMatch.schema';
import { IVendorB2BData } from '@barterborsa/shared-persistence/schemas/backend/vendorB2BData.schema';
import { TradeOffer } from '@barterborsa/shared-persistence/schemas/backend/tradeOffer.schema';
import { TradeOfferItem } from '@barterborsa/shared-persistence/schemas/backend/tradeOfferItem.schema';
import { Company } from '@barterborsa/shared-persistence/schemas/backend/company.schema';
import { Listing } from '@barterborsa/shared-persistence/schemas/backend/listing.schema';
import { SwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { TrustScore } from '@barterborsa/shared-persistence/schemas/backend/trustScore.schema';
import { ITradeOfferRepository } from '../domain/repositories/trade-offer.repository.interface';
import { IWantedItemRepository } from '../domain/repositories/wanted-item.repository.interface';
import { ICategoryRepository } from '../domain/repositories/category.repository.interface';
import { ISwapSessionRepository } from '../domain/repositories/swap-session.repository.interface';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';
import { SwapSchedulerService } from '../application/services/swap-session.scheduler';
import { SwapSessionStatus } from '../domain/enums/swap-session-status.enum';
import { TrustScoreRecalculationService } from '../application/services/trust-score-recalculation.service';
import { ITrustScoreRepository } from '../../vendor/domain/repositories/trust-score.repository.interface';
import { FREEZE_VIOLATION_THRESHOLD } from '../domain/trust-level.constants';

interface SurplusCategoryDto {
  name: string;
  slug?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

@ApiTags('Barter Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/barter')
export class BarterAdminController {
  private readonly logger = new Logger(BarterAdminController.name);

  constructor(
    @Inject('ITradeOfferRepository') private readonly tradeOfferRepo: ITradeOfferRepository,
    @Inject('IWantedItemRepository') private readonly wantedItemRepo: IWantedItemRepository,
    @Inject('ICategoryRepository') private readonly categoryRepo: ICategoryRepository,
    @Inject('ISwapSessionRepository') private readonly sessionRepo: ISwapSessionRepository,
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    private readonly financialGateway:    FinancialGatewayService,
    private readonly swapScheduler:       SwapSchedulerService,
    private readonly trustScoreSvc:       TrustScoreRecalculationService,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepo: ITrustScoreRepository,
    @InjectModel('DemandMatch') private readonly demandMatchModel: Model<IDemandMatch>,
    @InjectModel('VendorB2BData') private readonly vendorB2BDataModel: Model<IVendorB2BData>,
  ) {}

  @ApiOperation({ summary: 'List all trade offers for admin' })
  @Get('offers')
  async getAllOffers(@Query('status') status?: string) {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const docs = await TradeOffer.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    
    const populated = await Promise.all(docs.map(async (doc: any) => {
      const fromCompany = await Company.findOne({ id: doc.fromCompanyId }).lean();
      const toCompany = await Company.findOne({ id: doc.toCompanyId }).lean();
      
      const offeredItems = await TradeOfferItem.find({ $or: [{ offered_offer_id: doc.id }, { offered_offer_id: doc.id }] }).lean() || [];
      const requestedItems = await TradeOfferItem.find({ $or: [{ requested_offer_id: doc.id }, { requested_offer_id: doc.id }] }).lean() || [];
      
      for (const item of offeredItems) {
        if ((item as any).listingId) (item as any).listing = await Listing.findOne({ id: (item as any).listingId }).lean();
      }
      for (const item of requestedItems) {
        if ((item as any).listingId) (item as any).listing = await Listing.findOne({ id: (item as any).listingId }).lean();
      }

      return {
        ...doc,
        fromCompany: fromCompany || { name: 'Bilinmeyen Şirket' },
        toCompany: toCompany || { name: 'Bilinmeyen Şirket' },
        offeredItems,
        requestedItems,
      };
    }));

    return { success: true, data: populated };
  }

  @ApiOperation({ summary: 'List pending trade offers' })
  @Get('offers/pending')
  async getPendingOffers() {
    const docs = await TradeOffer.find({ status: 'PENDING' }).sort({ createdAt: -1 }).limit(100).lean();

    const populated = await Promise.all(docs.map(async (doc: any) => {
      const fromCompany = await Company.findOne({ id: doc.fromCompanyId }).lean();
      const toCompany = await Company.findOne({ id: doc.toCompanyId }).lean();

      const offeredItems = await TradeOfferItem.find({ $or: [{ offered_offer_id: doc.id }, { offered_offer_id: doc.id }] }).lean() || [];
      const requestedItems = await TradeOfferItem.find({ $or: [{ requested_offer_id: doc.id }, { requested_offer_id: doc.id }] }).lean() || [];

      for (const item of offeredItems) {
        if ((item as any).listingId) (item as any).listing = await Listing.findOne({ id: (item as any).listingId }).lean();
      }
      for (const item of requestedItems) {
        if ((item as any).listingId) (item as any).listing = await Listing.findOne({ id: (item as any).listingId }).lean();
      }

      return {
        ...doc,
        fromCompany: fromCompany || { name: 'Bilinmeyen Şirket' },
        toCompany: toCompany || { name: 'Bilinmeyen Şirket' },
        offeredItems,
        requestedItems,
      };
    }));

    return { success: true, data: populated };
  }

  @ApiOperation({ summary: 'Approve/Accept trade offer (Admin)' })
  @Patch('offers/:id/approve')
  async approveOffer(@Param('id') id: string) {
    await this.tradeOfferRepo.updateStatus(id, 'ACCEPTED');
    return { success: true };
  }

  @ApiOperation({ summary: 'Reject trade offer (Admin)' })
  @Patch('offers/:id/reject')
  async rejectOffer(@Param('id') id: string) {
    await this.tradeOfferRepo.updateStatus(id, 'REJECTED');
    return { success: true };
  }

  @ApiOperation({ summary: 'List wanted items' })
  @Get('wanted-items')
  async getWantedItems(@Query('status') status?: string) {
    const items = await this.wantedItemRepo.findAll();
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'List surplus categories' })
  @Get('surplus-categories')
  async getSurplusCategories(@Query('includeChildren') _includeChildren?: boolean) {
    const categories = await this.categoryRepo.findRootCategories();
    return { success: true, categories };
  }

  @Post('surplus-categories')
  async createSurplusCategory(@Body() dto: SurplusCategoryDto) {
    const res = await this.categoryRepo.create({
      name: dto.name,
      slug: dto.slug ?? dto.name.toLowerCase().replace(/ /g, '-'),
      icon: dto.icon,
      parentId: dto.parentId,
      order: dto.order || 0,
      isActive: dto.isActive ?? true,
    });
    return { success: true, data: res };
  }

  @Patch('surplus-categories/:id')
  async updateSurplusCategory(@Param('id') id: string, @Body() dto: Partial<SurplusCategoryDto>) {
    const res = await this.categoryRepo.update(id, {
      name: dto.name,
      slug: dto.slug,
      icon: dto.icon,
      parentId: dto.parentId,
      order: dto.order,
      isActive: dto.isActive,
    });
    return { success: true, data: res };
  }

  @Delete('surplus-categories/:id')
  async deleteSurplusCategory(@Param('id') id: string) {
    await this.categoryRepo.delete(id);
    return { success: true };
  }

  @ApiOperation({ summary: 'List barter users with their wallet stats' })
  @Get('users')
  async getBarterUsers() {
    // barterEnabled olan vendorları bul
    const vendors = await this.vendorRepo.findByBarterEnabled(true);

    const data = await Promise.all(
      vendors.map(async (v) => {
        let wallet = null;
        try {
          const walletRes = await this.financialGateway.getWallet(v.userId);
          if (walletRes) {
            wallet = walletRes.success ? walletRes.data : walletRes;
          }
        } catch (e: unknown) {
          this.logger.warn('gRPC cüzdan sorgusu başarısız', { userId: v.userId, error: e instanceof Error ? e.message : String(e) });
        }

        return {
          id: v.id,
          userId: v.userId,
          name: (v as { company?: { name?: string }; user?: { email?: string } }).company?.name || (v as { user?: { email?: string } }).user?.email || '?',
          email: (v as { user?: { email?: string } }).user?.email,
          wallet: wallet || { barterBalance: 0, barterCreditLimit: 0 },
        };
      }),
    );

    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update user barter settings (Admin)' })
  @Patch('user/:id')
  async updateUserBarterSettings(
    @Param('id') userId: string,
    @Body() body: {
      b2bTier?: string;
      barterLimitOverride?: number;
      b2bCommRate?: number;
      subscriptionStatus?: string;
    },
  ) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) return { success: false, message: 'Vendor bulunamadı' };

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.b2bTier !== undefined)            update.b2bTier = body.b2bTier;
    if (body.subscriptionStatus !== undefined) update.subscriptionStatus = body.subscriptionStatus;
    if (body.barterLimitOverride !== undefined)
      update.barterLimitOverride = Types.Decimal128.fromString(String(body.barterLimitOverride));
    if (body.b2bCommRate !== undefined)
      update.b2bCommRate = Types.Decimal128.fromString(String(body.b2bCommRate));

    await this.vendorB2BDataModel.updateOne(
      { vendorId: vendor.id },
      { $set: update },
    ).exec();

    return { success: true, message: 'Barter ayarları güncellendi' };
  }

  @ApiOperation({ summary: 'List swap sessions (chains)' })
  @Get('chains')
  async getBarterChains(@Query('status') status?: string) {
    const sessions = await this.sessionRepo.findByCompanyWithFilters('', 0, 100);
    return { success: true, data: sessions.items };
  }

  @ApiOperation({ summary: 'List demand matches' })
  @Get('demand-matches')
  async getDemandMatches(
    @Query('status') status?: string,
    @Query('page')   page  = '1',
    @Query('limit')  limit = '20',
  ) {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      this.demandMatchModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean()
        .exec(),
      this.demandMatchModel.countDocuments(filter).exec(),
    ]);

    return { success: true, data: items, total, page: parseInt(page, 10) };
  }

  // ── Timeout İzleme & Manuel Tetikleme ────────────────────────────────────

  @ApiOperation({ summary: 'Timeout riski taşıyan swap session\'ları listele' })
  @Get('timeout-monitor')
  async getTimeoutMonitor(@Query('warningDays') warningDays = '3'): Promise<{
    success: boolean;
    data: {
      stats: Record<string, number>;
      alreadyTimedOut: number;
      soonExpiring: { withinDays: number; count: number; sessions: Array<Record<string, unknown>> };
      nextCronRun: string;
    };
  }> {
    const days     = Math.max(1, parseInt(warningDays, 10));
    const now      = new Date();
    const warnDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const [alreadyTimedOut, soonExpiring, byStatus] = await Promise.all([
      SwapSession.countDocuments({ status: SwapSessionStatus.TIMEOUT }),
      SwapSession.find(
        {
          status: { $in: [SwapSessionStatus.PENDING_COLLATERAL, SwapSessionStatus.ACTIVE, SwapSessionStatus.SHIPPING] },
          timeoutAt: { $lte: warnDate },
        },
        { id: 1, status: 1, timeoutAt: 1, initiatorId: 1, receiverId: 1 },
      ).sort({ timeoutAt: 1 }).limit(50).lean(),
      SwapSession.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap: Record<string, number> = {};
    for (const row of byStatus) statusMap[row._id] = row.count;

    return {
      success: true,
      data: {
        stats:         statusMap,
        alreadyTimedOut,
        soonExpiring: {
          withinDays: days,
          count:      soonExpiring.length,
          sessions:   soonExpiring,
        },
        nextCronRun: '02:05 Europe/Istanbul',
      },
    };
  }

  @ApiOperation({ summary: 'Timeout cron\'unu manuel tetikle' })
  @Post('run-timeout-check')
  async runTimeoutCheck() {
    await this.swapScheduler.runManually();
    return { success: true, message: 'Timeout taraması tamamlandı — loglara bakın' };
  }

  // ── TrustScore Yönetimi ───────────────────────────────────────────────────

  @ApiOperation({ summary: 'Tüm vendor TrustScore listesi' })
  @Get('trust-scores')
  async listTrustScores(
    @Query('level')    level?:    string,
    @Query('isFrozen') isFrozen?: string,
    @Query('page')     page  = '1',
    @Query('limit')    limit = '20',
  ) {
    const filter: Record<string, unknown> = {};
    if (level)    filter.level    = level;
    if (isFrozen) filter.isFrozen = isFrozen === 'true';

    const skip  = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [items, total] = await Promise.all([
      TrustScore.find(filter).sort({ score: 1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
      TrustScore.countDocuments(filter),
    ]);

    return { success: true, data: items, total };
  }

  @ApiOperation({ summary: 'Vendor TrustScore manuel override (puan veya dondurma)' })
  @Patch('trust-scores/:vendorId')
  async overrideTrustScore(
    @Param('vendorId') vendorId: string,
    @Body() dto: { isFrozen?: boolean; violationCount?: number; resetInactiveDays?: boolean },
  ) {
    const update: Record<string, unknown> = { lastCalculatedAt: new Date() };
    if (dto.isFrozen       !== undefined) update.isFrozen       = dto.isFrozen;
    if (dto.violationCount !== undefined) update.violationCount  = dto.violationCount;
    if (dto.resetInactiveDays) update.inactiveDays = 0;
    if (dto.isFrozen === false) update.level = undefined; // recalculate on next cron

    await this.trustScoreRepo.updateScore(vendorId, update);
    return { success: true, message: `${vendorId} TrustScore güncellendi` };
  }

  @ApiOperation({ summary: 'TrustScore tam yeniden hesaplamayı manuel tetikle' })
  @Post('run-trust-score-recalc')
  async runTrustScoreRecalc() {
    const result = await this.trustScoreSvc.runFullRecalculation();
    return { success: true, data: result };
  }

  @ApiOperation({ summary: 'Dondurma adaylarını listele (violationCount >= eşik)' })
  @Get('trust-scores/freeze-candidates')
  async getFreezeCandidates() {
    const candidates = await this.trustScoreRepo.findFreezeCandidates(FREEZE_VIOLATION_THRESHOLD);
    return { success: true, data: candidates, threshold: FREEZE_VIOLATION_THRESHOLD };
  }

  @ApiOperation({ summary: 'Admin onayı bekleyen swap sessionları listele' })
  @Get('swap/pending-release')
  async getPendingReleaseSessions(): Promise<{ success: boolean; data: Record<string, unknown>[] }> {
    const sessions = await SwapSession.find({ collateralStatus: 'PENDING_RELEASE' })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return { success: true, data: sessions as unknown as Record<string, unknown>[] };
  }

  @ApiOperation({ summary: 'Admin onayıyla teminatları serbest bırak' })
  @Post('swap/:id/release-collateral')
  async releaseCollateral(@Param('id') sessionId: string) {
    const session = await SwapSession.findOne({ id: sessionId }).lean().exec();
    if (!session) return { success: false, message: 'Swap session bulunamadı.' };

    const s = session as Record<string, unknown>;
    if (s.collateralStatus !== 'PENDING_RELEASE' && s.collateralStatus !== 'HELD') {
      return { success: false, message: `Teminat durumu uygun değil: ${s.collateralStatus}` };
    }

    const idempotencyBase = `admin-release-${sessionId}`;

    if (s.fromCollateralHoldId) {
      try {
        await this.financialGateway.releaseFunds(s.fromCollateralHoldId as string, `${idempotencyBase}-from`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('From collateral iadesi başarısız', { holdId: s.fromCollateralHoldId, error: msg });
      }
    }

    if (s.toCollateralHoldId) {
      try {
        await this.financialGateway.releaseFunds(s.toCollateralHoldId as string, `${idempotencyBase}-to`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('To collateral iadesi başarısız', { holdId: s.toCollateralHoldId, error: msg });
      }
    }

    await SwapSession.updateOne(
      { id: sessionId },
      { $set: { collateralStatus: 'RELEASED', updatedAt: new Date() } },
    ).exec();

    this.logger.log('Admin teminat serbest bırakma onayı', { sessionId });

    return { success: true, message: 'Teminatlar komisyon kesilerek serbest bırakıldı.' };
  }

}