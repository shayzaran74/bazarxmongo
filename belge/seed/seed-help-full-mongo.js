// seed-help-full-mongo.js — Prisma seed-help.js'nin tam MongoDB karşılığı
// Tüm yardım makalelerini (Hakkımızda, Sipariş, İade, Satıcı, Hukuki) HelpArticle koleksiyonuna yükler
import mongoose from 'mongoose';
import { HelpArticle } from '../../packages/shared/shared-persistence/src/schemas/backend/helpArticle.schema.ts';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

const articles = [
  // 1. Hakkımızda
  {
    slug: 'bazarx-nedir', category: 'Hakkımızda', status: 'PUBLISHED',
    title: 'BazarX Nedir?',
    content: `BazarX, kullanıcıların açık artırma, doğrudan satış ve takas yöntemleriyle alışveriş yapabildiği yeni nesil bir e-ticaret platformudur.

## Nasıl Çalışır?
BazarX, sanayi ve ticaret sektöründeki firmaları bir araya getirerek, fazla stok, atık malzeme ve ihtiyaç duyulan ürünlerin karşılıklı takas veya satış yoluyla değerlendirilmesini sağlar.

## Temel Özellikler
- **Açık Artırma:** Ürünlerinizi açık artırma ile en iyi fiyata satabilirsiniz.
- **Doğrudan Satış:** Sabit fiyatla ürün satışı yapabilirsiniz.
- **Takas Sistemi:** Fazla stoklarınızı ihtiyaç duyduğunuz ürünlerle takas edebilirsiniz.
- **Döngüsel Takas:** Çoklu firma arasında otomatik takas zincirleri oluşturulur.`
  },
  // 2. Sipariş ve Kargo
  {
    slug: 'siparisler', category: 'Sipariş ve Kargo', status: 'PUBLISHED',
    title: 'Siparişler',
    content: 'Siparişlerinizi "Hesabım" > "Siparişlerim" sayfasından takip edebilirsiniz. Sipariş durumları: Onay Bekliyor, Hazırlanıyor, Kargoda, Teslim Edildi şeklinde güncellenir.'
  },
  {
    slug: 'kargo-teslimat', category: 'Sipariş ve Kargo', status: 'PUBLISHED',
    title: 'Kargo ve Teslimat',
    content: 'Ürünler, sipariş onayından itibaren en geç 30 gün içerisinde teslim edilir. Kargo takip numaranız sipariş detay sayfasında görüntülenebilir.'
  },
  {
    slug: 'kargo-ucreti-hesaplama', category: 'Sipariş ve Kargo', status: 'PUBLISHED',
    title: 'Kargo Ücreti Hesaplama',
    content: 'Kargo ücretleri desi ve mesafeye göre değişmektedir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.'
  },
  // 3. İade ve İptal
  {
    slug: 'iade', category: 'İade ve İptal', status: 'PUBLISHED',
    title: 'İade Prosedürü',
    content: `## Cayma Hakkı Kullanılabilen Ürünleri Nasıl İade Ederim?

BazarX platformu üzerinden iade sürecini başlatmak için şu adımları takip edin:
1. "Hesabım" > "Siparişlerim" > "Sipariş detay" adımlarını takip edin.
2. İade Kargo Kodu Oluştur butonuna tıklayın.
3. İade edilecek ürünü ve iade nedenini seçin.
4. Ekranda çıkan iade kargo kodunu not alın.
5. İade kodu aynı olan ürünleri faturasıyla beraber aynı pakete koyun.
6. Paketinizi 7 gün içinde seçtiğiniz kargo şubesine veya belirtilen adrese teslim edin.

## İade Koşulları
- Ürünün paketi hasar görmemiş ve kullanılmamış olmalıdır.
- Tüm aksesuarlar ve orijinal kutu ile birlikte iade edilmelidir.
- Sağlık ve hijyen açısından uygun olmayan ürünlerin ancak ambalajı açılmamış olması halinde iadesi kabul edilir.`
  },
  {
    slug: 'iade-faturasi', category: 'İade ve İptal', status: 'PUBLISHED',
    title: 'İade Faturası Düzenleme',
    content: 'Kurumsal müşterilerimiz için iade faturası düzenleme rehberi. İade işlemi tamamlandıktan sonra kurumsal fatura düzenlemesi yapılabilir.'
  },
  // 4. Satıcı Rehberi
  {
    slug: 'desi-hesaplama', category: 'Satıcı Rehberi', status: 'PUBLISHED',
    title: 'Desi Hesaplama',
    content: 'Kargo gönderimlerinde desi nasıl hesaplanır? Formül: Uzunluk × Genişlik × Yükseklik / 3000'
  },
  {
    slug: 'kdv-hesaplama', category: 'Satıcı Rehberi', status: 'PUBLISHED',
    title: 'KDV Hesaplama',
    content: 'Ürün fiyatlandırmada KDV hesaplama yöntemleri. KDV dahil fiyat: Net Fiyat × (1 + KDV Oranı). KDV hariç fiyat: KDV dahil fiyat / (1 + KDV Oranı).'
  },
  // 5. Satıcı Bilgi Merkezi
  {
    slug: 'bazarxda-satis-yapmak', category: 'Satıcı Bilgi Merkezi', status: 'PUBLISHED',
    title: "BazarX'da Satış Yapmanın Avantajları",
    content: `## Şimdi BazarX'da Satışa Başlayın!

Ürünlerinizi, her gün BazarX'da arama yapan milyonlarca müşteri ile buluşturun.

## BazarX'da Satış Yapmak Neden Avantajlı?

### Milyonlarca Müşteri Sizi Bekliyor!
BazarX'la ürünlerinizi milyonlarca potansiyel müşteriye ulaştırarak görünürlüğünüzü ve satışlarınızı artırın.

### Hızlı ve Kolay Operasyon Mümkün!
BazarX Satıcı Merkezi ile tüm süreçleri tek platformda yöneterek sorunsuz ve verimli bir deneyim sağlayın.

### Satışlarınızı Katlayın!
BazarX'da satış yaparak işinizi kolayca büyütün!

## Kategoriler
- **Temel Kavramlar** — E-Ticaret süreçleri
- **Ürün İşlemleri** — Ürün yükleme ve güncelleme
- **Sipariş ve Kargo** — Operasyonel süreçler
- **Finans** — Ödeme ve fatura işlemleri`
  },
  // 6. Satıcı Başvuru
  {
    slug: 'satici-olma-asamalari', category: 'Satıcı Başvuru', status: 'PUBLISHED',
    title: 'Satıcı Olma Aşamaları',
    content: `# BazarX Başvuru Formu ve Başvuru Adımları

## Satıcı Başvuru Formu

bazarx.com.tr'de sağ üst köşede "BazarX'da Satış Yap" butonu ile başvuru yapabilirsiniz.

### Başvuru formunda doldurulması gereken alanlar:
- **Adınız-Soyadınız:** Şirket yetkilisinin adı ve soyadı
- **E-Posta Adresiniz:** BazarX bilgilendirmeleri için
- **Cep Telefonunuz:** SMS doğrulaması için
- **Şirket Türü:** Şahıs, Ltd., A.Ş.
- **TCKN / VKN:** Şahıs için TCKN, şirketler için VKN

## SMS Doğrulama
Telefon numaranıza SMS ile doğrulama kodu iletilecektir.

## Satıcı Kaydı Adımları
1. **Şirket Bilgileri** — Mağaza adı, vergi numarası, IBAN
2. **Operasyon Bilgileri** — Kargo şirketi, iade adresi
3. **Doğrulama** — Telefon ve e-posta doğrulaması`
  },
  // 7. Hukuki
  {
    slug: 'kullanim-kosullari', category: 'Hukuki', status: 'PUBLISHED',
    title: 'Kullanım Koşulları',
    content: `Bu internet sitesine girmeniz aşağıdaki koşulları kabul ettiğiniz anlamına gelir.

BazarX işbu site ve site uzantısında mevcut her tür hizmet ve ürünleri önceden ihtara gerek olmaksızın değiştirme, yeniden organize etme ve yayını durdurma hakkını saklı tutar.

BazarX bu internet sitesinin genel görünüm ve dizaynı ile tüm materyallerin fikri ve sınai mülkiyet haklarının sahibi veya lisans sahibidir.`
  },
  {
    slug: 'islem-rehberi', category: 'Hukuki', status: 'PUBLISHED',
    title: 'İşlem Rehberi',
    content: `# İşlem Rehberi

BazarX platformunda yapabileceğiniz işlemlerin rehberi:

- **Alışveriş:** Ürünleri arayın, sepete ekleyin ve ödeme yapın
- **Takas:** Fazla stoklarınızı ihtiyaç duyduğunuz ürünlerle takas edin
- **Açık Artırma:** Ürünlerinizi açık artırma ile satışa çıkarın
- **Satıcı Olma:** Satıcı başvurusu yaparak ürünlerinizi satışa sunun`
  },
  {
    slug: 'kvkk-aydinlatma', category: 'Hukuki', status: 'PUBLISHED',
    title: 'KVKK Aydınlatma Metni',
    content: 'Kişisel Verilerin Korunmasına İlişkin Aydınlatma Metni için "Politikalar" sayfasını ziyaret ediniz.'
  },
  {
    slug: 'cerez-politikasi-makale', category: 'Hukuki', status: 'PUBLISHED',
    title: 'Çerez Politikası',
    content: 'Çerez Politikası detayları için "Politikalar" sayfasını ziyaret ediniz.'
  },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB bağlantısı kuruldu');
  console.log(`🚀 ${articles.length} yardım makalesi yükleniyor...\n`);

  let count = 0;
  for (const art of articles) {
    await HelpArticle.findOneAndUpdate(
      { slug: art.slug },
      { $set: { title: art.title, category: art.category, content: art.content, status: art.status } },
      { upsert: true }
    );
    console.log(`  ✅ [${art.category}] ${art.title}`);
    count++;
  }

  console.log(`\n🎉 Yardım makaleleri seed tamamlandı! Toplam: ${count} makale`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
