// apps/backend/test/barter/trade-state-machine.spec.ts

import { TradeStateMachineService } from '../../src/modules/barter/domain/services/trade-state-machine.service';
import { TradeOfferStatus } from '../../src/modules/barter/domain/enums/trade-offer-status.enum';

describe('TradeStateMachineService', () => {
  let service: TradeStateMachineService;

  beforeEach(() => {
    service = new TradeStateMachineService();
  });

  it('should allow valid transition from PENDING to ACCEPTED', () => {
    expect(() => 
      service.validateTransition(TradeOfferStatus.PENDING, TradeOfferStatus.ACCEPTED)
    ).not.toThrow();
  });

  it('should allow valid transition from ACCEPTED to LEGAL_PENDING', () => {
    expect(() => 
      service.validateTransition(TradeOfferStatus.ACCEPTED, TradeOfferStatus.LEGAL_PENDING)
    ).not.toThrow();
  });

  it('should throw error for invalid transition from REJECTED back to PENDING', () => {
    expect(() => 
      service.validateTransition(TradeOfferStatus.REJECTED, TradeOfferStatus.PENDING)
    ).toThrow('Invalid trade offer transition from REJECTED to PENDING');
  });

  it('should throw error for invalid transition from COMPLETED to CANCELLED', () => {
    expect(() => 
      service.validateTransition(TradeOfferStatus.COMPLETED, TradeOfferStatus.CANCELLED)
    ).toThrow();
  });
});
