// apps/delivery-service/src/modules/shipment/application/commands/create-barter-shipments.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateBarterShipmentsCommand } from './create-barter-shipments.command';
import { IShipmentRepository } from '../../domain/repositories/shipment.repository.interface';
import { Shipment } from '../../domain/entities/shipment.entity';
import { ShipmentType } from '../../domain/enums/shipment-type.enum';
import { ShipmentNumberService } from '../services/shipment-number.service';

@CommandHandler(CreateBarterShipmentsCommand)
export class CreateBarterShipmentsHandler implements ICommandHandler<CreateBarterShipmentsCommand> {
  private readonly logger = new Logger(CreateBarterShipmentsHandler.name);

  constructor(
    @Inject('IShipmentRepository') private readonly repository: IShipmentRepository,
    private readonly shipmentNumberService: ShipmentNumberService,
  ) {}

  async execute(command: CreateBarterShipmentsCommand) {
    const { props } = command;
    this.logger.log(`Creating dual shipments for Barter Session: ${props.sessionId}`);

    const number1 = this.shipmentNumberService.generate();
    const number2 = this.shipmentNumberService.generate();

    // Shipment 1: Initiator to Receiver
    const shipment1Result = Shipment.create({
      shipmentNumber: number1,
      type: ShipmentType.BARTER,
      orderId: props.offerId,
      barterSessionId: props.sessionId,
      barterPartNumber: 1,
      senderId: props.initiatorId,
      receiverId: props.receiverId,
      vendorId: props.initiatorId,
      senderAddress: props.initiatorAddress,
      receiverAddress: props.receiverAddress,
    });

    // Shipment 2: Receiver to Initiator
    const shipment2Result = Shipment.create({
      shipmentNumber: number2,
      type: ShipmentType.BARTER,
      orderId: props.offerId,
      barterSessionId: props.sessionId,
      barterPartNumber: 2,
      senderId: props.receiverId,
      receiverId: props.initiatorId,
      vendorId: props.receiverId,
      senderAddress: props.receiverAddress,
      receiverAddress: props.initiatorAddress,
    });

    if (shipment1Result.success && shipment2Result.success) {
      await this.repository.save(shipment1Result.data);
      await this.repository.save(shipment2Result.data);

      return { 
        success: true, 
        shipmentIds: [shipment1Result.data.id, shipment2Result.data.id] 
      };
    }
    
    throw new Error('Failed to create barter shipments');
  }
}
