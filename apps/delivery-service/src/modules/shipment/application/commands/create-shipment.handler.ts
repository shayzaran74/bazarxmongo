import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateShipmentCommand } from './create-shipment.command';
import { IShipmentRepository } from '../../domain/repositories/shipment.repository.interface';
import { Shipment } from '../../domain/entities/shipment.entity';
import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo';
import { Dimensions } from '../../domain/value-objects/dimensions.vo';
import { ShipmentNumberService } from '../services/shipment-number.service';
import { EstimatedDeliveryService } from '../services/estimated-delivery.service';
import { Result, Ok, Err } from '@barterborsa/shared-core';

@CommandHandler(CreateShipmentCommand)
export class CreateShipmentHandler implements ICommandHandler<CreateShipmentCommand, Result<string>> {
  constructor(
    @Inject('IShipmentRepository') private readonly shipmentRepository: IShipmentRepository,
    private readonly shipmentNumberService: ShipmentNumberService,
    private readonly estimatedDeliveryService: EstimatedDeliveryService,
  ) {}

  async execute(command: CreateShipmentCommand): Promise<Result<string>> {
    const { dto } = command;

    const senderAddress = ShippingAddress.create(dto.senderAddress);
    const receiverAddress = ShippingAddress.create(dto.receiverAddress);
    const packageInfo = dto.packageInfo ? Dimensions.create(dto.packageInfo) : undefined;
    
    const shipmentNumber = this.shipmentNumberService.generate();
    const estimatedDeliveryDate = this.estimatedDeliveryService.calculate(dto.senderAddress.city, dto.receiverAddress.city);

    const shipmentResult = Shipment.create({
      shipmentNumber,
      type: dto.type as any,
      orderId: dto.orderId,
      senderId: dto.senderId,
      receiverId: dto.receiverId,
      vendorId: dto.vendorId,
      senderAddress,
      receiverAddress,
      packageInfo,
      estimatedDeliveryDate,
      barterSessionId: dto.barterSessionId,
      barterPartNumber: dto.barterPartNumber,
    });

    if (!shipmentResult.success) {
      return Err(shipmentResult.error);
    }

    const shipment = shipmentResult.data;
    await this.shipmentRepository.save(shipment);

    return Ok(shipment.id);
  }
}
