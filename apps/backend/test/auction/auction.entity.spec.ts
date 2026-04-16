// apps/backend/test/auction/auction.entity.spec.ts

import { Auction } from '../../src/modules/auction/domain/entities/auction.entity';
import { AuctionStatus } from '../../src/modules/auction/domain/enums/auction-status.enum';
import { Prisma } from '@prisma/client';

describe('Auction Entity', () => {
  let auction: Auction;

  beforeEach(() => {
    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(startTime.getHours() + 2);

    auction = Auction.create(
      'listing-1',
      'vendor-1',
      new Prisma.Decimal(100),
      startTime,
      endTime,
      new Prisma.Decimal(10)
    );
  });

  it('should start auction successfully', () => {
    auction.start();
    expect(auction.getProps().status).toBe(AuctionStatus.ACTIVE);
  });

  it('should place bid successfully when active and amount is valid', () => {
    auction.start();
    auction.placeBid('user-1', new Prisma.Decimal(110));
    expect(auction.getProps().currentPrice.toNumber()).toBe(110);
  });

  it('should throw error if bid amount is below minimum increment', () => {
    auction.start();
    expect(() => 
      auction.placeBid('user-1', new Prisma.Decimal(105))
    ).toThrow('Bid must be at least 110');
  });

  it('should throw error if auction is not active', () => {
    expect(() => 
      auction.placeBid('user-1', new Prisma.Decimal(200))
    ).toThrow('Auction is not active');
  });
});
