import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding help center (XML-based v2)...')

    // ═══════════════════════════════════════════════════
    // 1. Hakkımızda
    // ═══════════════════════════════════════════════════
    const catAbout = 'Hakkımızda';

    await prisma.helpArticle.upsert({
        where: { slug: 'bazarx-nedir' },
        update: {
            title: 'BazarX Nedir?',
            category: catAbout,
            content: `BazarX, kullanıcıların açık artırma, doğrudan satış ve takas yöntemleriyle alışveriş yapabildiği yeni nesil bir e-ticaret platformudur.

## Nasıl Çalışır?
BazarX, sanayi ve ticaret sektöründeki firmaları bir araya getirerek, fazla stok, atık malzeme ve ihtiyaç duyulan ürünlerin karşılıklı takas veya satış yoluyla değerlendirilmesini sağlar.

## Temel Özellikler
- **Açık Artırma:** Ürünlerinizi açık artırma ile en iyi fiyata satabilirsiniz.
- **Doğrudan Satış:** Sabit fiyatla ürün satışı yapabilirsiniz.
- **Takas Sistemi:** Fazla stoklarınızı ihtiyaç duyduğunuz ürünlerle takas edebilirsiniz.
- **Döngüsel Takas:** Çoklu firma arasında otomatik takas zincirleri oluşturulur.`,
            status: 'PUBLISHED'
        },
        create: {
            title: 'BazarX Nedir?',
            slug: 'bazarx-nedir',
            category: catAbout,
            content: `BazarX, kullanıcıların açık artırma, doğrudan satış ve takas yöntemleriyle alışveriş yapabildiği yeni nesil bir e-ticaret platformudur.

## Nasıl Çalışır?
BazarX, sanayi ve ticaret sektöründeki firmaları bir araya getirerek, fazla stok, atık malzeme ve ihtiyaç duyulan ürünlerin karşılıklı takas veya satış yoluyla değerlendirilmesini sağlar.

## Temel Özellikler
- **Açık Artırma:** Ürünlerinizi açık artırma ile en iyi fiyata satabilirsiniz.
- **Doğrudan Satış:** Sabit fiyatla ürün satışı yapabilirsiniz.
- **Takas Sistemi:** Fazla stoklarınızı ihtiyaç duyduğunuz ürünlerle takas edebilirsiniz.
- **Döngüsel Takas:** Çoklu firma arasında otomatik takas zincirleri oluşturulur.`,
            status: 'PUBLISHED'
        }
    })

    // ═══════════════════════════════════════════════════
    // 2. Sipariş ve Kargo
    // ═══════════════════════════════════════════════════
    const catOrders = 'Sipariş ve Kargo';

    const orderArticles = [
        { title: 'Siparişler', slug: 'siparisler', content: 'Siparişlerinizi "Hesabım" > "Siparişlerim" sayfasından takip edebilirsiniz. Sipariş durumları: Onay Bekliyor, Hazırlanıyor, Kargoda, Teslim Edildi şeklinde güncellenir.', status: 'PUBLISHED' },
        { title: 'Kargo ve Teslimat', slug: 'kargo-teslimat', content: 'Ürünler, sipariş onayından itibaren en geç 30 gün içerisinde teslim edilir. Kargo takip numaranız sipariş detay sayfasında görüntülenebilir.', status: 'PUBLISHED' },
        { title: 'Kargo Ücreti Hesaplama', slug: 'kargo-ucreti-hesaplama', content: 'Kargo ücretleri desi ve mesafeye göre değişmektedir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.', status: 'PUBLISHED' },
    ]

    for (const art of orderArticles) {
        await prisma.helpArticle.upsert({
            where: { slug: art.slug },
            update: { title: art.title, content: art.content, status: art.status, category: catOrders },
            create: { title: art.title, slug: art.slug, category: catOrders, content: art.content, status: art.status }
        })
    }

    // ═══════════════════════════════════════════════════
    // 3. İade ve İptal
    // ═══════════════════════════════════════════════════
    const catRefunds = 'İade ve İptal';

    const refundArticles = [
        {
            title: 'İade Prosedürü',
            slug: 'iade',
            status: 'PUBLISHED',
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
            title: 'İade Faturası Düzenleme',
            slug: 'iade-faturasi',
            status: 'PUBLISHED',
            content: 'Kurumsal müşterilerimiz için iade faturası düzenleme rehberi. İade işlemi tamamlandıktan sonra kurumsal fatura düzenlemesi yapılabilir.'
        },
    ]

    for (const art of refundArticles) {
        await prisma.helpArticle.upsert({
            where: { slug: art.slug },
            update: { title: art.title, content: art.content, status: art.status, category: catRefunds },
            create: { title: art.title, slug: art.slug, category: catRefunds, content: art.content, status: art.status || 'PUBLISHED' }
        })
    }

    // ═══════════════════════════════════════════════════
    // 4. Satıcı Rehberi & Komisyonlar
    // ═══════════════════════════════════════════════════
    const catVendor = 'Satıcı Rehberi';

    const vendorArticles = [
        { title: 'Desi Hesaplama', slug: 'desi-hesaplama', content: 'Kargo gönderimlerinde desi nasıl hesaplanır? Formül: Uzunluk × Genişlik × Yükseklik / 3000', status: 'PUBLISHED' },
        { title: 'KDV Hesaplama', slug: 'kdv-hesaplama', content: 'Ürün fiyatlandırmada KDV hesaplama yöntemleri.', status: 'PUBLISHED' },
    ]

    for (const art of vendorArticles) {
        await prisma.helpArticle.upsert({
            where: { slug: art.slug },
            update: { title: art.title, content: art.content, status: art.status, category: catVendor },
            create: { title: art.title, slug: art.slug, category: catVendor, content: art.content, status: art.status }
        })
    }

    // ═══════════════════════════════════════════════════
    // 5. Satıcı Bilgi Merkezi
    // ═══════════════════════════════════════════════════
    const catVendorInfo = 'Satıcı Bilgi Merkezi';

    await prisma.helpArticle.upsert({
        where: { slug: 'bazarxda-satis-yapmak' },
        update: {
            title: 'BazarX\'da Satış Yapmanın Avantajları',
            category: catVendorInfo,
            content: `## Şimdi BazarX'da Satışa Başlayın!

Ürünlerinizi, her gün BazarX'da arama yapan milyonlarca müşteri ile buluşturun.

## BazarX'da Satış Yapmak Neden Avantajlı?

### Milyonlarca Müşteri Sizi Bekliyor!
BazarX'la ürünlerinizi milyonlarca potansiyel müşteriye ulaştırarak görünürlüğünüzü ve satışlarınızı artırın.

### Hızlı ve Kolay Operasyon Mümkün!
BazarX Satıcı Merkezi ile operasyon süreçleri artık çok kolay! Tüm süreçleri tek platformda yöneterek müşterileriniz için sorunsuz ve verimli bir deneyim sağlayın.

### Satışlarınızı Katlayın!
BazarX'da satış yaparak milyonlarca potansiyel müşteriye ulaşın, satışlarınızı artırın ve işinizi kolayca büyütün!

## Kategoriler
- **Temel Kavramlar** — E-Ticaret süreçlerinizde bilmeniz gereken temel konular
- **Ürün İşlemleri** — Ürünlerinizi kolayca yükleyip güncellemeniz için gerekli tüm adımlar
- **Sipariş ve Kargo** — Siparişten teslimata kadar tüm operasyonel süreçler
- **Finans** — Ödeme, fatura ve e-dönüşüm işlemlerine dair tüm finansal süreçler
- **Satış Artırma & Pazarlama** — Pazarlama araçları ve stratejiler
- **Satıcı Paneli Uygulamaları** — Tüm araçlar ve detaylar`,
            status: 'PUBLISHED'
        },
        create: {
            title: 'BazarX\'da Satış Yapmanın Avantajları',
            slug: 'bazarxda-satis-yapmak',
            category: catVendorInfo,
            content: `## Şimdi BazarX'da Satışa Başlayın!

Ürünlerinizi, her gün BazarX'da arama yapan milyonlarca müşteri ile buluşturun.

## BazarX'da Satış Yapmak Neden Avantajlı?

### Milyonlarca Müşteri Sizi Bekliyor!
BazarX'la ürünlerinizi milyonlarca potansiyel müşteriye ulaştırarak görünürlüğünüzü ve satışlarınızı artırın.

### Hızlı ve Kolay Operasyon Mümkün!
BazarX Satıcı Merkezi ile operasyon süreçleri artık çok kolay!

### Satışlarınızı Katlayın!
BazarX'da satış yaparak milyonlarca potansiyel müşteriye ulaşın!`,
            status: 'PUBLISHED'
        }
    })

    // ═══════════════════════════════════════════════════
    // 6. Satıcı Başvuru
    // ═══════════════════════════════════════════════════
    const catVendorApp = 'Satıcı Başvuru';

    await prisma.helpArticle.upsert({
        where: { slug: 'satici-olma-asamalari' },
        update: {
            title: 'Satıcı Olma Aşamaları',
            category: catVendorApp,
            content: `# BazarX Başvuru Formu ve Başvuru Adımları

Aşağıdaki başvuru adımlarını takip ederek BazarX'da satışa başlayabilirsiniz.

## Satıcı Başvuru Formu

bazarx.com.tr'de sağ üst köşede yer alan "BazarX'da Satış Yap" butonu ile satış yapabileceğiniz modelleri görebilirsiniz. BazarX Pazaryeri satıcısı olmak için "Pazaryeri'ne Başvur" butonuna tıklayarak Satıcı Başvuru Formu'na ulaşabilirsiniz.

### Başvuru formunda doldurulması gereken alanlar:
- **Adınız-Soyadınız:** Şirket yetkilisinin adı ve soyadı
- **E-Posta Adresiniz:** BazarX bilgilendirmeleri almak istediğiniz e-posta adresi
- **Cep Telefonunuz:** SMS gönderileri için cep telefonu bilgisi
- **Satılacak Ürün Kategorisi:** Satış yapmak istediğiniz ana kategori
- **Şirket Türü:** Şirket türünüz
- **TCKN / VKN:** Şahıs iseniz TCKN, diğer şirket türleri için VKN
- **İl-İlçe:** Faaliyet gösterdiğiniz il-ilçe bilgileri

## SMS Doğrulama
Telefon numaranıza SMS ile doğrulama kodu iletilecektir. İletilen kodu ekranda açılan pencereye girip "Kodu Onayla" butonuna tıklayın.

## Satıcı Kaydı

### 1. Şirket Bilgileri
- Mağaza Adı, Şirket Türü, VKN/TCKN, Vergi Dairesi
- Fatura Türü (Kâğıt Fatura veya E-Arşiv Fatura)
- KEP Adresi (zorunlu)
- Mersis No
- IBAN Numarası

### 2. Operasyon & İletişim Bilgileri
- Kargo Şirketi seçimi
- Fatura Adresi
- İade Depo Adresi
- Sevkiyat Depo Adresi
- İletişim Bilgileri (Finans Sorumlusu, Müşteri Hizmetleri Sorumlusu)

### 3. Başvuru Kontrolü & Ürün Yükle
- Telefon Numarası doğrulaması
- E-Posta Adresi doğrulaması
- Mersis No kontrolü
- KEP Adresi doğrulaması

Problem yaşadığınız her konuda bize satıcı çağrı merkezimizden ulaşabilirsiniz.`,
            status: 'PUBLISHED'
        },
        create: {
            title: 'Satıcı Olma Aşamaları',
            slug: 'satici-olma-asamalari',
            category: catVendorApp,
            content: 'BazarX satıcısı olmak için başvuru adımları...',
            status: 'PUBLISHED'
        }
    })

    // ═══════════════════════════════════════════════════
    // 7. Hukuki
    // ═══════════════════════════════════════════════════
    const catLegal = 'Hukuki';

    const legalArticles = [
        {
            title: 'Kullanım Koşulları',
            slug: 'kullanim-kosullari',
            status: 'PUBLISHED',
            content: `Bu internet sitesine girmeniz veya bu internet sitesindeki herhangi bir bilgiyi kullanmanız aşağıdaki koşulları kabul ettiğiniz anlamına gelir.

BazarX işbu site ve site uzantısında mevcut her tür hizmet, ürün, siteyi kullanma koşulları ile sitede sunulan bilgileri önceden bir ihtara gerek olmaksızın değiştirme, siteyi yeniden organize etme, yayını durdurma hakkını saklı tutar.

BazarX bu internet sitesinin genel görünüm ve dizaynı ile internet sitesindeki tüm bilgi, resim, marka, logo, ikon ve diğer materyallerin fikri ve sınai mülkiyet haklarının sahibi veya lisans sahibidir ve yasal koruma altındadır.`
        },
        {
            title: 'İşlem Rehberi',
            slug: 'islem-rehberi',
            status: 'PUBLISHED',
            content: `# İşlem Rehberi

BazarX platformunda yapabileceğiniz işlemlerin rehberi:

- **Alışveriş:** Ürünleri arayın, sepete ekleyin ve ödeme yapın
- **Takas:** Fazla stoklarınızı ihtiyaç duyduğunuz ürünlerle takas edin
- **Açık Artırma:** Ürünlerinizi açık artırma ile satışa çıkarın
- **Satıcı Olma:** Satıcı başvurusu yaparak ürünlerinizi satışa sunun`
        },
        {
            title: 'KVKK Aydınlatma Metni',
            slug: 'kvkk-aydinlatma',
            status: 'PUBLISHED',
            content: 'Kişisel Verilerin Korunmasına İlişkin Aydınlatma Metni için "Politikalar" sayfasını ziyaret ediniz.'
        },
        {
            title: 'Çerez Politikası',
            slug: 'cerez-politikasi-makale',
            status: 'PUBLISHED',
            content: 'Çerez Politikası detayları için "Politikalar" sayfasını ziyaret ediniz.'
        },
    ]

    for (const art of legalArticles) {
        await prisma.helpArticle.upsert({
            where: { slug: art.slug },
            update: { title: art.title, content: art.content, status: art.status, category: catLegal },
            create: { title: art.title, slug: art.slug, category: catLegal, content: art.content, status: art.status }
        })
    }

    console.log('✅ Help center seeding completed (New Schema).')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
