// apps/backend/test/loyalty/level-calculator.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { LevelCalculatorService } from '../../src/modules/loyalty/application/services/level-calculator.service';
import { LoyaltyTier } from '../../src/modules/loyalty/domain/enums/loyalty.enums';

describe('LevelCalculatorService', () => {
  let service: LevelCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LevelCalculatorService],
    }).compile();

    service = module.get<LevelCalculatorService>(LevelCalculatorService);
  });

  it('should return level 1 for low XP', () => {
    expect(service.calculateLevel(500)).toBe(1);
  });

  it('should return level 5 for high XP', () => {
    expect(service.calculateLevel(60000)).toBe(5);
  });

  it('should determine SILVER tier correctly', () => {
    expect(service.determineTier(1500)).toBe(LoyaltyTier.SILVER);
  });

  it('should determine DIAMOND tier for elite users', () => {
    expect(service.determineTier(120000)).toBe(LoyaltyTier.DIAMOND);
  });
});
