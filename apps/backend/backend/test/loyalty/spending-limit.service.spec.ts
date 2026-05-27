// apps/backend/test/loyalty/spending-limit.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { SpendingLimitService } from '../../src/modules/loyalty/application/services/spending-limit.service';
import { DomainException } from '@barterborsa/shared-core';

describe('SpendingLimitService', () => {
  let service: SpendingLimitService;
  let ruleRepo: any;
  let txRepo: any;

  beforeEach(async () => {
    ruleRepo = {
      findApplicable: jest.fn().mockResolvedValue([
        {
          getProps: () => ({
            minCartAmount: 50,
            maxSpendPercentage: 50,
            xpToTlRate: 0.1,
          })
        }
      ]),
    };
    txRepo = {
      sumSpentInPeriod: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpendingLimitService,
        { provide: 'IXpSpendingLimitRuleRepository', useValue: ruleRepo },
        { provide: 'IXpTransactionRepository', useValue: txRepo },
      ],
    }).compile();

    service = module.get<SpendingLimitService>(SpendingLimitService);
  });

  it('should throw error if cart amount is below minimum', async () => {
    await expect(service.validateSpending('user-1', 10, 40)).rejects.toThrow(DomainException);
  });

  it('should throw error if spending percentage exceeds max', async () => {
    // 300 XP = 30 TL. Cart = 50 TL. (30/50)*100 = 60%. Max is 50%.
    await expect(service.validateSpending('user-1', 300, 50)).rejects.toThrow(DomainException);
  });

  it('should allow valid spending', async () => {
    // 100 XP = 10 TL. Cart = 100 TL. (10/100)*100 = 10%. Max is 50%.
    await expect(service.validateSpending('user-1', 100, 100)).resolves.not.toThrow();
  });
});
