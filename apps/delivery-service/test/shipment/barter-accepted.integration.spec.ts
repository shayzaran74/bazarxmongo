// apps/delivery-service/test/shipment/barter-accepted.integration.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { BarterAcceptedHandler } from '../../src/modules/shipment/application/event-handlers/barter-accepted.handler';
import { CreateBarterShipmentsHandler } from '../../src/modules/shipment/application/commands/create-barter-shipments.handler';
import { CreateBarterShipmentsCommand } from '../../src/modules/shipment/application/commands/create-barter-shipments.command';
import { ShipmentNumberService } from '../../src/modules/shipment/application/services/shipment-number.service';
import { IShipmentRepository } from '../../src/modules/shipment/domain/repositories/shipment.repository.interface';

describe('BarterAccepted Integration', () => {
  let handler: BarterAcceptedHandler;
  let shipmentRepo: any;
  let commandBus: CommandBus;

  beforeEach(async () => {
    shipmentRepo = {
      save: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        BarterAcceptedHandler,
        CreateBarterShipmentsHandler,
        ShipmentNumberService,
        {
          provide: 'IShipmentRepository',
          useValue: shipmentRepo,
        },
      ],
    }).compile();

    handler = module.get<BarterAcceptedHandler>(BarterAcceptedHandler);
    commandBus = module.get<CommandBus>(CommandBus);
    
    await module.init(); // Auto-discovery of handlers
  });

  it('should trigger dual shipment creation when barter accepted event is received', async () => {
    const mockEvent = {
      sessionId: 'session-123',
      offerId: 'offer-456',
      initiatorId: 'comp-A',
      receiverId: 'comp-B',
      fromAddress: { city: 'Istanbul' },
      toAddress: { city: 'Ankara' },
    };

    await handler.handle(mockEvent);

    expect(shipmentRepo.save).toHaveBeenCalledTimes(2);
  });
});
