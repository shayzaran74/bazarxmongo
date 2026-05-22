import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { IShipmentRepository } from '../domain/repositories/shipment.repository.interface';
import { UpdateShipmentStatusCommand } from '../application/commands/update-shipment-status.command';
import { Shipment } from '../domain/entities/shipment.entity';

interface GetShipmentRequest {
  shipment_id: string;
}

interface GetShipmentByOrderRequest {
  order_id: string;
}

interface GetShipmentByTrackingRequest {
  tracking_number: string;
}

interface UpdateStatusRequest {
  shipment_id: string;
  status: string;
  tracking_number?: string;
  carrier_code?: string;
  notes?: string;
}

function mapShipmentToGrpcResponse(shipment: Shipment) {
  const props = (shipment as any).props || {};
  return {
    id: shipment.id || '',
    shipment_number: shipment.shipmentNumber || '',
    type: shipment.type || '',
    status: shipment.status || '',
    order_id: shipment.orderId || '',
    carrier_code: props.carrierInfo?.carrierCode || '',
    carrier_tracking_number: props.carrierInfo?.trackingNumber || '',
    carrier_tracking_url: props.carrierInfo?.trackingUrl || '',
    estimated_delivery_date: props.estimatedDeliveryDate ? props.estimatedDeliveryDate.toISOString() : '',
    actual_delivery_date: props.actualDeliveryDate ? props.actualDeliveryDate.toISOString() : '',
  };
}

@Controller()
export class DeliveryGrpcController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IShipmentRepository') private readonly shipmentRepository: IShipmentRepository,
  ) {}

  @GrpcMethod('DeliveryService', 'GetShipment')
  async getShipment(data: GetShipmentRequest) {
    const shipment = await this.shipmentRepository.findById(data.shipment_id);
    if (!shipment) {
      throw new Error('Kargo bulunamadı.');
    }
    return mapShipmentToGrpcResponse(shipment);
  }

  @GrpcMethod('DeliveryService', 'GetShipmentByOrder')
  async getShipmentByOrder(data: GetShipmentByOrderRequest) {
    const shipments = await this.shipmentRepository.findByOrderId(data.order_id);
    return {
      shipments: shipments.map(mapShipmentToGrpcResponse),
    };
  }

  @GrpcMethod('DeliveryService', 'GetShipmentByTracking')
  async getShipmentByTracking(data: GetShipmentByTrackingRequest) {
    const shipment = await this.shipmentRepository.findByShipmentNumber(data.tracking_number);
    if (!shipment) {
      throw new Error('Kargo bulunamadı.');
    }
    return mapShipmentToGrpcResponse(shipment);
  }

  @GrpcMethod('DeliveryService', 'UpdateShipmentStatus')
  async updateShipmentStatus(data: UpdateStatusRequest) {
    const result = await this.commandBus.execute(
      new UpdateShipmentStatusCommand(
        data.shipment_id,
        data.status,
        data.tracking_number,
        data.carrier_code,
        data.notes,
      ),
    );

    if (!result.success) {
      throw new Error(result.error?.message || 'Kargo durumu güncellenemedi.');
    }

    return mapShipmentToGrpcResponse(result.data);
  }
}
