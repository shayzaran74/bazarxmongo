// apps/backend/test/loyalty/xp-calculator.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { XpCalculatorService } from '../../src/modules/loyalty/application/services/xp-calculator.service';

describe('XpCalculatorService', () => {
  let service: XpCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XpCalculatorService],
    }).compile();

    service = module.get<XpCalculatorService>(XpCalculatorService);
  });

  it('should calculate base order XP correctly', () => {
    const xp = service.calculateOrderXp(100, false);
    // 100 TL order = 100 base + 2 bonus = 102
    expect(xp).toBe(102);
  });

  it('should add bonus for first order', () => {
    const xp = service.calculateOrderXp(100, true);
    // 100 TL order = 100 base + 500 bonus + 2 % bonus = 602
    expect(xp).toBe(602);
  });

  it('should calculate barter XP correctly', () => {
    const xp = service.calculateBarterXp(1000);
    // 1000 TL trade = 30 XP (3%)
    expect(xp).toBe(30);
  });
});
