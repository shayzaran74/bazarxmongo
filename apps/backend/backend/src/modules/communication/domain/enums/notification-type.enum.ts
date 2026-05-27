// apps/backend/src/modules/communication/domain/enums/notification-type.enum.ts

export enum NotificationType {
  // Genel platform
  ORDER_STATUS    = 'ORDER_STATUS',
  BARTER_OFFER   = 'BARTER_OFFER',
  AUCTION_BID    = 'AUCTION_BID',
  CAMPAIGN       = 'CAMPAIGN',
  SYSTEM         = 'SYSTEM',
  CHAT_MESSAGE   = 'CHAT_MESSAGE',

  // BazarX-GO Sprint 4
  MENU_EXPIRY_WARNING    = 'MENU_EXPIRY_WARNING',    // 43/44/45. gün QR sona eriyor uyarısı
  MENU_TRANSFER_RECEIVED = 'MENU_TRANSFER_RECEIVED', // Devredilen menü alındı
  RESERVATION_CONFIRMED  = 'RESERVATION_CONFIRMED',  // Rezervasyon onaylandı
  RESERVATION_CANCELLED  = 'RESERVATION_CANCELLED',  // Rezervasyon iptal edildi
  SURPRISE_MENU_NEARBY   = 'SURPRISE_MENU_NEARBY',   // 500m yakında sürpriz menü
  NEW_RESTAURANT_NEARBY  = 'NEW_RESTAURANT_NEARBY',  // Mahallede yeni restoran
}
