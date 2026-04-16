// apps/backend/test/barter/accept-trade-offer.handler.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AcceptTradeOfferHandler } from '../../src/modules/barter/application/commands/accept-trade-offer.handler';
import { AcceptTradeOfferCommand } from '../../src/modules/barter/application/commands/accept-trade-offer.command';
import { CollateralCalculatorService } from '../../src/modules/barter/application/services/collateral-calculator.service';
import { PrismaService } from '@barterborsa/shared-persistence';
import { TradeOffer } from '../../src/modules/barter/domain/entities/trade-offer.entity';
import { TradeOfferItem } from '../../src/modules/barter/domain/entities/trade-offer-item.entity';
import { TradeOfferStatus } from '../../src/modules/barter/domain/enums/trade-offer-status.enum';
import { Prisma } from '@prisma/client';
import { RabbitMQService } from '@barterborsa/shared-messaging';

describe('AcceptTradeOfferHandler', () => {
  let handler: AcceptTradeOfferHandler;
  let offerRepo: any;
  let sessionRepo: any;
  let prisma: any;
  let rabbitMQ: any;

  beforeEach(async () => {
    offerRepo = { 
      findById: jest.fn(),
      save: jest.fn()
    };
    sessionRepo = {
      save: jest.fn()
    };
    prisma = { 
       $transaction: jest.fn((cb) => cb(prisma)),
       swapSession: { create: jest.fn() },
       barterPart: { createMany: jest.fn() }
    };
    rabbitMQ = { publish: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptTradeOfferHandler,
        CollateralCalculatorService,
        { provide: 'ITradeOfferRepository', useValue: offerRepo },
        { provide: 'ISwapSessionRepository', useValue: sessionRepo },
        { provide: PrismaService, useValue: prisma },
        { provide: RabbitMQService, useValue: rabbitMQ },
      ],
    }).compile();

    handler = module.get<AcceptTradeOfferHandler>(AcceptTradeOfferHandler);
  });

  it('should create a swap session and two barter parts when offer is accepted', async () => {
    const item1 = TradeOfferItem.create(new Prisma.Decimal(1), new Prisma.Decimal(1000), 'listing-1');
    const offer = TradeOffer.create(
      'comp-1',
      'comp-2',
      [item1],
      [],
      new Prisma.Decimal(0)
    );
    
    offerRepo.findById.mockResolvedValue(offer);

    const command = new AcceptTradeOfferCommand(offer.id);
    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(offer.status).toBe(TradeOfferStatus.ACCEPTED);
    expect(prisma.swapSession.create).toHaveBeenCalled();
    expect(rabbitMQ.publish).toHaveBeenCalledWith(
      'barter.events',
      'offer.accepted',
      expect.objectContaining({ sessionId: result.sessionId })
    );
  });

  it('should throw error if offer not found', async () => {
    offerRepo.findById.mockResolvedValue(null);
    const command = new AcceptTradeOfferCommand('non-existent');
    await expect(handler.execute(command)).rejects.toThrow('Trade offer not found');
  });
});
