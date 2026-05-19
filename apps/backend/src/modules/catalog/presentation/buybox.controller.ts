// apps/backend/src/modules/catalog/presentation/buybox.controller.ts

import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { BuyboxCalculatorService, BuyboxWinner } from '../application/services/buybox-calculator.service';

@Controller('products/:id/offers')
@UseGuards(JwtAuthGuard)
export class BuyboxController {
  constructor(private readonly buyboxCalculator: BuyboxCalculatorService) {}

  /**
   * GET /products/:id/offers
   * Ürünün tüm satıcı tekliflerini ve buybox durumlarını listele
   */
  @Get()
  async getProductOffers(@Param('id') productId: string, @Request() req: any) {
    const winners = await this.buyboxCalculator.calculateProductBuybox(productId);
    return { success: true, data: winners };
  }

  /**
   * GET /products/:id/buybox-winner
   * Ürünün buybox kazananını getir
   */
  @Get('buybox-winner')
  async getBuyboxWinner(@Param('id') productId: string) {
    const winners = await this.buyboxCalculator.calculateProductBuybox(productId);
    const winner = winners.find((w: BuyboxWinner) => w.isBuyboxWinner);
    return { success: true, data: winner ?? null };
  }
}

@Controller('listings/:id/buybox-status')
@UseGuards(JwtAuthGuard)
export class ListingBuyboxController {
  constructor(private readonly buyboxCalculator: BuyboxCalculatorService) {}

  /**
   * GET /listings/:id/buybox-status
   * Belirli bir listing'in buybox durumunu getir
   */
  @Get()
  async getListingBuyboxStatus(@Param('id') listingId: string, @Request() req: any) {
    // TODO: ListingRepository'den listing'i çek, productId'yi bul, buybox hesapla
    return { success: true, data: { listingId, isBuyboxWinner: false, score: 0 } };
  }
}

@Controller('admin/buybox')
@UseGuards(JwtAuthGuard)
export class AdminBuyboxController {
  constructor(private readonly buyboxCalculator: BuyboxCalculatorService) {}

  /**
   * POST /admin/buybox/:productId/recalculate
   * Admin buybox'ı manuel yeniden hesaplatır
   */
  @Post(':productId/recalculate')
  async recalculateBuybox(@Param('productId') productId: string, @Request() req: any) {
    const winners = await this.buyboxCalculator.calculateProductBuybox(productId);
    return {
      success: true,
      data: {
        productId,
        winnerId: winners.find(w => w.isBuyboxWinner)?.listingId,
        allScores: winners,
      },
    };
  }
}