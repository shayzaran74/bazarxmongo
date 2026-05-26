// apps/backend/src/modules/vendor/application/services/import-template.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { VENDOR_COLUMN_MAP } from '../commands/column-map.const';

@Injectable()
export class ImportTemplateService {
  private readonly logger = new Logger(ImportTemplateService.name);

  /**
   * Vendor Excel Şablonu üretir.
   * Sheet 1: Ürünler
   * Sheet 2: Talimatlar
   * Sheet 3: Örnek Veri
   */
  generateVendorExcel(): Buffer {
    const wb = XLSX.utils.book_new();

    const formatHeader = (key: string) => key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Tek kaynak: VENDOR_COLUMN_MAP
    const headers = [
      formatHeader(VENDOR_COLUMN_MAP.barcode[0]),
      'SKU', // formatHeader makes it 'Sku'
      formatHeader(VENDOR_COLUMN_MAP.name[0]),
      formatHeader(VENDOR_COLUMN_MAP.description[0]),
      formatHeader(VENDOR_COLUMN_MAP.price[0]),
      formatHeader(VENDOR_COLUMN_MAP.stock[0]),
      formatHeader(VENDOR_COLUMN_MAP.brand[0]),
      formatHeader(VENDOR_COLUMN_MAP.categoryId[0]),
      formatHeader(VENDOR_COLUMN_MAP.primaryImage[0]),
      formatHeader(VENDOR_COLUMN_MAP.extraImages[0]),
      'KDV Oranı', // Özel durum
      formatHeader(VENDOR_COLUMN_MAP.status[0]),
    ];

    // --- SHEET 1: Ürünler (Boş veri girişi şablonu) ---
    const wsProducts = XLSX.utils.aoa_to_sheet([headers]);
    this.applyAutowidth(wsProducts);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Ürünler');

    // --- SHEET 2: Talimatlar ---
    const instructionsHeaders = ['Kolon Adı', 'Zorunlu Mu?', 'Açıklama / Kabul Edilen Değerler', 'Örnek Veri'];
    const instructionsRows = [
      [headers[0], 'Evet (veya SKU)', 'Ürünün benzersiz barkod değeri (EAN, GTIN vb.)', '8690000000001'],
      [headers[1], 'Hayır (Barkod yoksa Evet)', 'Ürün model/stok kodu', 'CP-1002-BLU'],
      [headers[2], 'Evet', 'Ürünün BazarX platformunda görünecek başlığı', 'Kablosuz Bluetooth Kulaklık'],
      [headers[3], 'Hayır', 'Ürünün detaylı açıklaması ve özellikleri', 'Gürültü engelleyici kablosuz kulaklık.'],
      [headers[4], 'Evet', 'Ürün satış fiyatı (TL cinsinden, sayısal değer). Sıfır veya negatif olamaz.', '1250.50'],
      [headers[5], 'Evet', 'Mevcut envanter adedi. Tam sayı olmalı, negatif olamaz.', '50'],
      [headers[6], 'Hayır', 'Ürün markası. Boş bırakılırsa ürün adının ilk kelimesi atanır.', 'Philips'],
      [headers[7], 'Hayır', 'Platform kategori benzersiz kimliği (örn: cat-12345). Geçersizse Genel kategoriye atanır.', 'cat-12345'],
      [headers[8], 'Hayır', 'Ürünün birincil görsel URL\'si', 'https://images.bazarx.com/kulaklik.jpg'],
      [headers[9], 'Hayır', 'Diğer resim URL\'leri. Birden fazla resim için aralarına | (pipe) ekleyin.', 'https://img.com/k1.jpg|https://img.com/k2.jpg'],
      [headers[10], 'Hayır', 'KDV yüzdesi. Kabul edilenler: 1, 8, 10, 18, 20. Boşsa 20 alınır.', '20'],
      [headers[11], 'Hayır', 'Ürün yayında olma durumu. Kabul edilenler: ACTIVE, INACTIVE, PENDING. Boşsa ACTIVE.', 'ACTIVE'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet([instructionsHeaders, ...instructionsRows]);
    this.applyAutowidth(wsInstructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Talimatlar');

    // --- SHEET 3: Örnek Veri ---
    const sampleRows = [
      ['8690123456789', 'SKU-IPH-15', 'iPhone 15 128GB', 'Apple Türkiye Garantili Akıllı Telefon', '49999.90', '25', 'Apple', 'cat-telefon', 'https://demo.com/iphone15.jpg', 'https://demo.com/iphone15-1.jpg|https://demo.com/iphone15-2.jpg', '20', 'ACTIVE'],
      ['8690123456790', 'SKU-NK-3310', 'Nokia 3310 Efsane Cep Telefonu', 'Nostaljik efsanevi Nokia 3310', '1500.00', '10', 'Nokia', 'cat-telefon', 'https://demo.com/n3310.jpg', '', '20', 'ACTIVE'],
      ['8690123456791', 'SKU-SAM-S24', 'Samsung Galaxy S24 256GB', 'Samsung Türkiye garantili üst seviye akıllı telefon', '39999.00', '0', 'Samsung', 'cat-telefon', 'https://demo.com/s24.jpg', 'https://demo.com/s24-side.jpg', '20', 'PENDING'],
    ];
    const wsSamples = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    this.applyAutowidth(wsSamples);
    XLSX.utils.book_append_sheet(wb, wsSamples, 'Örnek Veri');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  /**
   * Admin Excel Şablonu üretir.
   * Ekstra admin yetki kolonlarını içerir.
   */
  generateAdminExcel(): Buffer {
    const wb = XLSX.utils.book_new();

    const headers = [
      'Barkod*',
      'SKU',
      'Ürün Adı*',
      'Açıklama',
      'Fiyat*',
      'Stok*',
      'Marka',
      'Kategori ID',
      'Ana Resim',
      'Ek Resimler',
      'KDV Oranı',
      'Durum',
      'Brand ID',
      'Öne Çıkan',
      'Flash Sale',
      'Özel Teklif',
      'Vendor ID',
    ];
    const wsProducts = XLSX.utils.aoa_to_sheet([headers]);
    this.applyAutowidth(wsProducts);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Ürünler');

    // Talimatlar
    const instructionsHeaders = ['Kolon Adı', 'Zorunlu Mu?', 'Açıklama / Kabul Edilen Değerler', 'Örnek Veri'];
    const instructionsRows = [
      ['Barkod*', 'Evet (veya SKU)', 'Ürünün benzersiz barkod değeri (EAN, GTIN vb.)', '8690000000001'],
      ['SKU', 'Hayır (Barkod yoksa Evet)', 'Ürün model/stok kodu', 'CP-1002-BLU'],
      ['Ürün Adı*', 'Evet', 'Ürünün BazarX platformunda görünecek başlığı', 'Kablosuz Bluetooth Kulaklık'],
      ['Açıklama', 'Hayır', 'Ürünün detaylı açıklaması ve özellikleri', 'Gürültü engelleyici kablosuz kulaklık.'],
      ['Fiyat*', 'Evet', 'Ürün satış fiyatı (TL cinsinden, sayısal değer). Sıfır veya negatif olamaz.', '1250.50'],
      ['Stok*', 'Evet', 'Mevcut envanter adedi. Tam sayı olmalı, negatif olamaz.', '50'],
      ['Marka', 'Hayır', 'Ürün markası. Boş bırakılırsa ürün adının ilk kelimesi atanır.', 'Philips'],
      ['Kategori ID', 'Hayır', 'Platform kategori benzersiz kimliği (örn: cat-12345). Geçersizse Genel kategoriye atanır.', 'cat-12345'],
      ['Ana Resim', 'Hayır', 'Ürünün birincil görsel URL\'si', 'https://images.bazarx.com/kulaklik.jpg'],
      ['Ek Resimler', 'Hayır', 'Diğer resim URL\'leri. Birden fazla resim için aralarına | (pipe) ekleyin.', 'https://img.com/k1.jpg|https://img.com/k2.jpg'],
      ['KDV Oranı', 'Hayır', 'KDV yüzdesi. Kabul edilenler: 1, 8, 10, 18, 20. Boşsa 20 alınır.', '20'],
      ['Durum', 'Hayır', 'Ürün yayında olma durumu. Kabul edilenler: ACTIVE, INACTIVE, PENDING. Boşsa ACTIVE.', 'ACTIVE'],
      ['Brand ID', 'Hayır', 'Admin panelinden tanımlanmış Marka Kimliği', 'brand-apple-uuid'],
      ['Öne Çıkan', 'Hayır', 'Ana sayfada öne çıkanlar listesine alınsın mı? Eşleşenler: true, false. Boşsa false.', 'true'],
      ['Flash Sale', 'Hayır', 'Flaş indirimli ürün mü? Eşleşenler: true, false. Boşsa false.', 'false'],
      ['Özel Teklif', 'Hayır', 'Özel teklif kampanyasında listelensin mi? Eşleşenler: true, false. Boşsa false.', 'true'],
      ['Vendor ID', 'Hayır', 'Ürünün atanacağı satıcı ID\'si. Boşsa sistemin varsayılan satıcısına atanır.', 'vendor-1234'],
    ];

    const wsInstructions = XLSX.utils.aoa_to_sheet([instructionsHeaders, ...instructionsRows]);
    this.applyAutowidth(wsInstructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Talimatlar');

    // Örnek Veri
    const sampleRows = [
      ['8690123456789', 'SKU-IPH-15', 'iPhone 15 128GB', 'Apple Türkiye Garantili Akıllı Telefon', '49999.90', '25', 'Apple', 'cat-telefon', 'https://demo.com/iphone15.jpg', 'https://demo.com/iphone15-1.jpg|https://demo.com/iphone15-2.jpg', '20', 'ACTIVE', 'brand-apple', 'true', 'false', 'true', 'vendor-apple-tr'],
    ];
    const wsSamples = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    this.applyAutowidth(wsSamples);
    XLSX.utils.book_append_sheet(wb, wsSamples, 'Örnek Veri');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  /**
   * Trendyol JSON şablonu üretir.
   */
  generateTrendyolJson(): string {
    const products = [
      {
        external_id: '10001',
        title: 'Xiaomi Redmi Note 13 Pro 256 GB 8 GB Ram Akıllı Telefon',
        price: 14999.00,
        stock: 150,
        barcode: '6941812753123',
        model_kodu: 'REDMI-NOTE13-PRO',
        brand: 'Xiaomi',
        subcategory: 'Elektronik > Telefon > Akıllı Telefon',
        image_url: 'https://images.bazarx.com.tr/xiaomi-redmi-note-13-pro.jpg',
        image_urls: [
          'https://images.bazarx.com.tr/xiaomi-redmi-note-13-pro-1.jpg',
          'https://images.bazarx.com.tr/xiaomi-redmi-note-13-pro-2.jpg',
        ],
        description: 'Xiaomi Türkiye garantili Redmi Note 13 Pro. Efsanevi 200 MP kamera ile muhteşem çekim gücü. Bu ürün yetkili distribütör tarafından gönderilecektir. Kampanya fiyatından satılmak üzere 100 adetten fazla stok sunulmuştur.',
        attributes: {
          Renk: 'Siyah',
          Hafıza: '256 GB',
          Ram: '8 GB',
        },
      },
      {
        external_id: '10002',
        title: 'HP Victus 16-S0035NT AMD Ryzen 5 Oyuncu Bilgisayarı',
        price: 28999.00,
        stock: 45,
        barcode: '197497123456',
        model_kodu: 'HP-VICTUS-16',
        brand: 'HP',
        subcategory: 'Bilgisayar > Taşınabilir Bilgisayar > Oyuncu Laptop',
        image_url: 'https://images.bazarx.com.tr/hp-victus-16.jpg',
        image_urls: [
          'https://images.bazarx.com.tr/hp-victus-16-1.jpg',
        ],
        description: 'Oyuncular için yüksek performanslı HP Victus 16 inç laptop. RTX 4050 6GB ekran kartı ile kesintisiz oyun keyfi. Bu ürün hp türkiye satıcısı tarafından gönderilecektir. 20 adetten az stok mevcuttur.',
        attributes: {
          Renk: 'Mika Grisi',
          İşlemci: 'AMD Ryzen 5',
          EkranKartı: 'RTX 4050',
        },
      },
      {
        external_id: '10003',
        title: 'Philips HD9252/90 Airfryer Fritöz',
        price: 3499.00,
        stock: 80,
        barcode: '8710103971234',
        model_kodu: 'PHILIPS-AIRFRYER-9252',
        brand: 'Philips',
        subcategory: 'Elektrikli Ev Aletleri > Mutfak Aletleri > Fritözler',
        image_url: 'https://images.bazarx.com.tr/philips-airfryer.jpg',
        image_urls: [],
        description: 'Sağlıklı lezzetler için Philips Airfryer Fritöz. %90 daha az yağ ile lezzetli çıtır patatesler pişirin. Bu ürün philips yetkili satıcısı tarafından gönderilecektir. Kampanya fiyatından satılmak üzere 50 adetten fazla stok sunulmuştur.',
        attributes: {
          Kapasite: '4.1 Litre',
          Güç: '1400 W',
        },
      },
      {
        external_id: '10004',
        title: 'Stanley Classic Trigger Action Termos 0.47 L',
        price: 1899.00,
        stock: 120,
        barcode: '6939236312345',
        model_kodu: 'STANLEY-TERM-047',
        brand: 'Stanley',
        subcategory: 'Spor > Kamp Malzemeleri > Termoslar',
        image_url: 'https://images.bazarx.com.tr/stanley-termos.jpg',
        image_urls: [
          'https://images.bazarx.com.tr/stanley-termos-1.jpg',
        ],
        description: 'Stanley kalitesiyle sıcak/soğuk korumalı tetikli termos. Kampanya fiyatından satılmak üzere 100 adetten fazla stok sunulmuştur.',
        attributes: {
          Hacim: '0.47 Litre',
          Renk: 'Yeşil',
        },
      },
      {
        external_id: '10005',
        title: 'Sony WH-1000XM5 Kulak Üstü Kulaklık',
        price: 12499.00,
        stock: 35,
        barcode: '4548736123456',
        model_kodu: 'SONY-WH1000XM5',
        brand: 'Sony',
        subcategory: 'Elektronik > Ses Sistemleri > Kulaklıklar',
        image_url: 'https://images.bazarx.com.tr/sony-xm5.jpg',
        image_urls: [
          'https://images.bazarx.com.tr/sony-xm5-1.jpg',
          'https://images.bazarx.com.tr/sony-xm5-2.jpg',
        ],
        description: 'Sony kalitesiyle sektör lideri gürültü engelleme özellikli kablosuz kulaküstü kulaklık. 20 adetten az stok mevcuttur.',
        attributes: {
          Renk: 'Gümüş',
          Bağlantı: 'Bluetooth',
        },
      },
    ];

    return JSON.stringify(products, null, 2);
  }

  /**
   * Kolon genişliklerini otomatik ayarlar.
   */
  private applyAutowidth(ws: XLSX.WorkSheet): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const colsWidths: { wch: number }[] = [];

    for (let c = range.s.c; c <= range.e.c; c++) {
      let maxLen = 10;
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (cell && cell.v) {
          maxLen = Math.max(maxLen, String(cell.v).length);
        }
      }
      colsWidths.push({ wch: maxLen + 3 });
    }
    ws['!cols'] = colsWidths;
  }
}
