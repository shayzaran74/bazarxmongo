// apps/financial-service/test/escrow-lifecycle.spec.ts
// Escrow yaşam döngüsü integration testleri: create → release → refund

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { CommandBus } from '@nestjs/cqrs';
import { Decimal } from 'decimal.js';
import { Types } from 'mongoose';

import { CreateEscrowHandler } from '../src/modules/escrow/application/commands/create-escrow.handler';
import { ReleaseEscrowHandler } from '../src/modules/escrow/application/commands/release-escrow.handler';
import { RefundEscrowHandler } from '../src/modules/escrow/application/commands/refund-escrow.handler';
import { CreateEscrowCommand } from '../src/modules/escrow/application/commands/create-escrow.command';
import { ReleaseEscrowCommand } from '../src/modules/escrow/application/commands/release-escrow.command';
import { RefundEscrowCommand } from '../src/modules/escrow/application/commands/refund-escrow.command';
import { CommissionCalculatorService } from '../src/modules/commission/domain/services/commission-calculator.service';

// ─── Mock fabrikası ──────────────────────────────────────────────────────────
const d128 = (v: number) => Types.Decimal128.fromString(v.toFixed(2));

const makeMockSession = () => {
  const session = {
    withTransaction: jest.fn().mockImplementation(async (cb: () => Promise<void>) => cb()),
    endSession: jest.fn().mockResolvedValue(undefined),
  };
  return session;
};

const makeWalletModel = (initialBalance = 1000) => ({
  findOne: jest.fn().mockResolvedValue({
    _id: 'wallet-1',
    userId: 'buyer-1',
    balanceTL: d128(initialBalance),
  }),
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
});

const makeAccountModel = (initialBalance = 1000) => ({
  findOne: jest.fn().mockResolvedValue({
    _id: 'acc-1',
    id: 'acc-1',
    userId: 'buyer-1',
    type: 'MAIN',
    balance: d128(initialBalance),
    availableBalance: d128(initialBalance),
    blockedBalance: d128(0),
    vendorTier: 'CORE',
  }),
  findOneAndUpdate: jest.fn().mockResolvedValue({ _id: 'acc-1' }),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  insertMany: jest.fn().mockResolvedValue([]),
});

const makeTxModel = () => ({ create: jest.fn().mockResolvedValue([{}]) });
const makeLedgerModel = () => ({ create: jest.fn().mockResolvedValue([{}]), findOne: jest.fn().mockResolvedValue(null) });

const makeEscrowModel = (status = 'HELD') => ({
  findOne: jest.fn().mockResolvedValue(null),        // mükerrer kontrolü → null (yeni)
  create:  jest.fn().mockResolvedValue([{}]),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  _status: status,
});

// ─── Test süitleri ───────────────────────────────────────────────────────────

describe('Escrow: create → release zinciri', () => {
  let createHandler: CreateEscrowHandler;
  let releaseHandler: ReleaseEscrowHandler;
  let walletModel: ReturnType<typeof makeWalletModel>;
  let accountModel: ReturnType<typeof makeAccountModel>;
  let escrowModel: ReturnType<typeof makeEscrowModel>;
  let txModel: ReturnType<typeof makeTxModel>;
  let ledgerModel: ReturnType<typeof makeLedgerModel>;
  let mockSession: ReturnType<typeof makeMockSession>;

  beforeEach(async () => {
    walletModel  = makeWalletModel(1000);
    accountModel = makeAccountModel(1000);
    escrowModel  = makeEscrowModel();
    txModel      = makeTxModel();
    ledgerModel  = makeLedgerModel();
    mockSession  = makeMockSession();

    const mockConnection = { startSession: jest.fn().mockResolvedValue(mockSession) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEscrowHandler,
        ReleaseEscrowHandler,
        CommissionCalculatorService,
        { provide: getModelToken('Escrow'), useValue: escrowModel },
        { provide: getModelToken('Wallet'), useValue: walletModel },
        { provide: getModelToken('Account'), useValue: accountModel },
        { provide: getModelToken('AccountTransaction'), useValue: txModel },
        { provide: getModelToken('GeneralLedger'), useValue: ledgerModel },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    createHandler  = module.get(CreateEscrowHandler);
    releaseHandler = module.get(ReleaseEscrowHandler);
  });

  it('escrow oluşturulduğunda cüzdan bakiyesi düşülmeli ve ledger DEBIT kaydı yazılmalı', async () => {
    const cmd = new CreateEscrowCommand('order-1', 'buyer-1', 'seller-1', new Decimal(200));
    const escrow = await createHandler.execute(cmd);

    // Cüzdan düşüldü mü?
    expect(walletModel.updateOne).toHaveBeenCalledWith(
      { userId: 'buyer-1' },
      expect.objectContaining({ $inc: expect.any(Object) }),
      expect.any(Object),
    );
    // Ledger kaydı yazıldı mı?
    expect(ledgerModel.create).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ type: 'DEBIT', debitAccountId: 'buyer-1' })]),
      expect.any(Object),
    );
    // Escrow HELD olarak oluşturuldu mu?
    expect(escrowModel.create).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ status: 'HELD', orderId: 'order-1' })]),
      expect.any(Object),
    );
  });

  it('yetersiz bakiyede escrow oluşturma reddedilmeli', async () => {
    // Bakiyeyi düşük ayarla
    walletModel.findOne.mockResolvedValue({
      _id: 'wallet-1', userId: 'buyer-1', balanceTL: d128(50),
    });

    const cmd = new CreateEscrowCommand('order-2', 'buyer-1', 'seller-1', new Decimal(200));
    await expect(createHandler.execute(cmd)).rejects.toThrow('Yetersiz bakiye');
  });

  it('mükerrer orderId için escrow tekrar oluşturulmamalı (idempotency)', async () => {
    // İlk çağrı için mevcut escrow döndür
    escrowModel.findOne.mockResolvedValue({
      id: 'existing-escrow', orderId: 'order-dup', buyerId: 'buyer-1', sellerId: 'seller-1',
      amount: d128(200), releasedAmount: d128(0), status: 'HELD',
      createdAt: new Date(), updatedAt: new Date(), releasedAt: null, payoutLog: null,
    });

    const cmd = new CreateEscrowCommand('order-dup', 'buyer-1', 'seller-1', new Decimal(200));
    const result = await createHandler.execute(cmd);

    expect(escrowModel.create).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it('escrow serbest bırakıldığında satıcıya komisyon kesilerek ödeme yapılmalı', async () => {
    // Mevcut HELD escrow'u simüle et
    escrowModel.findOne.mockResolvedValue({
      id: 'esc-1', orderId: 'order-1', buyerId: 'buyer-1', sellerId: 'seller-1',
      amount: d128(1000), releasedAmount: d128(0), status: 'HELD',
      createdAt: new Date(), updatedAt: new Date(), releasedAt: null, payoutLog: null,
    });

    const cmd = new ReleaseEscrowCommand('order-1');
    await releaseHandler.execute(cmd);

    // Satıcı cüzdan kredisi yapıldı mı? (1000 - %12 komisyon = 880 TL)
    expect(walletModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'seller-1' },
      expect.objectContaining({ $inc: expect.any(Object) }),
      expect.any(Object),
    );
    // Platform komisyon cüzdanı güncellendi mi?
    expect(walletModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'SYSTEM_PLATFORM_ACCOUNT' },
      expect.any(Object),
      expect.any(Object),
    );
    // Escrow RELEASED'e güncellendi mi?
    expect(escrowModel.updateOne).toHaveBeenCalledWith(
      { orderId: 'order-1' },
      expect.objectContaining({ $set: expect.objectContaining({ status: 'RELEASED' }) }),
      expect.any(Object),
    );
  });
});

describe('Escrow: refund zinciri', () => {
  let refundHandler: RefundEscrowHandler;
  let walletModel: ReturnType<typeof makeWalletModel>;
  let accountModel: ReturnType<typeof makeAccountModel>;
  let escrowModel: ReturnType<typeof makeEscrowModel>;
  let txModel: ReturnType<typeof makeTxModel>;
  let ledgerModel: ReturnType<typeof makeLedgerModel>;

  beforeEach(async () => {
    walletModel  = makeWalletModel(800);
    accountModel = makeAccountModel(800);
    txModel      = makeTxModel();
    ledgerModel  = makeLedgerModel();
    escrowModel  = makeEscrowModel();

    escrowModel.findOne.mockResolvedValue({
      id: 'esc-2', orderId: 'order-refund', buyerId: 'buyer-1', sellerId: 'seller-1',
      amount: d128(200), releasedAmount: d128(0), status: 'HELD',
      createdAt: new Date(), updatedAt: new Date(), releasedAt: null, payoutLog: null,
    });

    const mockSession = makeMockSession();
    const mockConnection = { startSession: jest.fn().mockResolvedValue(mockSession) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefundEscrowHandler,
        { provide: getModelToken('Escrow'), useValue: escrowModel },
        { provide: getModelToken('Wallet'), useValue: walletModel },
        { provide: getModelToken('Account'), useValue: accountModel },
        { provide: getModelToken('AccountTransaction'), useValue: txModel },
        { provide: getModelToken('GeneralLedger'), useValue: ledgerModel },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    refundHandler = module.get(RefundEscrowHandler);
  });

  it('escrow iade edildiğinde alıcıya tam tutar geri yüklenmeli', async () => {
    const cmd = new RefundEscrowCommand('order-refund');
    await refundHandler.execute(cmd);

    // Alıcı cüzdanına geri yükleme yapıldı mı?
    expect(walletModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'buyer-1' },
      expect.objectContaining({ $inc: expect.any(Object) }),
      expect.any(Object),
    );
    // Escrow REFUNDED olarak güncellendi mi?
    expect(escrowModel.updateOne).toHaveBeenCalledWith(
      { orderId: 'order-refund' },
      expect.objectContaining({ $set: expect.objectContaining({ status: 'REFUNDED' }) }),
      expect.any(Object),
    );
  });
});
