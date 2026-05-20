import mongoose from 'mongoose';
import { Announcement } from '../../packages/shared/shared-persistence/src/schemas/backend/announcement.schema.ts';
import { Policy } from '../../packages/shared/shared-persistence/src/schemas/backend/policy.schema.ts';
import { DynamicContent } from '../../packages/shared/shared-persistence/src/schemas/backend/dynamicContent.schema.ts';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

function genId() {
  return new mongoose.Types.ObjectId().toString();
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
const announcements = [
  {
    title: 'BazarX\'e Hoş Geldiniz!',
    content: 'Türkiye\'nin yeni nesil ticaret platformu BazarX\'e hoş geldiniz. Açık artırma, takas ve doğrudan satış ile kazanmaya başlayın.',
    type: 'INFO',
    priority: 10,
    isActive: true,
    startDate: new Date('2026-01-01'),
    linkText: 'Keşfet',
    linkUrl: '/products',
  },
  {
    title: 'Yaz Kampanyası Başladı 🎉',
    content: 'Seçili ürünlerde %30\'a varan indirimler! Fırsatları kaçırmayın.',
    type: 'PROMO',
    priority: 9,
    isActive: true,
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-07-31'),
    linkText: 'Kampanyaları Gör',
    linkUrl: '/products?isFlashSale=true',
  },
  {
    title: 'Takas Sistemi Aktif',
    content: 'BarterBorsa takas havuzu ile fazla stoklarınızı değerlendirin. Şirketler arası otomatik takas döngüleri oluşturun.',
    type: 'INFO',
    priority: 8,
    isActive: true,
    startDate: new Date('2026-01-01'),
    linkText: 'Takasa Başla',
    linkUrl: '/barter',
  },
  {
    title: 'Yeni Satıcı Bonusu',
    content: 'İlk 3 ay satıcı komisyonu %0! Hemen mağazanızı açın.',
    type: 'PROMO',
    priority: 7,
    isActive: true,
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-06-30'),
    linkText: 'Satıcı Ol',
    linkUrl: '/vendor/register',
  },
  {
    title: 'Sistem Bakımı',
    content: '25 Mayıs 2026, 02:00-04:00 saatleri arasında planlı bakım yapılacaktır.',
    type: 'MAINTENANCE',
    priority: 5,
    isActive: false,
    startDate: new Date('2026-05-24'),
    endDate: new Date('2026-05-25'),
  },
];

// ─── POLICIES ─────────────────────────────────────────────────────────────────
const policies = [
  {
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Aydınlatma Metni',
    type: 'privacy',
    version: '2.0',
    isActive: true,
    content: `# KİŞİSEL VERİLERİN KORUNMASINA İLİŞKİN AYDINLATMA METNİ

## 1. Giriş

BazarX ("Şirket") olarak; kişisel verilerinizin gizliliği ve güvenliği en önemli önceliklerimiz arasındadır. Şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") düzenlemelerine uyumlu bir şekilde kişisel verilerinizi işlemektedir.

## 2. Hangi Kişisel Verilerinizi İşliyoruz?

- **Kullanıcı Hesap Bilgileri:** Ad, soyad, e-posta, telefon, T.C. Kimlik No
- **Müşteri İşlem Bilgileri:** Sipariş, fatura, talep ve şikayet bilgileri
- **Teslimat Bilgileri:** Teslimat adresi ve kargo bilgileri
- **Ödeme Bilgileri:** Ödeme yöntemleri ve işlem bilgileri
- **İşlem Güvenliği Bilgileri:** IP adresi, cihaz bilgisi, çerez bilgileri

## 3. Hak ve Talepleriniz İçin İletişim

- **Adres:** Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara
- **E-posta:** kvkk@bazarx.com.tr
- **KEP:** dsm@hs02.kep.tr`,
  },
  {
    slug: 'uyelik-sozlesmesi',
    title: 'Üyelik Sözleşmesi',
    type: 'terms',
    version: '2.0',
    isActive: true,
    content: `# ÜYELİK SÖZLEŞMESİ

Bu sözleşme, BazarX platformuna üye olan kullanıcılar ile BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş. ("Şirket") arasındaki hak ve yükümlülükleri belirler.

## 1. Taraflar
- **Platform:** BazarX (www.bazarx.com.tr)
- **Üye:** Kayıt olan kullanıcı

## 2. Üyelik Şartları
- Üyeler, üyelik formunda belirttikleri bilgilerin doğruluğunu taahhüt ederler.
- Her üye yalnızca bir hesap açabilir.
- 18 yaşından küçükler üyelik oluşturamazlar.

## 3. Sözleşmenin Feshi
BazarX, üyelik sözleşmesini tek taraflı olarak feshetme hakkına sahiptir.

İletişim: Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara`,
  },
  {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    type: 'privacy',
    version: '2.0',
    isActive: true,
    content: `# ÇEREZ POLİTİKASI

## 1. Çerez Türleri

### Zorunlu Çerezler
Dijital ortamın düzgün çalışması için zorunludur.

### İşlevsel Çerezler
Kullanıcı tercihlerini hatırlamak ve kişiselleştirilmiş deneyim sunmak için kullanılır.

### Performans ve Analitik Çerezler
Platform performansını ölçmek amacıyla kullanılır.

## 2. Çerez Yönetimi
Tarayıcı ayarlarınız aracılığıyla çerezleri silebilir ya da engelleyebilirsiniz.

İletişim: kvkk@bazarx.com.tr`,
  },
  {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    type: 'terms',
    version: '2.0',
    isActive: true,
    content: `# KULLANIM KOŞULLARI

Bu internet sitesine girmeniz aşağıdaki koşulları kabul ettiğiniz anlamına gelir.

BazarX, sözleşmenin ihlali, haksız fiil veya diğer sebepler neticesinde doğabilecek doğrudan ya da dolaylı hiçbir zarardan sorumlu değildir.

BazarX işbu site ve uzantısında mevcut her tür hizmeti önceden ihtara gerek olmaksızın değiştirme, yeniden organize etme ve yayını durdurma hakkını saklı tutar.

**Fikri Mülkiyet:** BazarX'in genel görünüm ve dizaynı ile tüm materyaller yasal koruma altındadır.`,
  },
  {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi',
    type: 'return',
    version: '2.0',
    isActive: true,
    content: `# MESAFELİ SATIŞ SÖZLEŞMESİ

## 1. Taraflar
İşbu Mesafeli Satış Sözleşmesi, Alıcı ve Satıcı arasında elektronik ortamda kurulmuştur.

## 2. Ürün ve Teslimat
- **Teslim Şekli:** Alıcıya veya BazarX Teslimat Noktasına teslim
- **Ödeme:** "BAZARX ALICI GÜVENCESİ" kapsamında BZX tarafından tahsil edilmektedir

## 3. Cayma Hakkı
Alıcı, on dört gün içinde gerekçe göstermeksizin cayma hakkını kullanabilir.

**Adres:** Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara`,
  },
  {
    slug: 'iade-ve-iptal-kosullari',
    title: 'İade ve İptal Koşulları / Cayma Hakkı',
    type: 'return',
    version: '2.0',
    isActive: true,
    content: `# CAYMA HAKKI

## Cayma Hakkı Nasıl Kullanılır?

Mesafeli Sözleşmeler Yönetmeliği uyarınca; Alıcı, on dört gün içinde herhangi bir gerekçe göstermeksizin cayma hakkına sahiptir.

## İade Adımları

1. "Hesabım" > "Siparişlerim" > "Sipariş Detay" adımlarını takip edin
2. "İade Kargo Kodu Oluştur" butonuna tıklayın
3. İade edilecek ürünü ve iade nedenini seçin
4. Ekrandaki kargo kodunu not alın
5. Ürünü faturasıyla birlikte 7 gün içinde kargo şubesine teslim edin

## İade Koşulları
- Ürün hasarsız ve kullanılmamış olmalıdır
- Tüm aksesuarlar ve orijinal kutusuyla iade edilmelidir`,
  },
  {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    type: 'privacy',
    version: '2.0',
    isActive: true,
    content: `# GİZLİLİK POLİTİKASI

BazarX olarak verilerinizin gizliliği büyük önem taşımaktadır. Hangi verileri, nasıl ve hangi amaçlarla işlediğimiz hakkında detaylı bilgi KVKK Aydınlatma Metni'nde yer almaktadır.

**Veri Sorumlusu:** BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş.
**Adres:** Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara
**E-posta:** kvkk@bazarx.com.tr`,
  },
];

// ─── DYNAMIC CONTENT ──────────────────────────────────────────────────────────
const dynamicContents = [
  {
    key: 'homepage-hero-title',
    title: 'Ana Sayfa Hero Başlık',
    content: 'Türkiye\'nin Ticaret Platformu',
    contentType: 'TEXT',
    category: 'homepage',
    isActive: true,
  },
  {
    key: 'homepage-hero-subtitle',
    title: 'Ana Sayfa Hero Alt Başlık',
    content: 'Alın, satın, takas yapın. BazarX ile ticaret hiç bu kadar kolay olmamıştı.',
    contentType: 'TEXT',
    category: 'homepage',
    isActive: true,
  },
  {
    key: 'footer-about',
    title: 'Footer Hakkımızda Metni',
    content: 'BazarX, açık artırma, takas ve doğrudan satış imkânı sunan yeni nesil e-ticaret platformudur.',
    contentType: 'TEXT',
    category: 'footer',
    isActive: true,
  },
  {
    key: 'doc-commission-sanayitakas',
    title: 'TicariTakas Komisyon Detayları',
    content: 'TicariTakas, satıcı dostu politikalarıyla düşük komisyon oranları sunar. Kategorilere göre değişen oranlar genellikle %5 ile %20 arasındadır.',
    contentType: 'TEXT',
    category: 'help',
    isActive: true,
  },
  {
    key: 'doc-desi',
    title: 'Desi Hesaplama Rehberi',
    content: `# Desi Nedir?
Desi, kargo paketinin hacimsel ağırlığını ifade eden ölçü birimidir.

## Desi Formülü
Uzunluk × Genişlik × Yükseklik / 3000

## Örnek
30cm × 20cm × 15cm = 9000 / 3000 = 3 desi`,
    contentType: 'MARKDOWN',
    category: 'help',
    isActive: true,
  },
  {
    key: 'campaign-summer-2026',
    title: 'Yaz Kampanyası 2026 İçeriği',
    content: '<h2>Yaz Fırsatları</h2><p>Seçili kategorilerde <strong>%30\'a varan indirim</strong> fırsatını kaçırmayın!</p>',
    contentType: 'HTML',
    category: 'campaign',
    isActive: true,
  },
  {
    key: 'vendor-welcome-message',
    title: 'Satıcı Hoş Geldin Mesajı',
    content: 'BazarX satıcı ailesine hoş geldiniz! İlk 3 ay %0 komisyon avantajıyla satışa başlayabilirsiniz.',
    contentType: 'TEXT',
    category: 'vendor',
    isActive: true,
  },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 MongoDB Content Seeding başlıyor...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu');

  // --- Announcements ---
  console.log('\n📢 Duyurular yükleniyor...');
  let annCount = 0;
  for (const ann of announcements) {
    const id = genId();
    await Announcement.findOneAndUpdate(
      { title: ann.title },
      { $setOnInsert: { _id: id, id, ...ann } },
      { upsert: true }
    );
    annCount++;
  }
  console.log(`✅ ${annCount} duyuru eklendi/güncellendi`);

  // --- Policies ---
  console.log('\n📋 Politikalar yükleniyor...');
  let polCount = 0;
  for (const pol of policies) {
    const id = genId();
    await Policy.findOneAndUpdate(
      { slug: pol.slug },
      {
        $set: { title: pol.title, content: pol.content, type: pol.type, version: pol.version, isActive: pol.isActive },
        $setOnInsert: { _id: id, id, slug: pol.slug },
      },
      { upsert: true }
    );
    polCount++;
  }
  console.log(`✅ ${polCount} politika eklendi/güncellendi`);

  // --- Dynamic Content ---
  console.log('\n🔧 Dinamik içerikler yükleniyor...');
  let dynCount = 0;
  for (const dyn of dynamicContents) {
    const id = genId();
    await DynamicContent.findOneAndUpdate(
      { key: dyn.key },
      {
        $set: { title: dyn.title, content: dyn.content, contentType: dyn.contentType, category: dyn.category, isActive: dyn.isActive },
        $setOnInsert: { _id: id, id, key: dyn.key },
      },
      { upsert: true }
    );
    dynCount++;
  }
  console.log(`✅ ${dynCount} dinamik içerik eklendi/güncellendi`);

  console.log('\n🎉 Tüm içerik seed\'leri başarıyla tamamlandı!');
  console.log(`   📢 Duyurular: ${annCount}`);
  console.log(`   📋 Politikalar: ${polCount}`);
  console.log(`   🔧 Dinamik İçerik: ${dynCount}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
