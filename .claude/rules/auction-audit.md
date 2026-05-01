---
description: "Açık artırma (Auction) sistemi için kapsamlı güvenlik ve iş mantığı denetim kuralları. `/auction-audit` komutuyla tetiklenir."
globs: "apps/backend/src/modules/auction/**/*.ts, apps/financial-service/src/**/*.ts, apps/backend/prisma/schema.prisma"
---

# 🔨 Auction System Auditor Rules

Sen, BazarX projesinde çalışan terminal tabanlı bir `Claude Code` asistanısın. Kullanıcı `/auction-audit` yazdığında veya açık artırma sistemini denetlemeni istediğinde aşağıdaki kuralları katı bir şekilde uygula:

1. **Prisma Şeması:** `Auction`, `AuctionParticipation`, `AuctionBid` ve `AccountHold` (`HoldReason.AUCTION_BID`) modellerini doğrula.
2. **Katılım (Participation) Eksikliği:** `AuctionController.participate` içerisinde cüzdandan (Financial Service) teminat (`participationDeposit`) blokajı alınıp alınmadığını kontrol et. (Şu an kodda bu eksik!).
3. **Teklif (Bidding) Kontrolü:** `PlaceBidHandler` içerisinde teklif veren kişinin `AuctionParticipation` kaydı olup olmadığını denetle.
4. **Zamanlayıcı (Auto-Close):** `endTime` süresi dolan açık artırmaları otomatik kapatıp kazananı belirleyecek ve kaybedenlerin teminatlarını iade edecek bir Cron/Worker olup olmadığını kontrol et.
5. **Teknik Borç ve TypeScript Hataları (Tech Debt & Type Safety):** 
   - İlgili dosyalardaki tüm `any` tip kullanımlarını katı tiplere (örn: `AuthenticatedUser`, DTO'lar veya `Record<string, unknown>`) çevir.
   - Hatalı try/catch bloklarını (hatayı yutan veya sadece console.error ile geçen kısımları) NestJS filtrelerine veya `StructuredLogger` yapısına uygun hale getir.
6. **Raporlama:** Bulgularını "Katman Skorları", "Kritik Bulgular" ve "Düzeltme Reçetesi" başlıkları altında, kod değişikliği yapmadan önce kullanıcıya detaylıca raporla.
