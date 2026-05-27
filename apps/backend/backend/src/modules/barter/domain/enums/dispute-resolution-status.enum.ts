// apps/backend/src/modules/barter/domain/enums/dispute-resolution-status.enum.ts
// Master Plan v4.3 §3.4 — Uyuşmazlık çözüm state machine
//
// Akış:
//   OPEN  →  AUTO_REVIEW  →  RESOLVED            (basit durumlar, otomatik karar)
//                       \→  MANUAL_REVIEW  →  RESOLVED        (admin karar verdi)
//                                          \→  ARBITRATION  →  RESOLVED   (hakem kurulu)
//                                          \→  CANCELLED                  (her aşamada iptal)

export enum DisputeResolutionStatus {
  OPEN           = 'OPEN',            // Yeni açıldı, taraflara delil sunma penceresi (~24h)
  AUTO_REVIEW    = 'AUTO_REVIEW',     // Delil penceresi kapandı, otomatik karar bekliyor
  MANUAL_REVIEW  = 'MANUAL_REVIEW',   // Sistem karar veremedi, admin incelemesi
  ARBITRATION    = 'ARBITRATION',     // Admin de karar veremedi, hakem kurulu
  RESOLVED       = 'RESOLVED',        // Bağlayıcı karar verildi
  CANCELLED      = 'CANCELLED',       // İtiraz geri çekildi/geçersiz
}

// Master Plan v4.3 §3.4 — Süre eşikleri (saat cinsinden)
export const DISPUTE_TIMINGS = {
  // İtiraz açma penceresi (trade completion sonrası)
  DISPUTE_WINDOW_HOURS: 72,
  // OPEN → AUTO_REVIEW geçişi (taraflara delil sunma süresi)
  RESPONSE_WINDOW_HOURS: 24,
  // MANUAL_REVIEW → ARBITRATION otomatik eskalasyon (admin hareketsiz kalırsa)
  MANUAL_REVIEW_HOURS: 48,
  // ARBITRATION → RESOLVED zorunlu deadline
  ARBITRATION_HOURS: 72,
} as const;
