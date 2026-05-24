// apps/backend/src/modules/catalog/presentation/price-advisor.controller.ts

import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public } from '@barterborsa/shared-security';
import { IListing } from '@barterborsa/shared-persistence';
import { safeRegexFilter } from '../../../common/utils/regex.utils';

interface PriceRecommendation {
  success: boolean;
  suggestion?: number;
  min?: number;
  max?: number;
  message?: string;
}

@ApiTags('Price Advisor')
@Controller('price-advisor')
export class PriceAdvisorController {
  private readonly logger = new Logger(PriceAdvisorController.name);

  constructor(
    @InjectModel('Listing') private readonly listingModel: Model<IListing>,
  ) {}

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Başlık ve hedef fiyata göre fiyat önerisi' })
  @ApiQuery({ name: 'title', required: true, type: String })
  @ApiQuery({ name: 'price', required: false, type: Number })
  async check(
    @Query('title') title: string,
    @Query('price') priceStr?: string,
  ): Promise<PriceRecommendation> {
    const targetPrice = parseFloat(priceStr || '0') || 0;
    if (!title || title.trim().length < 3) {
      return { success: false, message: 'Başlık en az 3 karakter olmalı' };
    }

    try {
      const regex = safeRegexFilter(title.trim(), 100);
      if (!regex) {
        return { success: true, suggestion: targetPrice || 150, min: 100, max: 200 };
      }

      let listings: IListing[] = await this.listingModel.find({
        status: 'ACTIVE',
        title: regex,
      }).limit(20).lean().exec();

      if (listings.length === 0) {
        const words = title.trim().split(/\s+/).filter(w => w.length > 2);
        if (words.length > 1) {
          const fallbackRegex = safeRegexFilter(words.join(' '), 100);
          if (fallbackRegex) {
            listings = await this.listingModel.find({
              status: 'ACTIVE',
              title: fallbackRegex,
            }).limit(10).lean().exec();
          }
        }
      }

      const prices = listings
        .map(l => {
          if (!l.price) return 0;
          return typeof l.price === 'object' && l.price.toString
            ? parseFloat(l.price.toString())
            : parseFloat(String(l.price));
        })
        .filter(p => p > 0);

      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const suggestion = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
        return { success: true, suggestion, min, max };
      }

      if (targetPrice > 0) {
        return {
          success: true,
          suggestion: targetPrice,
          min: Math.round(targetPrice * 0.8),
          max: Math.round(targetPrice * 1.2),
        };
      }

      return { success: true, suggestion: 150, min: 100, max: 200 };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Fiyat danışmanı hatası', { title, error: msg });
      return { success: false, message: 'Fiyat önerisi hesaplanamadı' };
    }
  }
}
