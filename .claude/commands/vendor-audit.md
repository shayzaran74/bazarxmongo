# Vendor Dashboard Data Isolation Audit
---
description: Vendor panelindeki veri izolasyonunu, ürün yönetimini ve finansal verileri denetler.
---

Lütfen Vendor Dashboard bileşenlerini (Backend & Frontend) şu kritik noktalar üzerinden denetle:

1. **Data Isolation (En Kritik):** 
   - **HIÇBIR** API çağrısında `vendorId` query parametresi olarak frontend'den alınmamalı.
   - Her zaman `CurrentUser` içindeki `vendorId`'ye güvenilmeli.
   - SQL query'lerinde (Prisma) `where: { vendorId: currentVendorId }` filtresi unutulmuş bir yer var mı?

2. **Inventory Management:** 
   - Vendor sadece kendi stoklarını güncelleyebiliyor mu?
   - Toplu ürün ekleme (bulk import) sadece ilgili vendor'ın yetkisinde mi?

3. **Financials & Orders:** 
   - Sipariş detaylarına erişimde vendor kontrolü yapılıyor mu?
   - Cüzdan/Kazanç bilgilerinde başka vendor'ın verisi sızıyor mu?

4. **Brand Application:** 
   - Vendor'ın marka başvurusu süreci doğru çalışıyor mu? (Duplicate check & Document upload).
