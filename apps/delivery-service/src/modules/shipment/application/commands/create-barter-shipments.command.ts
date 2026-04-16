// apps/delivery-service/src/modules/shipment/application/commands/create-barter-shipments.command.ts

import { Command } from '@barterborsa/shared-core';

export interface CreateBarterShipmentsProps {
  sessionId: string;
  offerId: string;
  initiatorId: string;
  receiverId: string;
  initiatorAddress: any;
  receiverAddress: any;
}

export class CreateBarterShipmentsCommand extends Command {
  constructor(public readonly props: CreateBarterShipmentsProps) {
    super();
  }
}
