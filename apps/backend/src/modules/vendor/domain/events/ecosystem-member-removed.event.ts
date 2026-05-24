// apps/backend/src/modules/vendor/domain/events/ecosystem-member-removed.event.ts

import { DomainEvent } from '@barterborsa/shared-core';

export class EcosystemMemberRemovedEvent extends DomainEvent {
  constructor(
    public readonly memberVendorId: string,
    public readonly ecosystemId: string,
  ) {
    super(memberVendorId);
  }

  get eventName(): string {
    return 'ecosystem.member.removed';
  }
}