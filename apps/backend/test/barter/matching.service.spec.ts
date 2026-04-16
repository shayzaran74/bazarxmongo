// apps/backend/test/barter/matching.service.spec.ts

import { MatchingService } from '../../src/modules/barter/application/services/matching.service';
import { SurplusItem } from '../../src/modules/barter/domain/entities/surplus-item.entity';
import { WantedItem } from '../../src/modules/barter/domain/entities/wanted-item.entity';
import { PilotCity } from '../../src/modules/barter/domain/enums/pilot-city.enum';
import { Prisma } from '@prisma/client';

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(() => {
    service = new MatchingService();
  });

  it('should calculate maximum score (100) for a perfect match', () => {
    const surplus = SurplusItem.create(
      'comp-1',
      'Laptop Acer Nitro 5',
      'electronics',
      new Prisma.Decimal(1),
      'pcs',
      PilotCity.ISTANBUL,
      'High performance laptop',
      new Prisma.Decimal(15000)
    );

    const wanted = WantedItem.create(
      'electronics',
      ['Laptop', 'Acer'],
      'comp-2'
    );
    // Setting description to include city for location match
    (wanted.getProps() as any).description = 'Need a laptop in ISTANBUL';
    (wanted.getProps() as any).minPrice = new Prisma.Decimal(10000);
    (wanted.getProps() as any).maxPrice = new Prisma.Decimal(20000);

    const score = service.calculateMatchScore(surplus, wanted);
    
    // Category: 40
    // Keywords (Laptop, Acer both matched): 30
    // Price Range (15000 is between 10k-20k): 20
    // Location (ISTANBUL matched): 10
    expect(score).toBe(100);
  });

  it('should calculate partial score for mismatched location and partial keywords', () => {
     const surplus = SurplusItem.create(
      'comp-1',
      'Laptop Acer',
      'electronics',
      new Prisma.Decimal(1),
      'pcs',
      PilotCity.ANKARA,
      'Laptop'
    );

    const wanted = WantedItem.create(
      'electronics',
      ['Laptop', 'HP'], // Only Laptop matches
      'comp-2'
    );
    
    const score = service.calculateMatchScore(surplus, wanted);
    
    // Category: 40
    // Keywords (1 of 2 matched): 15
    // Price: 0
    // Location: 0
    expect(score).toBe(55);
  });
});
