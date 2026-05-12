// apps/backend/src/modules/delivery/domain/enums/dispatch-status.enum.ts

export enum DispatchStatus {
  PENDING_ASSIGN = 'PENDING_ASSIGN',  // Sipariş hazır, kurye bekliyor
  ASSIGNED       = 'ASSIGNED',         // Kurye atandı
  PICKED_UP      = 'PICKED_UP',       // Kurye siparişi aldı
  DELIVERED      = 'DELIVERED',       // Teslim edildi
  CANCELLED      = 'CANCELLED',        // İptal edildi
}