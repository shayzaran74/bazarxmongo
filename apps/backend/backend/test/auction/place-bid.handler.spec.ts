// apps/backend/test/auction/place-bid.handler.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PlaceBidHandler } from '../../src/modules/auction/application/commands/place-bid.handler';
import { PlaceBidCommand } from '../../src/modules/auction/application/commands/place-bid.command';
import { Auction } from '../../src/modules/auction/domain/entities/auction.entity';
import { AuctionStatus } from '../../src/modules/auction/domain/enums/auction-status.enum';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@barterborsa/shared-persistence';

describe('PlaceBidHandler', () => {
  let handler: PlaceBidHandler;
  let auctionRepo: any;

  beforeEach(async () => {
    auctionRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceBidHandler,
        { provide: 'IAuctionRepository', useValue: auctionRepo },
        { 
          provide: PrismaService, 
          useValue: { 
            $transaction: jest.fn((cb) => cb({ auctionBid: { create: jest.fn() } })) 
          } 
        },
      ],
    }).compile();

    handler = module.get<PlaceBidHandler>(PlaceBidHandler);
  });

  it('should successfully place a higher bid', async () => {
    const auction = Auction.create(
      'listing-1',
      'user-1',
      new Prisma.Decimal(100),
      new Date(Date.now() - 10000), // started
      new Date(Date.now() + 10000), // ending later
      new Prisma.Decimal(10)
    );
    auction.start();

    auctionRepo.findById.mockResolvedValue(auction);

    const command = new PlaceBidCommand('auction-1', 'bidder-1', 120);
    const result = await handler.execute(command);

    expect(result.success).toBe(true);
    expect(auction.getProps().currentPrice.toNumber()).toBe(120);
    expect(auctionRepo.save).toHaveBeenCalled();
  });

  it('should reject a bid lower than minimum required', async () => {
    const auction = Auction.create(
      'listing-1',
      'user-1',
      new Prisma.Decimal(100),
      new Date(Date.now() - 10000),
      new Date(Date.now() + 10000),
      new Prisma.Decimal(10)
    );
    auction.start();

    auctionRepo.findById.mockResolvedValue(auction);

    const command = new PlaceBidCommand('auction-1', 'bidder-1', 105);
    
    await expect(handler.execute(command)).rejects.toThrow('Bid must be at least 110');
  });
});
