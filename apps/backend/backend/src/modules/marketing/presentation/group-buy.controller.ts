// apps/backend/src/modules/marketing/presentation/group-buy.controller.ts

import { Controller, Get, Post, Param, Body, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public, JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { randomUUID } from 'crypto';
import { GroupBuy, IGroupBuyTier } from '@barterborsa/shared-persistence/schemas/backend/groupBuy.schema';
import { CatalogProduct } from '@barterborsa/shared-persistence/schemas/backend/catalogProduct.schema';
import { FinancialGatewayService } from '../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../audit/application/audit-log.service';

interface AuthenticatedUser { id: string; role: string }

interface GroupBuyLeanDoc {
  id: string;
  productId?: string;
  title?: string;
  status?: string;
  createdAt?: Date;
  startDate?: Date;
  endDate?: Date;
  tiers?: IGroupBuyTier[];
  price?: { $numberDecimal?: string } | number;
  originalPrice?: { $numberDecimal?: string } | number;
  finalPrice?: { $numberDecimal?: string } | number;
  currentQuantity?: number;
  targetQuantity?: number;
  returnWindowDays?: number;
  finalizedAt?: Date;
}

interface CatalogProductLeanDoc {
  id: string;
  name?: string;
  slug?: string;
  media?: Array<{ url?: string }>;
}

// Decimal128 → number güvenli dönüşüm
const toPrice = (val: unknown): number => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && '$numberDecimal' in (val as object)) {
    return parseFloat((val as { $numberDecimal: string }).$numberDecimal) || 0;
  }
  return parseFloat(String(val)) || 0;
};

// Mevcut satış adedine göre aktif tier fiyatı bul
const getActiveTierPrice = (tiers: IGroupBuyTier[], currentQty: number, basePrice: number): number => {
  if (!tiers?.length) return basePrice;
  const sorted = [...tiers].sort((a, b) => b.minQuantity - a.minQuantity);
  const active = sorted.find(t => currentQty >= t.minQuantity);
  return active ? active.price : basePrice;
};

// Kampanya bilgi notunu oluştur
const buildCampaignNote = (campaign: GroupBuyLeanDoc) => {
  const originalPrice = toPrice(campaign.originalPrice || campaign.price);
  const currentPrice = toPrice(campaign.price);
  const returnDays = campaign.returnWindowDays ?? 15;
  const tiers = campaign.tiers ?? [];

  return {
    how_it_works: [
      `Ürünü ${originalPrice.toFixed(2)} ₺ üzerinden satın alırsınız, bu tutar cüzdanınızdan bloke edilir.`,
      `Kampanya süresi boyunca toplam sipariş sayısı arttıkça fiyat otomatik düşer.`,
      `Kampanya sona erdikten sonra ${returnDays} günlük iade dönemi başlar.`,
      `İade dönemi bitiminde (sipariş - iade) sayısına göre final fiyat belirlenir.`,
      `Ödediğiniz fiyat ile final fiyat arasındaki fark, aldığınız adet × fark tutarı kadar kupon olarak tanımlanır.`,
      `Kuponlar tüm alışverişlerinizde kullanılabilir, son kullanma tarihi yoktur.`,
    ],
    example: originalPrice > 0 ? {
      originalPrice,
      exampleFinalPrice: tiers.length ? Math.min(...tiers.map(t => t.price)) : originalPrice * 0.9,
      exampleQty: 2,
      note: `Örneğin ${originalPrice.toFixed(0)} ₺ ürün, kampanya sonunda ${tiers.length ? Math.min(...tiers.map(t => t.price)).toFixed(0) : (originalPrice * 0.9).toFixed(0)} ₺'ye düşerse, 2 adet alan kişiye 2 × ${(originalPrice - (tiers.length ? Math.min(...tiers.map(t => t.price)) : originalPrice * 0.9)).toFixed(0)} ₺ = ${(2 * (originalPrice - (tiers.length ? Math.min(...tiers.map(t => t.price)) : originalPrice * 0.9))).toFixed(0)} ₺ kupon tanımlanır.`,
    } : null,
    return_window_days: returnDays,
    coupon_info: 'Tüm ürün kategorilerinde geçerli, birden fazla kupon birleştirilebilir.',
  };
};

@ApiTags('Marketing')
@Controller('group-buy')
export class GroupBuyController {
  constructor(
    private readonly financialGateway: FinancialGatewayService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Aktif grup satın alma kampanyası' })
  @Get('active')
  async getActiveDeals() {
    const activeCampaign = await GroupBuy.findOne({ status: 'ACTIVE' }).sort({ createdAt: -1 }).lean();
    if (!activeCampaign) return { success: true, data: null };
    return { success: true, data: await this.enrichCampaign(activeCampaign as unknown as GroupBuyLeanDoc) };
  }

  @Public()
  @ApiOperation({ summary: 'Tüm aktif kampanyalar' })
  @Get('all')
  async getAllActiveDeals() {
    const campaigns = await GroupBuy.find({ status: { $in: ['ACTIVE', 'ENDED'] } }).sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(campaigns.map(c => this.enrichCampaign(c as unknown as GroupBuyLeanDoc)));
    return { success: true, data: enriched };
  }

  @Public()
  @ApiOperation({ summary: 'Kampanya detayı + bilgilendirme notu' })
  @Get(':id')
  async getCampaignDetail(@Param('id') id: string) {
    const campaign = await GroupBuy.findOne({ id }).lean();
    if (!campaign) throw new NotFoundException('Kampanya bulunamadı');
    const enriched = await this.enrichCampaign(campaign as unknown as GroupBuyLeanDoc);
    return {
      success: true,
      data: {
        ...enriched,
        campaignNote: buildCampaignNote(campaign as unknown as GroupBuyLeanDoc),
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kampanyaya katıl — sayaç güncellenir, cüzdan bloke edilir' })
  @Post(':id/participate')
  async participate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body('quantity') quantity = 1,
  ) {
    const qty = Math.max(1, Number(quantity) || 1);

    const campaign = await GroupBuy.findOne({ id, status: 'ACTIVE' }).lean() as unknown as GroupBuyLeanDoc | null;
    if (!campaign) throw new NotFoundException('Aktif kampanya bulunamadı');
    if (new Date() > new Date(campaign.endDate!)) throw new BadRequestException('Kampanya süresi dolmuştur');

    const unitPrice = toPrice(campaign.price);
    const totalAmount = unitPrice * qty;

    // 1. Sayacı atomik artır ($inc = race condition yok)
    const updateResult = await GroupBuy.findOneAndUpdate(
      { id, status: 'ACTIVE' },
      { $inc: { currentQuantity: qty } },
      { new: true },
    ).lean() as unknown as GroupBuyLeanDoc | null;

    if (!updateResult) throw new NotFoundException('Kampanya güncellenemedi');

    const newQty = updateResult.currentQuantity ?? qty;
    const tiers = campaign.tiers ?? [];
    const newPrice = getActiveTierPrice(tiers, newQty, toPrice(campaign.originalPrice ?? campaign.price));

    // Fiyat tier'a göre değiştiyse güncelle
    if (newPrice !== toPrice(campaign.price)) {
      await GroupBuy.updateOne({ id }, { $set: { price: newPrice } });
    }

    // 2. Finansal bloke — opsiyonel (servis kapalıysa sadece log)
    let holdId: string | null = null;
    try {
      const idempotencyKey = `groupbuy-${id}-${user.id}-${randomUUID()}`;
      const holdResult = await this.financialGateway.holdFunds(
        user.id,
        totalAmount.toString(),
        'GROUP_BUY',
        id,
        'GROUP_BUY_CAMPAIGN',
        idempotencyKey,
      );
      holdId = holdResult.holdId as string;
    } catch {
      // Finansal servis geçici kapalı — sayaç güncellendi, bloke sonra yapılacak
    }

    await this.auditLog.log({
      actorId: user.id,
      action: 'GROUP_BUY_PARTICIPATED',
      resourceType: 'GroupBuy',
      resourceId: id,
      newValue: { quantity: qty, unitPrice, totalAmount, newQty, newPrice, holdId },
    });

    const updated = await GroupBuy.findOne({ id }).lean() as unknown as GroupBuyLeanDoc;

    return {
      success: true,
      data: {
        holdId,
        paidPrice: unitPrice,
        quantity: qty,
        totalPaid: totalAmount,
        currentCampaignPrice: newPrice,
        currentQuantity: newQty,
        message: `${totalAmount.toFixed(2)} ₺ ödeme alındı. Kampanya finalinde oluşacak fiyat farkı kupon olarak iade edilecektir.`,
        campaignNote: buildCampaignNote(updated),
      },
    };
  }

  private async enrichCampaign(c: GroupBuyLeanDoc) {
    let product = null;
    if (c.productId) {
      const p = await CatalogProduct.findOne({ id: c.productId }).populate('media').lean() as CatalogProductLeanDoc | null;
      if (p) {
        product = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.media?.[0]?.url || 'https://placehold.co/600x600?text=PRODUCT',
        };
      }
    }

    const currentPrice = toPrice(c.price);
    const originalPrice = toPrice(c.originalPrice ?? c.price);
    const tiers = c.tiers ?? [];
    const currentQty = c.currentQuantity ?? 0;
    const activeTierPrice = getActiveTierPrice(tiers, currentQty, originalPrice);

    return {
      ...c,
      price: activeTierPrice,
      originalPrice,
      currentQuantity: currentQty,
      targetQuantity: c.targetQuantity ?? 0,
      discountPercent: originalPrice > 0
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0,
      isActive: c.status === 'ACTIVE',
      Product: product,
    };
  }
}
