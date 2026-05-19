import mongoose from 'mongoose';
import { HelpArticle } from '../../packages/shared/shared-persistence/src/schemas/backend/helpArticle.schema.ts';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

async function main() {
    console.log('Start seeding help center (Mongoose)...');

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Hakkımızda
        const catAbout = 'Hakkımızda';

        await HelpArticle.findOneAndUpdate(
            { slug: 'bazarx-nedir' },
            {
                $set: {
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
            },
            { upsert: true }
        );

        // 2. Sipariş ve Kargo
        const catOrders = 'Sipariş ve Kargo';

        const orderArticles = [
            { title: 'Siparişler', slug: 'siparisler', content: 'Siparişlerinizi "Hesabım" > "Siparişlerim" sayfasından takip edebilirsiniz. Sipariş durumları: Onay Bekliyor, Hazırlanıyor, Kargoda, Teslim Edildi şeklinde güncellenir.', status: 'PUBLISHED' },
            { title: 'Kargo ve Teslimat', slug: 'kargo-teslimat', content: 'Ürünler, sipariş onayından itibaren en geç 30 gün içerisinde teslim edilir. Kargo takip numaranız sipariş detay sayfasında görüntülenebilir.', status: 'PUBLISHED' },
            { title: 'Kargo Ücreti Hesaplama', slug: 'kargo-ucreti-hesaplama', content: 'Kargo ücretleri desi ve mesafeye göre değişmektedir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.', status: 'PUBLISHED' },
        ];

        for (const art of orderArticles) {
            await HelpArticle.findOneAndUpdate(
                { slug: art.slug },
                {
                    $set: {
                        title: art.title,
                        slug: art.slug,
                        category: catOrders,
                        content: art.content,
                        status: art.status
                    }
                },
                { upsert: true }
            );
        }

        // 3. İade ve İptal
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
        ];

        for (const art of refundArticles) {
            await HelpArticle.findOneAndUpdate(
                { slug: art.slug },
                {
                    $set: {
                        title: art.title,
                        slug: art.slug,
                        category: catRefunds,
                        content: art.content,
                        status: art.status
                    }
                },
                { upsert: true }
            );
        }

        console.log('✅ Help center seeding completed (Mongoose).');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

main();
