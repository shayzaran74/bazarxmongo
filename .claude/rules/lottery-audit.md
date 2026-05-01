---
description: "Çekiliş (Lottery) sistemi için kapsamlı güvenlik ve iş mantığı denetim kuralları. `/lottery-audit` komutuyla tetiklenir."
globs: "apps/backend/src/modules/auction/**/*.ts, apps/financial-service/src/**/*.ts, apps/backend/prisma/schema.prisma"
---

# 🎟️ Lottery System Auditor Rules

Sen, BazarX projesinde çalışan terminal tabanlı bir `Claude Code` asistanısın. Kullanıcı `/lottery-audit` yazdığında veya çekiliş sistemini denetlemeni istediğinde aşağıdaki kuralları katı bir şekilde uygula:

1. **Prisma Şeması:** `Lottery` ve `LotteryTicket` modellerini incele. Bilet numaralarının kopyalanmasını engelleyen indeksleri kontrol et.
2. **Bilet Satın Alma Açığı:** `LotteryController.participate` metodunun sadece bir placeholder olup olmadığını kontrol et. Bilet satarken cüzdandan `ticketPrice` miktarının düşülmesi GERÇEKTEN yapılıyor mu diye bak.
3. **Kayıp Kazanan Açığı:** `DrawLotteryHandler` ve `lottery.entity.ts` içindeki kura (draw) işleminin sadece bir numara çekmekle kalmayıp, o bilete sahip kullanıcıyı bulup `winnerId` olarak atayıp atamadığını kontrol et. (Mevcut sistemde bu atama eksik!).
4. **Otomatik Çekiliş:** Çekilişi süresi dolduğunda veya biletler tükendiğinde otomatik yapacak bir Cron/Worker arayışına gir.
5. **Teknik Borç ve TypeScript Hataları (Tech Debt & Type Safety):** 
   - İlgili dosyalardaki tüm `any` tip kullanımlarını katı tiplere (örn: `AuthenticatedUser`, DTO'lar veya `Record<string, unknown>`) çevir.
   - Hatalı try/catch bloklarını (hatayı yutan veya sadece console.error ile geçen kısımları) NestJS filtrelerine veya `StructuredLogger` yapısına uygun hale getir.
6. **Raporlama:** Sorunları tespit ettikten sonra, kod değişikliği yapmadan önce "Kritik Eksikler" (örneğin bakiye düşmeden bilet verilmesi) ve çözüm reçeteleri halinde kullanıcıya rapor sun.
