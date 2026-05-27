// apps/backend/src/modules/barter/application/commands/accept-trade-offer.handler.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AcceptTradeOfferHandler } from './accept-trade-offer.handler';
import { AcceptTradeOfferCommand } from './accept-trade-offer.command';
import { ITradeOfferRepository } from '../../domain/repositories/trade-offer.repository.interface';
import { ISwapSessionRepository } from '../../domain/repositories/swap-session.repository.interface';
import { CollateralCalculatorService } from '../services/collateral-calculator.service';
import { WatchtowerService } from '../services/watchtower.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RabbitMQService } from '@barterborsa/shared-messaging';
import { DomainException } from '@barterborsa/shared-core';
import { getConnectionToken } from '@nestjs/mongoose';

const mockOfferedItem = {
  getProps: () => ({ estimatedValue: '1000' }),
};

const mockOffer = {
  id: 'offer-1',
  accept: jest.fn(),
  getProps: () => ({
    initiatorId: 'user-a',
    receiverId: 'user-b',
    fromCompanyId: 'company-a',
    toCompanyId: 'company-b',
    offeredItems: [mockOfferedItem],
  }),
};

const mockOfferRepo: Partial<ITradeOfferRepository> = {
  findById: jest.fn().mockResolvedValue(mockOffer),
  save: jest.fn().mockResolvedValue(undefined),
};

const mockCollateral = { calculateCollateral: jest.fn().mockReturnValue(200) };
const mockWatchtower = { checkBarterSmartCap: jest.fn().mockResolvedValue(undefined) };

const mockFinancialGateway = {
  holdFunds: jest.fn()
    .mockResolvedValueOnce({ holdId: 'hold-initiator' })
    .mockResolvedValueOnce({ holdId: 'hold-receiver' }),
  refundFunds: jest.fn().mockResolvedValue(undefined),
};

const mockAuditLog = { log: jest.fn().mockResolvedValue(undefined) };
const mockRabbitMQ = { publish: jest.fn().mockResolvedValue(undefined) };

const mockTransaction = jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb());
const mockMongoSession = {
  withTransaction: mockTransaction,
  endSession: jest.fn(),
};
const mockConnection = { startSession: jest.fn().mockResolvedValue(mockMongoSession) };

jest.mock('@barterborsa/shared-persistence/schemas/backend/swapSession.schema', () => ({
  SwapSession: { create: jest.fn().mockResolvedValue({}) },
}));
jest.mock('@barterborsa/shared-persistence/schemas/backend/barterPart.schema', () => ({
  BarterPart: { create: jest.fn().mockResolvedValue([]) },
}));
jest.mock('@barterborsa/shared-persistence/schemas/backend/outbox-message.schema', () => ({
  OutboxMessage: { create: jest.fn().mockResolvedValue({}) },
}));

describe('AcceptTradeOfferHandler', () => {
  let handler: AcceptTradeOfferHandler;

  beforeEach(async () => {
    jest.clearAllMocks();
    (mockFinancialGateway.holdFunds as jest.Mock)
      .mockResolvedValueOnce({ holdId: 'hold-initiator' })
      .mockResolvedValueOnce({ holdId: 'hold-receiver' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptTradeOfferHandler,
        { provide: 'ITradeOfferRepository', useValue: mockOfferRepo },
        { provide: 'ISwapSessionRepository', useValue: {} },
        { provide: CollateralCalculatorService, useValue: mockCollateral },
        { provide: WatchtowerService, useValue: mockWatchtower },
        { provide: getConnectionToken(), useValue: mockConnection },
        { provide: RabbitMQService, useValue: mockRabbitMQ },
        { provide: FinancialGatewayService, useValue: mockFinancialGateway },
        { provide: AuditLogService, useValue: mockAuditLog },
      ],
    }).compile();
    handler = module.get<AcceptTradeOfferHandler>(AcceptTradeOfferHandler);
  });

  it('teklif kabul edildiğinde her iki tarafın teminatı bloke edilir', async () => {
    const result = await handler.execute(new AcceptTradeOfferCommand('offer-1', 'user-b'));
    expect(result.success).toBe(true);
    expect(mockFinancialGateway.holdFunds).toHaveBeenCalledTimes(2);
    expect(mockAuditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BARTER_OFFER_ACCEPTED' }),
    );
  });

  it('teklif bulunamazsa DomainException fırlatır', async () => {
    (mockOfferRepo.findById as jest.Mock).mockResolvedValueOnce(null);
    await expect(handler.execute(new AcceptTradeOfferCommand('offer-x', 'user-b')))
      .rejects.toThrow(DomainException);
  });

  it('alıcı teminat başarısız olursa initiator teminatı iade edilir', async () => {
    (mockFinancialGateway.holdFunds as jest.Mock)
      .mockResolvedValueOnce({ holdId: 'hold-initiator' })
      .mockRejectedValueOnce(new Error('Yetersiz bakiye'));

    await expect(handler.execute(new AcceptTradeOfferCommand('offer-1', 'user-b')))
      .rejects.toThrow(DomainException);
    expect(mockFinancialGateway.refundFunds).toHaveBeenCalledWith(
      'hold-initiator', expect.stringContaining('initiator-refund'),
    );
  });
});
