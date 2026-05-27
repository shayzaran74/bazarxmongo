// apps/backend/src/modules/barter/application/commands/swap-session-lifecycle.spec.ts
// SwapSession yaşam döngüsü: PENDING_COLLATERAL → ACTIVE → SHIPPING → COMPLETED

import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { DomainException } from '@barterborsa/shared-core';

import { AcceptTradeOfferHandler } from './accept-trade-offer.handler';
import { AcceptTradeOfferCommand } from './accept-trade-offer.command';
import { ConfirmReceiptHandler } from './confirm-receipt.handler';
import { ConfirmReceiptCommand } from './confirm-receipt.command';
import { FinalizeSwapHandler } from './finalize-swap.handler';
import { FinalizeSwapCommand } from './finalize-swap.command';
import { CollateralCalculatorService } from '../services/collateral-calculator.service';
import { WatchtowerService } from '../services/watchtower.service';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { RabbitMQService } from '@barterborsa/shared-messaging';

// ─── Schema mock'ları ─────────────────────────────────────────────────────────
jest.mock('@barterborsa/shared-persistence/schemas/backend/swapSession.schema', () => ({
  SwapSession: { create: jest.fn().mockResolvedValue({}) },
}));
jest.mock('@barterborsa/shared-persistence/schemas/backend/barterPart.schema', () => ({
  BarterPart: { create: jest.fn().mockResolvedValue([]) },
}));
jest.mock('@barterborsa/shared-persistence/schemas/backend/outbox-message.schema', () => ({
  OutboxMessage: { create: jest.fn().mockResolvedValue({}) },
}));

// ─── Sabit test verileri ─────────────────────────────────────────────────────
const OFFER_ID   = 'offer-swap-1';
const SESSION_ID = 'session-swap-1';
const USER_A     = 'user-initiator';
const USER_B     = 'user-receiver';

const mockOfferedItem = { getProps: () => ({ estimatedValue: '500' }) };

const mockOffer = {
  id: OFFER_ID,
  accept: jest.fn(),
  getProps: () => ({
    initiatorId: USER_A,
    receiverId:  USER_B,
    fromCompanyId: 'company-a',
    toCompanyId:   'company-b',
    offeredItems:  [mockOfferedItem],
  }),
};

// ─── Yardımcı mock fabrikaları ───────────────────────────────────────────────
const makeMockSession = () => ({
  withTransaction: jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb()),
  endSession: jest.fn().mockResolvedValue(undefined),
});

const makeFinancialGateway = () => ({
  holdFunds:    jest.fn()
    .mockResolvedValueOnce({ holdId: 'hold-a' })
    .mockResolvedValueOnce({ holdId: 'hold-b' }),
  refundFunds:  jest.fn().mockResolvedValue(undefined),
  releaseFunds: jest.fn().mockResolvedValue(undefined),
});

// ─── Test 1: PENDING_COLLATERAL → ACTIVE ─────────────────────────────────────

describe('SwapSession: Teklif Kabulü (PENDING_COLLATERAL → ACTIVE)', () => {
  let handler: AcceptTradeOfferHandler;
  let financialGateway: ReturnType<typeof makeFinancialGateway>;
  let mockAuditLog: { log: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    financialGateway = makeFinancialGateway();
    mockAuditLog     = { log: jest.fn().mockResolvedValue(undefined) };

    const mockConnection = { startSession: jest.fn().mockResolvedValue(makeMockSession()) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptTradeOfferHandler,
        CollateralCalculatorService,
        { provide: 'ITradeOfferRepository',    useValue: { findById: jest.fn().mockResolvedValue(mockOffer), save: jest.fn() } },
        { provide: 'ISwapSessionRepository',   useValue: {} },
        { provide: WatchtowerService,          useValue: { checkBarterSmartCap: jest.fn().mockResolvedValue(undefined) } },
        { provide: getConnectionToken(),        useValue: mockConnection },
        { provide: RabbitMQService,             useValue: { publish: jest.fn() } },
        { provide: FinancialGatewayService,     useValue: financialGateway },
        { provide: AuditLogService,             useValue: mockAuditLog },
      ],
    }).compile();

    handler = module.get(AcceptTradeOfferHandler);
  });

  it('her iki tarafın teminatı bloke edilmeli ve session oluşturulmalı', async () => {
    const result = await handler.execute(new AcceptTradeOfferCommand(OFFER_ID, USER_B));

    expect(result.success).toBe(true);
    expect(result.sessionId).toBeDefined();

    // İki holdFunds çağrısı — initiator + receiver
    expect(financialGateway.holdFunds).toHaveBeenCalledTimes(2);
    expect(financialGateway.holdFunds).toHaveBeenNthCalledWith(
      1, USER_A, expect.any(String), 'BARTER_COLLATERAL', expect.any(String), 'SWAP_SESSION', expect.any(String),
    );
    expect(financialGateway.holdFunds).toHaveBeenNthCalledWith(
      2, USER_B, expect.any(String), 'BARTER_COLLATERAL', expect.any(String), 'SWAP_SESSION', expect.any(String),
    );

    // Audit log yazıldı mı?
    expect(mockAuditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'BARTER_OFFER_ACCEPTED' }),
    );
  });

  it('teminat oranı %20 olmalı (500 TL işlem → 100 TL teminat)', async () => {
    const calc = new CollateralCalculatorService();
    const collateral = calc.calculateCollateral(500);
    expect(collateral).toBe(100); // %20 = 100
  });

  it('SmartCap aşılırsa teklif reddedilmeli', async () => {
    const mockWatchtower = { checkBarterSmartCap: jest.fn().mockRejectedValue(new DomainException('Limit aşıldı')) };

    const connection = { startSession: jest.fn().mockResolvedValue(makeMockSession()) };
    const module = await Test.createTestingModule({
      providers: [
        AcceptTradeOfferHandler,
        CollateralCalculatorService,
        { provide: 'ITradeOfferRepository',   useValue: { findById: jest.fn().mockResolvedValue(mockOffer), save: jest.fn() } },
        { provide: 'ISwapSessionRepository',  useValue: {} },
        { provide: WatchtowerService,         useValue: mockWatchtower },
        { provide: getConnectionToken(),       useValue: connection },
        { provide: RabbitMQService,            useValue: { publish: jest.fn() } },
        { provide: FinancialGatewayService,    useValue: makeFinancialGateway() },
        { provide: AuditLogService,            useValue: { log: jest.fn() } },
      ],
    }).compile();

    const h = module.get(AcceptTradeOfferHandler);
    await expect(h.execute(new AcceptTradeOfferCommand(OFFER_ID, USER_B)))
      .rejects.toThrow(DomainException);
  });

  it('receiver holdFunds başarısız olursa initiator teminatı iade edilmeli', async () => {
    financialGateway.holdFunds
      .mockReset()
      .mockResolvedValueOnce({ holdId: 'hold-a' })
      .mockRejectedValueOnce(new Error('Bakiye yetersiz'));

    const connection = { startSession: jest.fn().mockResolvedValue(makeMockSession()) };
    const module = await Test.createTestingModule({
      providers: [
        AcceptTradeOfferHandler,
        CollateralCalculatorService,
        { provide: 'ITradeOfferRepository',   useValue: { findById: jest.fn().mockResolvedValue(mockOffer), save: jest.fn() } },
        { provide: 'ISwapSessionRepository',  useValue: {} },
        { provide: WatchtowerService,         useValue: { checkBarterSmartCap: jest.fn().mockResolvedValue(undefined) } },
        { provide: getConnectionToken(),       useValue: connection },
        { provide: RabbitMQService,            useValue: { publish: jest.fn() } },
        { provide: FinancialGatewayService,    useValue: financialGateway },
        { provide: AuditLogService,            useValue: { log: jest.fn() } },
      ],
    }).compile();

    const h = module.get(AcceptTradeOfferHandler);
    await expect(h.execute(new AcceptTradeOfferCommand(OFFER_ID, USER_B)))
      .rejects.toThrow(DomainException);

    // Telafi: initiator holdId iade edildi mi?
    expect(financialGateway.refundFunds).toHaveBeenCalledWith(
      'hold-a', expect.stringContaining('initiator-refund'),
    );
  });
});

// ─── Test 2: CollateralCalculatorService birim testleri ──────────────────────

describe('CollateralCalculatorService: %20 teminat kuralı', () => {
  let service: CollateralCalculatorService;

  beforeEach(() => { service = new CollateralCalculatorService(); });

  it('100 TL işlem → 20 TL teminat', () => {
    expect(service.calculateCollateral(100)).toBe(20);
  });

  it('1000 TL işlem → 200 TL teminat', () => {
    expect(service.calculateCollateral(1000)).toBe(200);
  });

  it('string giriş desteklenmeli', () => {
    expect(service.calculateCollateral('500')).toBe(100);
  });

  it('sıfır işlem tutarında sıfır teminat', () => {
    expect(service.calculateCollateral(0)).toBe(0);
  });
});

// ─── Test 3: State machine geçişleri ─────────────────────────────────────────

describe('SwapSession Domain: state machine geçişleri', () => {
  // swap-session.entity.ts'i doğrudan test ediyoruz
  // (Entity import'u test runner path'ine göre ayarlı)
  const { SwapSession } = jest.requireActual('../../domain/entities/swap-session.entity') as typeof import('../../domain/entities/swap-session.entity');

  it('PENDING_COLLATERAL → ACTIVE geçişi geçerli olmalı', () => {
    const session = SwapSession.create('offer-1', 'company-a', 'company-b', 100);
    session.activate();
    expect(session.getProps().status).toBe('ACTIVE');
  });

  it('ACTIVE olmadan SHIPPING geçişi reddedilmeli', () => {
    const session = SwapSession.create('offer-2', 'company-a', 'company-b', 100);
    // PENDING_COLLATERAL'dan doğrudan SHIPPING'e geçilemez
    expect(() => session.submitShipping('company-a')).toThrow();
  });
});
