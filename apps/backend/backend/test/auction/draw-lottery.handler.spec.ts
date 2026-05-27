// apps/backend/test/auction/draw-lottery.handler.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { DrawLotteryHandler } from '../../src/modules/auction/application/commands/draw-lottery.handler';
import { DrawLotteryCommand } from '../../src/modules/auction/application/commands/draw-lottery.command';
import { Lottery } from '../../src/modules/auction/domain/entities/lottery.entity';
import { Prisma } from '@prisma/client';

describe('DrawLotteryHandler', () => {
  let handler: DrawLotteryHandler;
  let lotteryRepo: any;

  beforeEach(async () => {
    lotteryRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawLotteryHandler,
        { provide: 'ILotteryRepository', useValue: lotteryRepo },
      ],
    }).compile();

    handler = module.get<DrawLotteryHandler>(DrawLotteryHandler);
  });

  it('should draw a winning number for the lottery', async () => {
    const lottery = Lottery.create(
      'Grand Prize',
      new Prisma.Decimal(10),
      new Date(Date.now() + 10000),
      'owner-1',
      1000
    );

    lotteryRepo.findById.mockResolvedValue(lottery);

    const command = new DrawLotteryCommand('lottery-1');
    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(result.winningNumber).toBeDefined();
    expect(result.winningNumber.length).toBe(4); // 1000 is 4 digits if zero-padded correctly
    expect(lotteryRepo.save).toHaveBeenCalled();
  });
});
