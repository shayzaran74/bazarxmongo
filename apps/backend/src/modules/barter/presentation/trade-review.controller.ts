// apps/backend/src/modules/barter/presentation/trade-review.controller.ts

import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, Logger, BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { randomUUID } from 'crypto';
import { ITradeReview } from '@barterborsa/shared-persistence/schemas/backend/tradeReview.schema';
import { ISwapSession } from '@barterborsa/shared-persistence/schemas/backend/swapSession.schema';
import { IVendorRepository } from '../../vendor/domain/repositories/vendor.repository.interface';
import { Inject } from '@nestjs/common';

interface AuthenticatedUser { id: string; role: string; }

interface SubmitReviewDto {
  tradeOfferId: string;
  toUserId: string;
  rating: number;
  comment?: string;
}

@ApiTags('TradeReviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trade-reviews')
export class TradeReviewController {
  private readonly logger = new Logger(TradeReviewController.name);

  constructor(
    @InjectModel('TradeReview') private readonly reviewModel: Model<ITradeReview>,
    @InjectModel('SwapSession') private readonly swapSessionModel: Model<ISwapSession>,
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
  ) {}

  // ─── Değerlendirme gönder ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Takas değerlendirmesi gönder' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post()
  async submitReview(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitReviewDto,
  ): Promise<{ success: boolean; data?: ITradeReview; message?: string }> {
    if (!dto.tradeOfferId || !dto.toUserId) {
      throw new BadRequestException('tradeOfferId ve toUserId zorunludur');
    }
    if (!dto.rating || dto.rating < 1 || dto.rating > 5) {
      throw new BadRequestException('rating 1-5 arasında olmalıdır');
    }

    // Aynı işlem için tekrar değerlendirme yapılmasını engelle
    const existing = await this.reviewModel.findOne({
      tradeOfferId: dto.tradeOfferId,
      fromUserId: user.id,
    }).lean().exec();

    if (existing) {
      return { success: false, message: 'Bu işlem için zaten değerlendirme yapıldı' };
    }

    const id = randomUUID();
    const review = await this.reviewModel.create({
      _id: id,
      id,
      tradeOfferId: dto.tradeOfferId,
      fromUserId: user.id,
      toUserId: dto.toUserId,
      rating: dto.rating,
      comment: dto.comment ?? '',
      createdAt: new Date(),
    });

    this.logger.log('Takas değerlendirmesi oluşturuldu', { id, tradeOfferId: dto.tradeOfferId });
    return { success: true, data: review.toObject() as ITradeReview };
  }

  // ─── Değerlendirme listesi ───────────────────────────────────────────────

  @ApiOperation({ summary: 'Bir kullanıcıya ait değerlendirmeleri listele' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get()
  async listReviews(
    @Query('userId') userId?: string,
    @Query('minRating') minRating?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<{ success: boolean; data: { reviews: ITradeReview[]; pagination: { totalPages: number; total: number } } }> {
    const filter: Record<string, unknown> = {};
    if (userId) filter.toUserId = userId;
    if (minRating) filter.rating = { $gte: parseInt(minRating, 10) };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip     = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      this.reviewModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean().exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      success: true,
      data: {
        reviews: reviews as ITradeReview[],
        pagination: { totalPages: Math.ceil(total / limitNum), total },
      },
    };
  }

  // ─── Karşılıklı değerlendirme durumu ────────────────────────────────────

  @ApiOperation({ summary: 'İki tarafın birbirini değerlendirip değerlendirmediğini kontrol et' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('mutual-status/:tradeOfferId')
  async getMutualStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('tradeOfferId') tradeOfferId: string,
  ): Promise<{ success: boolean; data: { isMutual: boolean; hasUserReviewed: boolean; hasPartnerReviewed: boolean } }> {
    const reviews = await this.reviewModel.find({ tradeOfferId }).lean().exec();

    const hasUserReviewed    = reviews.some(r => r.fromUserId === user.id);
    const hasPartnerReviewed = reviews.some(r => r.fromUserId !== user.id);
    const isMutual           = hasUserReviewed && hasPartnerReviewed;

    return { success: true, data: { isMutual, hasUserReviewed, hasPartnerReviewed } };
  }

  // ─── Kullanıcı istatistikleri ────────────────────────────────────────────

  @ApiOperation({ summary: 'Kullanıcının aldığı değerlendirme istatistikleri' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('stats/:userId')
  async getUserStats(
    @Param('userId') userId: string,
  ): Promise<{ success: boolean; data: { totalReviews: number; averageRating: number; ratingDistribution: Record<number, number> } }> {
    const reviews = await this.reviewModel.find({ toUserId: userId }).lean().exec();

    const totalReviews = reviews.length;
    const averageRating = totalReviews
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
      : 0;

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) ratingDistribution[r.rating]++;
    }

    return { success: true, data: { totalReviews, averageRating, ratingDistribution } };
  }

  // ─── Bekleyen değerlendirmeler ───────────────────────────────────────────

  @ApiOperation({ summary: 'Kullanıcının değerlendirme bekleyen tamamlanmış takasları' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('pending')
  async getPendingReviews(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: unknown[] }> {
    // Tamamlanmış oturumları bul (kullanıcının dahil olduğu)
    const completedSessions = await this.swapSessionModel
      .find({
        status: 'COMPLETED',
        $or: [{ initiatorId: user.id }, { receiverId: user.id }],
      })
      .lean()
      .exec();

    if (!completedSessions.length) return { success: true, data: [] };

    // Kullanıcının zaten yaptığı değerlendirmeleri bul
    const reviewedOfferIds = (
      await this.reviewModel.find({ fromUserId: user.id }).select('tradeOfferId').lean().exec()
    ).map(r => r.tradeOfferId);

    const pending = completedSessions
      .filter(s => !reviewedOfferIds.includes(s.tradeOfferId))
      .map(s => ({
        id: s.id,
        tradeOfferId: s.tradeOfferId,
        fromCompanyId: s.initiatorId,
        toCompanyId: s.receiverId,
        completedAt: s.updatedAt,
      }));

    return { success: true, data: pending };
  }
}
