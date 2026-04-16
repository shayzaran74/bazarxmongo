// apps/backend/src/modules/communication/application/services/notification-template.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationTemplateService {
  getOrderCreatedTemplate(orderNumber: string, orderId: string) {
    return {
      title: 'Siparişiniz Oluşturuldu',
      message: `#${orderNumber} numaralı siparişiniz başarıyla oluşturuldu.`,
      link: `/orders/${orderId}`,
    };
  }

  getOrderShippedTemplate(orderNumber: string, orderId: string, trackingNumber: string) {
    return {
      title: 'Siparişiniz Kargoya Verildi',
      message: `#${orderNumber} numaralı siparişiniz kargoya verildi. Takip: ${trackingNumber}`,
      link: `/orders/${orderId}`,
    };
  }

  getTradeOfferTemplate(fromCompanyName: string) {
    return {
      title: 'Yeni Takas Teklifi',
      message: `${fromCompanyName} firmasından yeni bir takas teklifi aldınız.`,
      link: `/barter/offers`,
    };
  }

  getAuctionBidTemplate(listingTitle: string, amount: string) {
    return {
      title: 'Yeni Açık Artırma Teklifi',
      message: `"${listingTitle}" ilanına yeni teklif verildi: ${amount} TL`,
      link: `/auctions`,
    };
  }
}
