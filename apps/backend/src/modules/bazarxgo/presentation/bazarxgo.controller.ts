// apps/backend/src/modules/bazarxgo/presentation/bazarxgo.controller.ts

import { Controller, Get, Post, Body, Param, Query, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { IGoRestaurantRepository } from '../domain/repositories/go-restaurant.repository.interface';
import { IGoCampaignRepository } from '../domain/repositories/go-campaign.repository.interface';
import { IGoCouponRepository } from '../domain/repositories/go-coupon.repository.interface';
import { ValidateGoCouponCommand } from '../application/commands/validate-coupon.command';
import { ValidateGoCouponDto } from '../application/dtos/validate-coupon.dto';
import { IGoRestaurant, IGoCampaign, IGoCoupon } from '@barterborsa/shared-persistence';

interface DecimalLike { toString(): string }

function decimalToNum(v: DecimalLike | undefined): number {
  return v ? Number(v.toString()) : 0;
}

function serializeRestaurant(r: IGoRestaurant): Record<string, unknown> {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    cuisine: r.cuisine,
    emoji: r.emoji,
    categories: r.categories,
    rating: r.rating,
    ratingCount: r.ratingCount,
    eta: `${r.etaMin}-${r.etaMax} dk`,
    deliveryFee: decimalToNum(r.deliveryFee),
    minOrder: decimalToNum(r.minOrder),
    hero1: r.hero1,
    hero2: r.hero2,
    tag: r.tag,
    tagType: r.tagType,
    promo: r.promo,
    isActive: r.isActive,
  };
}

function serializeRestaurantDetail(r: IGoRestaurant): unknown {
  return {
    ...serializeRestaurant(r),
    sections: r.sections.map(s => ({
      name: s.name,
      order: s.order,
      items: s.items.map(i => ({
        itemId: i.itemId,
        name: i.name,
        desc: i.desc,
        price: decimalToNum(i.price),
        oldPrice: i.oldPrice ? decimalToNum(i.oldPrice) : undefined,
        emoji: i.emoji,
        badge: i.badge,
        isAvailable: i.isAvailable,
      })),
    })),
  };
}

function serializeCampaign(c: IGoCampaign): Record<string, unknown> {
  return {
    id: c.id,
    tag: c.tag,
    title: c.title,
    sub: c.sub,
    emoji: c.emoji,
    ribbon: c.ribbon,
    g1: c.g1,
    g2: c.g2,
    validText: c.validText,
    conditions: c.conditions,
    restaurantIds: c.restaurantIds,
    couponCode: c.couponCode,
  };
}

function serializeCoupon(c: IGoCoupon): unknown {
  return {
    id: c.id,
    code: c.code,
    label: c.label,
    desc: c.desc,
    type: c.type,
    value: decimalToNum(c.value),
    maxDiscount: decimalToNum(c.maxDiscount),
    minOrderAmount: c.minOrderAmount ? decimalToNum(c.minOrderAmount) : undefined,
  };
}

@ApiTags('BazarXGO — Public')
@Controller('go')
export class BazarxgoController {
  constructor(
    @Inject('IGoRestaurantRepository') private readonly restaurantRepo: IGoRestaurantRepository,
    @Inject('IGoCampaignRepository') private readonly campaignRepo: IGoCampaignRepository,
    @Inject('IGoCouponRepository') private readonly couponRepo: IGoCouponRepository,
    private readonly commandBus: CommandBus,
  ) {}

  // ── Restoranlar ──────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Aktif restoran listesi (opsiyonel: mutfak/arama filtresi)' })
  @ApiQuery({ name: 'cat', required: false, description: 'Mutfak ID (all, burger, pizza …)' })
  @ApiQuery({ name: 'q', required: false, description: 'Metin araması' })
  @Get('restaurants')
  async listRestaurants(
    @Query('cat') cat?: string,
    @Query('q') q?: string,
  ): Promise<{ success: boolean; data: unknown[] }> {
    const list = await this.restaurantRepo.findAll({
      isActive: true,
      category: cat && cat !== 'all' ? cat : undefined,
      search: q ?? undefined,
    });
    return { success: true, data: list.map(serializeRestaurant) };
  }

  @Public()
  @ApiOperation({ summary: 'Restoran detayı + menü (slug veya id)' })
  @ApiParam({ name: 'slug' })
  @Get('restaurants/:slug')
  async getRestaurantDetail(
    @Param('slug') slug: string,
  ): Promise<{ success: boolean; data: unknown | null }> {
    // Hem slug hem id ile çalış
    const r = await this.restaurantRepo.findBySlug(slug)
      ?? await this.restaurantRepo.findById(slug);

    if (!r) return { success: false, data: null };
    return { success: true, data: serializeRestaurantDetail(r) };
  }

  // ── Kampanyalar ──────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Aktif kampanyalar (hero carousel)' })
  @Get('campaigns')
  async listCampaigns(): Promise<{ success: boolean; data: unknown[] }> {
    const list = await this.campaignRepo.findAll(true);
    return { success: true, data: list.map(serializeCampaign) };
  }

  @Public()
  @ApiOperation({ summary: 'Kampanya detayı' })
  @ApiParam({ name: 'id' })
  @Get('campaigns/:id')
  async getCampaign(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: unknown | null }> {
    const c = await this.campaignRepo.findById(id);
    if (!c) return { success: false, data: null };

    // İlgili restoranları da getir
    const restaurants = await Promise.all(
      c.restaurantIds.map(rid => this.restaurantRepo.findById(rid)),
    );
    return {
      success: true,
      data: {
        ...serializeCampaign(c),
        restaurants: restaurants.filter(Boolean).map(r => serializeRestaurant(r!)),
      },
    };
  }

  // ── Kuponlar ─────────────────────────────────────────────────

  @Public()
  @ApiOperation({ summary: 'Kupon şeridi' })
  @Get('coupons')
  async listCoupons(): Promise<{ success: boolean; data: unknown[] }> {
    const list = await this.couponRepo.findAll(true);
    return { success: true, data: list.map(serializeCoupon) };
  }

  @Public()
  @ApiOperation({ summary: 'Kupon doğrula (sepet tutarı ile)' })
  @Post('coupons/validate')
  async validateCoupon(
    @Body() dto: ValidateGoCouponDto,
  ): Promise<{ valid: boolean; discountAmount: string; message: string }> {
    return this.commandBus.execute(
      new ValidateGoCouponCommand(dto.code, dto.orderAmount),
    );
  }
}
