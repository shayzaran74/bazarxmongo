// apps/backend/src/modules/catalog/presentation/price-advisor.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public } from '@barterborsa/shared-security';
import { IListing } from '@barterborsa/shared-persistence';

@ApiTags('Price Advisor')
@Controller('price-advisor')
export class PriceAdvisorController {
  constructor(
    @InjectModel('Listing') private readonly listingModel: Model<IListing>,
  ) {}

  @Public()
  @Get('check')
  @ApiOperation({ summary: 'Get price recommendations for a title and target price' })
  @ApiQuery({ name: 'title', required: true, type: String })
  @ApiQuery({ name: 'price', required: false, type: Number })
  async check(
    @Query('title') title: string,
    @Query('price') priceStr?: string,
  ) {
    const targetPrice = parseFloat(priceStr || '0') || 0;
    if (!title || title.trim().length < 3) {
      return { success: false };
    }

    try {
      // Split into keywords to perform a basic keyword search
      const keywords = title
        .split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z0-9çğışöüÇĞİŞÖÜ]/g, '').toLowerCase().trim())
        .filter(w => w.length > 2);

      let listings: any[] = [];
      if (keywords.length > 0) {
        // Search by regex
        const regexPattern = keywords.map(w => `(?=.*${w})`).join('');
        listings = await this.listingModel.find({
          status: 'ACTIVE',
          title: { $regex: regexPattern, $options: 'i' }
        }).limit(20).lean();

        // Fallback: search if any keyword matches if no exact match found
        if (listings.length === 0) {
          listings = await this.listingModel.find({
            status: 'ACTIVE',
            title: { $regex: keywords.join('|'), $options: 'i' }
          }).limit(10).lean();
        }
      }

      const prices = listings
        .map(l => {
          if (l.price) {
            if (typeof l.price === 'object' && l.price.toString) {
              return parseFloat(l.price.toString());
            }
            return parseFloat(l.price);
          }
          return 0;
        })
        .filter(p => p > 0);

      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const suggestion = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
        return {
          success: true,
          suggestion,
          min,
          max,
        };
      }

      // Default fallback range if no listing matches but price is provided
      if (targetPrice > 0) {
        return {
          success: true,
          suggestion: targetPrice,
          min: Math.round(targetPrice * 0.8),
          max: Math.round(targetPrice * 1.2),
        };
      }

      // Ultimate default range for new titles with 0 price
      return {
        success: true,
        suggestion: 150,
        min: 100,
        max: 200,
      };
    } catch (e) {
      return { success: false };
    }
  }
}
