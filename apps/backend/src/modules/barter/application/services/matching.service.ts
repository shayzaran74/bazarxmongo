// apps/backend/src/modules/barter/application/services/matching.service.ts

import { Injectable } from '@nestjs/common';
import { SurplusItem } from '../../domain/entities/surplus-item.entity';
import { WantedItem } from '../../domain/entities/wanted-item.entity';

@Injectable()
export class MatchingService {
  public calculateMatchScore(surplus: SurplusItem, wanted: WantedItem): number {
    let score = 0;

    // 1. Category Match (40 points)
    if (surplus.getProps().category === wanted.getProps().categoryId) {
      score += 40;
    }

    // 2. Keyword Match (30 points)
    const title = surplus.getProps().title.toLowerCase();
    const keywords = wanted.getProps().keywords;
    let matchCount = 0;
    keywords.forEach(kw => {
      if (title.includes(kw.toLowerCase())) matchCount++;
    });
    if (keywords.length > 0) {
      score += Math.min(30, (matchCount / keywords.length) * 30);
    }

    // 3. Price Range Match (20 points)
    const price = surplus.getProps().unitPrice;
    const min = wanted.getProps().minPrice;
    const max = wanted.getProps().maxPrice;

    if (price) {
      if (min && price >= min) score += 10;
      if (max && price <= max) score += 10;
    }

    // 4. Location Match (10 points)
    const city = surplus.getProps().city;
    const description = wanted.getProps().description;
    if (city && description && description.includes(city.toString())) {
       score += 10;
    }

    return Math.round(score);
  }
}
