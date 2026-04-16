// apps/backend/test/commerce/checkout.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from '../../src/modules/commerce/application/services/checkout.service';
import { PricingService } from '../../src/modules/commerce/application/services/pricing.service';
import { FinancialGatewayService } from '../../src/modules/financial-gateway/financial-gateway.service';
import { PrismaService } from '@barterborsa/shared-persistence';
import { ShippingAddress } from '../../src/modules/commerce/domain/value-objects/shipping-address.vo';
import { Prisma } from '@prisma/client';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let cartRepo: any;
  let orderRepo: any;
  let listingRepo: any;
  let financialGateway: any;
  let prisma: any;

  beforeEach(async () => {
    cartRepo = { findByUserId: jest.fn() };
    orderRepo = { save: jest.fn() };
    listingRepo = { findById: jest.fn() };
    financialGateway = { holdFunds: jest.fn() };
    prisma = { $transaction: jest.fn((cb) => cb(prisma)), cartItem: { deleteMany: jest.fn() }, order: { create: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        PricingService,
        { provide: 'ICartRepository', useValue: cartRepo },
        { provide: 'IOrderRepository', useValue: orderRepo },
        { provide: 'IListingRepository', useValue: listingRepo },
        { provide: FinancialGatewayService, useValue: financialGateway },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  const mockAddress = ShippingAddress.create({
    firstName: 'John',
    lastName: 'Doe',
    phone: '5550000',
    addressLine1: 'Adres',
    city: 'Ist',
    district: 'Kad',
    postalCode: '34'
  });

  it('should throw error if cart is empty', async () => {
    cartRepo.findByUserId.mockResolvedValue(null);
    await expect(service.checkout('user-1', mockAddress, mockAddress, 'WALLET'))
      .rejects.toThrow('Cart is empty');
  });

  it('should successfully checkout and create orders grouped by vendor', async () => {
    const mockCart = {
      items: [
        { id: 'item-1', getProps: () => ({ listingId: 'listing-1', quantity: 1 }) },
        { id: 'item-2', getProps: () => ({ listingId: 'listing-2', quantity: 2 }) }
      ]
    };
    
    const mockListing1 = { 
       id: 'listing-1',
       getProps: () => ({ vendorId: 'vendor-A', price: { amount: new Prisma.Decimal(100) }, title: 'P1' }),
       reserveStock: jest.fn().mockReturnValue(true)
    };
    const mockListing2 = { 
       id: 'listing-2',
       getProps: () => ({ vendorId: 'vendor-B', price: { amount: new Prisma.Decimal(50) }, title: 'P2' }),
       reserveStock: jest.fn().mockReturnValue(true)
    };

    cartRepo.findByUserId.mockResolvedValue(mockCart);
    listingRepo.findById.mockImplementation((id: string) => {
      if (id === 'listing-1') return Promise.resolve(mockListing1);
      if (id === 'listing-2') return Promise.resolve(mockListing2);
      return Promise.resolve(null);
    });

    financialGateway.holdFunds.mockResolvedValue({ success: true, holdId: 'hold-1' });

    const results = await service.checkout('user-1', mockAddress, mockAddress, 'WALLET');

    expect(results).toHaveLength(2); // Two different vendors
    expect(financialGateway.holdFunds).toHaveBeenCalledTimes(2);
    expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
  });
});
