import { Shipment } from '../../../domain/entities/shipment.entity';
import { ShipmentDocument } from '../schemas/shipment.schema';
import { ShippingAddress } from '../../../domain/value-objects/shipping-address.vo';
import { CarrierInfo } from '../../../domain/value-objects/carrier-info.vo';
import { Dimensions } from '../../../domain/value-objects/dimensions.vo';

export class ShipmentMapper {
  public static toDomain(doc: ShipmentDocument): Shipment {
    const shipmentResult = Shipment.create({
      shipmentNumber: doc.shipmentNumber,
      type: doc.type as any,
      orderId: doc.orderId,
      senderId: doc.senderId,
      receiverId: doc.receiverId,
      vendorId: doc.vendorId,
      senderAddress: ShippingAddress.create(doc.senderAddress),
      receiverAddress: ShippingAddress.create(doc.receiverAddress),
      packageInfo: doc.packageInfo ? Dimensions.create(doc.packageInfo) : undefined,
      carrierInfo: doc.carrierCode ? CarrierInfo.create({
        carrierCode: doc.carrierCode as any,
        carrierName: doc.carrierName!,
        trackingNumber: doc.carrierTrackingNumber!,
        trackingUrl: doc.carrierTrackingUrl,
      }) : undefined,
      estimatedDeliveryDate: doc.estimatedDeliveryDate,
      actualDeliveryDate: doc.actualDeliveryDate,
      shippingCost: doc.shippingCost,
      currency: doc.currency,
      notes: doc.notes,
      barterSessionId: doc.barterSessionId,
      barterPartNumber: doc.barterPartNumber,
      pickedUpAt: doc.pickedUpAt,
      deliveredAt: doc.deliveredAt,
      cancelledAt: doc.cancelledAt,
    }, doc._id.toString());

    if (!shipmentResult.success) {
      throw new Error(`Kargo domain nesnesi oluşturulamadı: ${shipmentResult.error.message}`);
    }

    return shipmentResult.data;
  }

  public static toPersistence(domain: Shipment): any {
    return {
      shipmentNumber: domain.shipmentNumber,
      type: domain.type,
      status: domain.status,
      orderId: domain.orderId,
      senderId: (domain as any).props.senderId,
      receiverId: (domain as any).props.receiverId,
      vendorId: (domain as any).props.vendorId,
      senderAddress: (domain as any).props.senderAddress.props,
      receiverAddress: (domain as any).props.receiverAddress.props,
      packageInfo: (domain as any).props.packageInfo?.props,
      carrierCode: (domain as any).props.carrierInfo?.carrierCode,
      carrierName: (domain as any).props.carrierInfo?.carrierName,
      carrierTrackingNumber: (domain as any).props.carrierInfo?.trackingNumber,
      carrierTrackingUrl: (domain as any).props.carrierInfo?.trackingUrl,
      estimatedDeliveryDate: (domain as any).props.estimatedDeliveryDate,
      actualDeliveryDate: (domain as any).props.actualDeliveryDate,
      shippingCost: (domain as any).props.shippingCost,
      currency: (domain as any).props.currency,
      notes: (domain as any).props.notes,
      barterSessionId: (domain as any).props.barterSessionId,
      barterPartNumber: (domain as any).props.barterPartNumber,
      pickedUpAt: (domain as any).props.pickedUpAt,
      deliveredAt: (domain as any).props.deliveredAt,
      cancelledAt: (domain as any).props.cancelledAt,
    };
  }
}
