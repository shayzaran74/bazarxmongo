import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { CircuitBreakerService } from '../../../common/resilience/circuit-breaker.service';

export interface ShipmentResponse {
  id: string;
  shipment_number: string;
  type: string;
  status: string;
  order_id: string;
  carrier_code: string;
  carrier_tracking_number: string;
  carrier_tracking_url: string;
  estimated_delivery_date: string;
  actual_delivery_date: string;
}

export interface ShipmentListResponse {
  shipments: ShipmentResponse[];
}

interface DeliveryService {
  getShipment(data: { shipment_id: string }): Observable<ShipmentResponse>;
  getShipmentByOrder(data: { order_id: string }): Observable<ShipmentListResponse>;
  getShipmentByTracking(data: { tracking_number: string }): Observable<ShipmentResponse>;
  updateShipmentStatus(data: {
    shipment_id: string;
    status: string;
    tracking_number?: string;
    carrier_code?: string;
    notes?: string;
  }): Observable<ShipmentResponse>;
}

@Injectable()
export class DeliveryGrpcService implements OnModuleInit {
  private deliveryService!: DeliveryService;

  constructor(
    @Inject('DELIVERY_PACKAGE') private client: ClientGrpc,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  onModuleInit() {
    this.deliveryService = this.client.getService<DeliveryService>('DeliveryService');
  }

  async getShipment(shipmentId: string): Promise<ShipmentResponse> {
    return this.circuitBreaker.execute(
      'delivery.getShipment',
      async () => firstValueFrom(this.deliveryService.getShipment({ shipment_id: shipmentId })),
    );
  }

  async getShipmentByOrder(orderId: string): Promise<ShipmentListResponse> {
    return this.circuitBreaker.execute(
      'delivery.getShipmentByOrder',
      async () => firstValueFrom(this.deliveryService.getShipmentByOrder({ order_id: orderId })),
    );
  }

  async getShipmentByTracking(trackingNumber: string): Promise<ShipmentResponse> {
    return this.circuitBreaker.execute(
      'delivery.getShipmentByTracking',
      async () => firstValueFrom(this.deliveryService.getShipmentByTracking({ tracking_number: trackingNumber })),
    );
  }

  async updateShipmentStatus(
    shipmentId: string,
    status: string,
    trackingNumber?: string,
    carrierCode?: string,
    notes?: string,
  ): Promise<ShipmentResponse> {
    return this.circuitBreaker.execute(
      'delivery.updateShipmentStatus',
      async () => firstValueFrom(
        this.deliveryService.updateShipmentStatus({
          shipment_id: shipmentId,
          status,
          tracking_number: trackingNumber,
          carrier_code: carrierCode,
          notes,
        })
      )
    );
  }
}
