import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateShipmentStatusCommand } from './update-shipment-status.command';
import { IShipmentRepository } from '../../domain/repositories/shipment.repository.interface';
import { Shipment } from '../../domain/entities/shipment.entity';
import { CarrierInfo } from '../../domain/value-objects/carrier-info.vo';
import { ShipmentStatus } from '../../domain/enums/shipment-status.enum';
import { CarrierCode } from '../../domain/enums/carrier-code.enum';
import { Result, Ok, Err } from '@barterborsa/shared-core';

@CommandHandler(UpdateShipmentStatusCommand)
export class UpdateShipmentStatusHandler implements ICommandHandler<UpdateShipmentStatusCommand, Result<Shipment>> {
  constructor(
    @Inject('IShipmentRepository') private readonly shipmentRepository: IShipmentRepository,
  ) {}

  async execute(command: UpdateShipmentStatusCommand): Promise<Result<Shipment>> {
    const { shipmentId, status, trackingNumber, carrierCode, notes } = command;

    const shipment = await this.shipmentRepository.findById(shipmentId);
    if (!shipment) {
      return Err(new NotFoundException('Kargo bulunamadı.'));
    }

    // Eğer kurye/kargo firması atanıyorsa
    if (carrierCode && trackingNumber) {
      const carrierInfo = CarrierInfo.create({
        carrierCode: carrierCode as CarrierCode,
        carrierName: carrierCode,
        trackingNumber: trackingNumber,
        trackingUrl: '',
      });
      shipment.assignCarrier(carrierInfo);
    }

    const targetStatus = status.toUpperCase() as ShipmentStatus;

    switch (targetStatus) {
      case ShipmentStatus.PICKED_UP:
        shipment.pickUp();
        break;
      case ShipmentStatus.IN_TRANSIT:
        shipment.setInTransit();
        break;
      case ShipmentStatus.DELIVERED:
        shipment.deliver();
        break;
      case ShipmentStatus.FAILED:
        shipment.fail(notes || '');
        break;
      case ShipmentStatus.CANCELLED:
        shipment.cancel(notes || '');
        break;
      default:
        shipment.updateStatusDirect(targetStatus, notes);
        break;
    }

    await this.shipmentRepository.save(shipment);
    return Ok(shipment);
  }
}
