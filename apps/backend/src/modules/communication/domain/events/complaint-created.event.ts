// apps/backend/src/modules/communication/domain/events/complaint-created.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class ComplaintCreatedEvent extends DomainEvent {
  public readonly eventName = 'complaint.created';

  constructor(
    public readonly complaintId: string,
    public readonly reporterId: string,
    public readonly subjectId: string
  ) {
    super(subjectId);
  }
}
