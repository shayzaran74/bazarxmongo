// apps/backend/src/modules/catalog/application/services/buybox-calculator.service.ts
// BuyboxCalculatorService — Buybox scoring algoritması (Master Plan §3.8)
// Ağırlıklar: Fiyat %40, Satıcı Puanı %30, Teslimat Hızı %20, Stok %10

import { Injectable, Logger, Inject } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { IListingRepository } from '../../domain/repositories/listing.repository.interface';
import { VendorStats } from '@barterborsa/shared-persistence';

export interface BuyboxScore {
  listingId: string;
  vendorId: string;
  totalScore: number;
  priceScore: number;     // 0-1, en düşük fiyat = 1.0
  ratingScore: number;    // 0-1, en yüksek puan = 1.0
  deliveryScore: number;  // 0-1, en hızlı teslimat = 1.0
  stockScore: number;     // 0-1, en yüksek stok = 1.0
}

export interface BuyboxWinner {
  listingId: string;
  vendorId: string;
  score: number;
  isBuyboxWinner: boolean;
}

@Injectable()
export class BuyboxCalculatorService {
  private readonly logger = new Logger(BuyboxCalculatorService.name);

  // Ağırlıklar — Master Plan §3.8
  private readonly PRICE_WEIGHT     = 0.40;
  private readonly RATING_WEIGHT    = 0.30;
  private readonly DELIVERY_WEIGHT  = 0.20;
  private readonly STOCK_WEIGHT     = 0.10;

  constructor(
    @Inject('IVendorRepository') private readonly vendorRepo: IVendorRepository,
    @Inject('IListingRepository') private readonly listingRepo: IListingRepository,
  ) {}

  /**
   * Belirli bir productId için tüm listing'lerin buybox score'unu hesapla
   * Master Plan §3.8: "En düşük fiyat = 1.0, en yüksek puan = 1.0"
   */
  async calculateProductBuybox(productId: string): Promise<BuyboxWinner[]> {
    const listings = await this.listingRepo.findByCatalogProductId(productId);

    if (listings.length === 0) return [];
    if (listings.length === 1) {
      return [{
        listingId: listings[0].id,
        vendorId: listings[0].vendorId,
        score: 1.0,
        isBuyboxWinner: true,
      }];
    }

    // Fiyat score hesapla (en düşük = 1.0)
    const prices = listings.map(l => Number(l.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Rating score hesapla (en yüksek = 1.0)
    // TODO: Gerçek rating'i VendorStats'dan çek
    const ratings = await Promise.all(
      listings.map(l => this.getVendorRating(l.vendorId))
    );
    const maxRating = Math.max(...ratings, 1);
    const minRating = Math.min(...ratings, 1);
    const ratingRange = maxRating - minRating || 1;

    // Delivery score (en hızlı = 1.0)
    // TODO: Gerçek teslimat süresini vendor shipping stats'tan çek
    const deliveryDays = await Promise.all(
      listings.map(l => this.getVendorDeliveryDays(l.vendorId))
    );
    const minDelivery = Math.min(...deliveryDays, 1);
    const maxDelivery = Math.max(...deliveryDays, 1);
    const deliveryRange = maxDelivery - minDelivery || 1;

    // Stock score (en yüksek = 1.0)
    const stocks = listings.map(l => l.stock);
    const maxStock = Math.max(...stocks, 1);

    // Her listing için toplam score hesapla
    const scores: BuyboxWinner[] = listings.map((listing, i) => {
      const priceScore = 1 - ((prices[i] - minPrice) / priceRange);
      const ratingScore = (ratings[i] - minRating) / ratingRange;
      const deliveryScore = 1 - ((deliveryDays[i] - minDelivery) / deliveryRange);
      const stockScore = stocks[i] / maxStock;

      const totalScore =
        priceScore * this.PRICE_WEIGHT +
        ratingScore * this.RATING_WEIGHT +
        deliveryScore * this.DELIVERY_WEIGHT +
        stockScore * this.STOCK_WEIGHT;

      return {
        listingId: listing.id,
        vendorId: listing.vendorId,
        score: totalScore,
        isBuyboxWinner: false,
      };
    });

    // En yüksek score'a sahip listing'i winner yap
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 0) {
      scores[0].isBuyboxWinner = true;
    }

    this.logger.log('Buybox score hesaplandı', {
      productId,
      listingCount: listings.length,
      winnerId: scores.find(s => s.isBuyboxWinner)?.listingId,
    });

    return scores;
  }

  /**
   * Vendor puanını getir — VendorStats'dan çek
   * En yüksek puan = 1.0, en düşük puan normalize edilir
   */
  private async getVendorRating(vendorId: string): Promise<number> {
    try {
      const stats = await VendorStats.findOne({ vendorId }).exec();
      if (!stats) return 4.0; // Varsayılan
      return Number(stats.rating) || 4.0;
    } catch {
      return 4.0;
    }
  }

  /**
   * Vendor teslimat gün sayısını getir — VendorStats veya varsayılan
   * En hızlı teslimat = 1.0
   */
  private async getVendorDeliveryDays(vendorId: string): Promise<number> {
    try {
      // VendorStats'da delivery days yoksa varsayılan 3 gün döndür
      // Gerçek implementasyonda VendorShippingStats'dan çekilecek
      const stats = await VendorStats.findOne({ vendorId }).exec();
      if (!stats) return 3;
      // VendorStats'ta deliveryDays alanı yok, şimdilik varsayılan
      return 3;
    } catch {
      return 3;
    }
  }
}