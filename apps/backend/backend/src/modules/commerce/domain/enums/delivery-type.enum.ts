// apps/backend/src/modules/commerce/domain/enums/delivery-type.enum.ts
// BazarX Go — Sipariş teslim türü

export enum DeliveryType {
  CARGO         = 'CARGO',          // Klasik kargo (COMMERCE)
  LOCAL_COURIER = 'LOCAL_COURIER',  // BazarX Go kurye (RESTAURANT)
  PICKUP        = 'PICKUP',         // Müşteri gelip alır
}
