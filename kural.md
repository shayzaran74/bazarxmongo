KURALLAR:
1. Mimari Hedef: DDD (Domain Driven Design) ve Clean Architecture prensiplerine tam uyum sağlanacak. Tüm iş kuralları Domain (Entities) katmanında toplanacak, Use Case'ler ince (thin) tutulacak.
2. Monorepo Standartlaştırma: Yapı 100% paket tabanlı olacak. Yeni özellikler `packages/domain-[ad]` altında toplanacak. Bağımlılıklar `@barterborsa/shared-types` ve `@barterborsa/shared-core` üzerinden yönetilecek.
3. Paket Geliştirme Stratejisi: `shared-core` ve `shared-persistence` gibi temel paketlerde mimari yapıyı `bazarx` wing'inden (kurulum fazı dokümanları), uygulama mantığını (logic) ise neredeyse tamamen `barterborsa` wing'inden al. Eksik kısımları bu iki referansı hibritleyerek tamamla.
4. Sadece gerekli mantıksal (logic) eklemeleri yap; UI ve stil bileşenlerine zorunlu olmadıkça dokunma. Kodları hibrit şekilde yaz (mevcut yapıyı bozmadan fonksiyonelliği geliştir). Gereksiz kod ekleme, sadece istenen dosyaları yaz.
5. Backend ve frontend kısımlarını paralel ilerlet. Örneğin Auth modülü (login/registration) bittiğinde hem mevcut test script'lerini (npm run test vb.) çalıştır hem de tarayıcı/terminal üzerinden manuel doğrulama yap.
6. Referans Dokümanlar: Backend için `belge/backend/kurulum faz/FAZ 1.md`, Frontend için `belge/frontend/bolum-1-gemini-prompt.md` dosyalarını her zaman göz önünde bulundur.
7. Her dosyanın tam path'ini en başa yorum satırı olarak ekle (örn: // packages/shared/shared-core/src/domain/entity.base.ts).
8. TypeScript strict mode uyumlu yaz ve teknik borç oluşumunu her satırda engelle. `any` ve `@ts-ignore` kesinlikle kullanma.
9. Monorepo package isimleri @barterborsa/ prefix'i ile olacak (örn: @barterborsa/shared-core).
10. Her dosyada gerekli import/export'lar eksiksiz olacak ve index.ts barrel export dosyaları oluşturulacak.
11. Kod yorumlarını Türkçe yaz.
12. Mempal Kullanımı: Kodları Mempal'dan kopyaladıktan sonra DDD/Clean Architecture prensiplerine ve monorepo standartlarına göre revize ederek entegre et.
13. Her adımda kodun her satırında gereksiz kod ve teknik borç oluşumunu engelle. Standart dışı hiçbir dosya veya yapı ekleme.