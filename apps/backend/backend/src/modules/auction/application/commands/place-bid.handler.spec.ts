// apps/backend/src/modules/auction/application/commands/place-bid.handler.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PlaceBidHandler } from './place-bid.handler';
import { PlaceBidCommand } from './place-bid.command';
import { IAuctionRepository } from '../../domain/repositories/auction.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';

const mockAuction = {
  getProps: () => ({ currentPrice: 100, endTime: new Date(Date.now() + 86400000), status: 'ACTIVE' }),
  placeBid: jest.fn(),
  id: 'auction-1',
};

const mockRepository: Partial<IAuctionRepository> = {
  findById: jest.fn().mockResolvedValue(mockAuction),
  findParticipation: jest.fn().mockResolvedValue({ status: 'DEPOSIT_HELD' }),
  findBidsByAuctionId: jest.fn().mockResolvedValue([]),
  save: jest.fn().mockResolvedValue(undefined),
  createBid: jest.fn().mockResolvedValue(undefined),
};

const mockFinancialGateway = {
  getWallet: jest.fn().mockResolvedValue({ balance: '5000' }),
  holdFunds: jest.fn().mockResolvedValue({ holdId: 'hold-123' }),
  releaseFunds: jest.fn().mockResolvedValue(undefined),
};

const mockAuditLog = { log: jest.fn().mockResolvedValue(undefined) };

describe('PlaceBidHandler', () => {
  let handler: PlaceBidHandler;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceBidHandler,
        { provide: 'IAuctionRepository', useValue: mockRepository },
        { provide: FinancialGatewayService, useValue: mockFinancialGateway },
        { provide: AuditLogService, useValue: mockAuditLog },
      ],
    }).compile();
    handler = module.get<PlaceBidHandler>(PlaceBidHandler);
  });

  it('geçerli teklif başarıyla kaydedilir', async () => {
    const result = await handler.execute(new PlaceBidCommand('auction-1', 'user-1', 200));
    expect(result.success).toBe(true);
    expect(mockFinancialGateway.holdFunds).toHaveBeenCalledWith(
      'user-1', '200', 'AUCTION_BID', expect.any(String), 'AUCTION_BID', expect.any(String),
    );
    expect(mockRepository.createBid).toHaveBeenCalled();
    expect(mockAuditLog.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'AUCTION_BID_PLACED' }));
  });

  it('açık artırma bulunamazsa DomainException fırlatır', async () => {
    (mockRepository.findById as jest.Mock).mockResolvedValueOnce(null);
    await expect(handler.execute(new PlaceBidCommand('auction-x', 'user-1', 100)))
      .rejects.toThrow(DomainException);
  });

  it('katılım kaydı yoksa DomainException fırlatır', async () => {
    (mockRepository.findParticipation as jest.Mock).mockResolvedValueOnce(null);
    await expect(handler.execute(new PlaceBidCommand('auction-1', 'user-1', 100)))
      .rejects.toThrow(DomainException);
  });

  it('bakiye yetersizse DomainException fırlatır', async () => {
    (mockFinancialGateway.getWallet as jest.Mock).mockResolvedValueOnce({ balance: '50' });
    await expect(handler.execute(new PlaceBidCommand('auction-1', 'user-1', 500)))
      .rejects.toThrow(DomainException);
  });
});
