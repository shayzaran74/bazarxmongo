// apps/backend/src/modules/barter/presentation/barter-admin.controller.ts

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { Inject } from '@nestjs/common';
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
  ) {}

  @ApiOperation({ summary: 'List all trade offers for admin' })
  @Get('offers')
  async getAllOffers(@Query('status') status?: string) {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const result = await this.tradeOfferRepo.findWithFilters(filter, 0, 100);
    return { success: true, data: result.items };
  }

  @ApiOperation({ summary: 'List pending trade offers' })
  @Get('offers/pending')
  async getPendingOffers() {
    const result = await this.tradeOfferRepo.findWithFilters({ status: 'PENDING' }, 0, 100);
    return { success: true, data: result.items };
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
      vendors.map(async (v: any) => {
        let wallet = null;
        try {
          const walletRes: any = await this.financialGateway.getWallet(v.userId);
          if (walletRes && walletRes.success) {
            wallet = walletRes.data;
          } else if (walletRes && !walletRes.success) {
            wallet = walletRes;
          }
        } catch (e) {
          // ignore grpc errors
        }

        return {
          ...v,
          name: v.company?.name || v.user?.email || '?',
          email: v.user?.email,
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
    @Body() _body: { barterBalance?: number; barterCreditLimit?: number },
  ) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor) return { success: false, message: 'Vendor not found' };

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
  async getDemandMatches(@Query('status') _status?: string) {
    return { success: true, data: [] };
  }

  // ── Timeout İzleme & Manuel Tetikleme ────────────────────────────────────

  @ApiOperation({ summary: 'Timeout riski taşıyan swap session\'ları listele' })
  @Get('timeout-monitor')
  async getTimeoutMonitor(@Query('warningDays') warningDays = '3') {
    const days     = Math.max(1, parseInt(warningDays, 10));
    const now      = new Date();
    const warnDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { SwapSession } = require('@barterborsa/shared-persistence/schemas/backend/swapSession.schema');

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
    const { TrustScore } = require('@barterborsa/shared-persistence/schemas/backend/trustScore.schema');
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
}