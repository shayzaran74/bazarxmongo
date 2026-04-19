import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {

    const contents = [
        {
            key: 'doc-commission-sanayitakas',
            title: 'TicariTakas Komisyon Detayları',
            category: 'help',
            contentType: 'text',
            content: "TicariTakas, satıcı dostu politikalarıyla düşük komisyon oranları sunar. Kategorilere göre değişen oranlar genellikle %5 ile %20 arasındadır. Detaylı bilgi için satıcı panelini ziyaret ediniz."
        },
        {
            key: 'doc-commission-amazon',
            title: 'Amazon Komisyon Detayları',
            category: 'help',
            contentType: 'text',
            content: `Amazon Komisyonu Nedir? Amazon komisyonu, satıcıların platform üzerindeki satışlarından alınan bir ücrettir. Bu ücret, satılan ürünün türüne, kategorisine ve bazen de satış fiyatına göre farklılık gösterebilmektedir.

Amazon Komisyon Oranları Ne Kadardır? Amazon, satış yapılan ürünün kategorisine bağlı olarak %6'dan %20'ye kadar değişen komisyon oranları uygulamaktadır. Bu oranlar, ürünün kategorisine, belirlenen fiyat aralığına ve satıcının türüne göre farklılık göstermektedir. Örneğin, mobilya kategorisinde %20, elektronik ve bilgisayarlar için %6, giyim için %15 gibi oranlar mevcuttur. Amazon komisyonlarına ait detaylı bilgi için Amazon ücretlendirme sayfasını ziyaret edebilirsiniz.

Amazon Neden Komisyon Alıyor? Amazon, satıcıların platform üzerindeki satışlarından komisyon alarak, bu geliri platformun işletilmesi, bakımı, güçlü pazarlama faaliyetleri, lojistik/depolama hizmetleri, müşteri hizmetleri, güvenlik, sürekli teknolojik yenilik ve gelişmeler gibi çeşitli hizmetlerin finansmanında kullanır. Bu komisyon sistemi, Amazon'un geniş müşteri tabanına erişim sağladığı satıcılar için değerli hizmetler sunarken, aynı zamanda şirketin kârlılığını ve uzun vadeli sürdürülebilirliğini de desteklemektedir.

Amazon Komisyonları Neden Değişkenlik Gösteriyor? Amazon komisyonlarının değişkenlik göstermesinin birkaç temel sebebi bulunmaktadır. Bu farklılıkların ana nedenleri arasında ürün kategorilerinin çeşitliliği, satış fiyatlarının farklılıkları ve coğrafi konumlar yer almaktadır. Ayrıca, her bir ürün kategorisi, farklı işlem maliyetleri, rekabet durumu ve kâr marjlarına göre belirlenen ayrı bir komisyon oranına sahiptir.

Amazon Komisyonu Nasıl Hesaplanır? Amazon'da komisyon hesaplama, ürün kategorisine bağlı olarak değişen oranlar üzerinden yapılır. Örneğin, elektronik kategorisinde %8 komisyon oranı varsa ve ürününüz 500 TL ise, komisyon tutarı 500 TL x %8 = 40 TL olacaktır.

Amazon Ne Kadar Komisyon Alıyor? Amazon'da her ürün kategorisi için farklı komisyon oranları uygulanmaktadır. Bu oranlar genellikle %6 ile %45 arasında değişirken, en sık rastlanan oranlar yaklaşık %15 civarındadır. Kitaplar, elektronik ürünler ve giysiler gibi bazı kategoriler, daha düşük ya da daha yüksek oranlara tabii olabilmektedir. Ek olarak, Amazon, çeşitli coğrafi bölgelerde faaliyet gösterirken, bu bölgelere göre değişen komisyon oranları belirleyebilmektedir.

Amazon FBA Kullanımının Komisyon Üzerindeki Etkisi Nedir? Amazon FBA (Fulfillment by Amazon), Amazon'un depolama, paketleme ve nakliye hizmetleri için kullanılan bir hizmettir. FBA kullanmak, doğrudan komisyon oranlarınızı etkilemez; ancak ek maliyetler getirir. Bu hizmet için Amazon, depolama ücretleri ve her ürünün sevkiyatı için işlem ücretleri almaktadır. Dolayısıyla, FBA kullanımı toplam maliyetinizi artırabilir, ancak bu hizmet sayesinde lojistik süreçlerini yönetmeniz kolaylaşır ayrıca, daha hızlı teslimat gibi avantajları da beraberinde getirir.`
        },
        {
            key: 'doc-commission-trendyol',
            title: 'Trendyol Komisyon Detayları',
            category: 'help',
            contentType: 'text',
            content: `Trendyol Komisyonu Nedir? Trendyol komisyonu, Trendyol pazar yerinde satılan her ürün üzerinden satıcıdan alınan hizmet bedelidir. Bu komisyon, Trendyol’un sağladığı altyapı, ödeme ve kargo entegrasyonu, müşteri erişimi ve pazaryeri görünürlüğü gibi hizmetlerin karşılığı olarak alınır.

Trendyol Komisyon Oranları Nelerdir? Trendyol’da komisyon oranı, satılan ürünün ait olduğu kategoriye göre değişkenlik gösterir. Genel aralık, %5 ile %30 arasındadır. Örnek vermek gerekirse, elektronik ürünlerde oranlar %6-%15 aralığındadır. Moda, giyim, ayakkabı ve çanta gibi kategorilerde ise bu oranlar %10-%25 aralığında değişmektedir.

Trendyol Satıcı Komisyonunu Hesaplamak için Hangi Formül Kullanılır? Trendyol'da satış yapmak istiyor veya halihazırda yapıyorsanız, satıcı komisyonunu hesaplamak için "Komisyon = Satış Fiyatı x Komisyon Oranı" formülünü kullanabilirsiniz.

Trendyol Komisyon Kesintisi Nasıl Tahsil Edilmektedir? Satıcılara yapılacak olan ödemeler, kayıtlı banka hesabına havale edilir. Trendyol tarafından gerçekleştirilen komisyon kesintileri için satıcılarla bir e-arşiv faturası paylaşılır. Bu süreçte Trendyol komisyon ücreti tahsil etme işlemleri tamamlanır. Herhangi bir siparişin iadesi gerçekleşirse, kesilen komisyon ücreti otomatik olarak satıcıya iade edilir.

Trendyol Komisyonuna Kargo Dahil mi? Trendyol, ürün satış fiyatı üzerinden komisyon ve hizmet bedeli olmak üzere bazı ana giderleri kesmektedir. Ürün satış fiyatı üzerinden kesilen giderler gibi kargo ücreti de platform tarafından kesilir. Böylelikle satış fiyatından kalan tutar, banka hesabınıza yatırılır. Hesaplamalar sonucu belirlenen KDV tutarını ise ay sonunda devlete ödemeniz gerekir.

Trendyol Komisyon İndirimi Uyguluyor mu? Trendyol’da satıcılara yönelik kalıcı bir komisyon indirimi uygulaması bulunmaz ve komisyon oranları kategori bazlı olarak herkese standart şekilde uygulanır.

Trendyol Komisyon Hesaplama Nasıl Yapılır? Trendyol komisyonu, satılan ürünün KDV hariç satış fiyatı üzerinden belirlenir ve bu nedenle doğru bir fiyatlandırma için KDV hesaplama sürecinin dikkate alınması gerekir. Komisyon tutarı, ürünün bu net fiyatının kategoriye ait komisyon oranı ile çarpılmasıyla elde edilir. Örneğin 500 TL’lik bir ürünün komisyon oranı %10 ise satıcıdan 50 TL komisyon kesilir. Bu yüzden fiyatlandırma yaparken ürünün kategorisi, komisyon oranı ve KDV ayrımı birlikte değerlendirilmelidir.

Trendyol'da Komisyon Nasıl Ödenir? Trendyol’da bir satış tamamlandıktan ve sipariş süreci onaylandıktan sonra, sözleşmede belirtilen süre içinde ilgili kategorinin komisyon oranı uygulanır ve bu tutar satış bedelinden düşülerek satıcıya ödeme yapılır.

Trendyol Komisyonu Ürün Başına mı Alır? Trendyol, satıcılardan aldığı komisyon oranlarını ürün başına temin eder. Ayrıca her ürün kategorisi için farklı komisyon oranları bulunur.

Trendyol’da Ürün Satışında Faturayı Kim Kesiyor? Trendyol üzerinden satış yapan işletmeler, mali mühüre sahip olmalıdır. Yalnızca bu sayede e-Fatura işlemleri gerçekleştirilebilir. İşletmelerin mali mühüre sahip olması için, Gelir İdaresi Başkanlığı (GİB)’na başvurması gerekir. Trendyol üzerinden gerçekleştirilen satışlardan sonra, Gelir İdaresi Başkanlığı tarafından sağlanan online e-Fatura kesme portalı veya özel entegrasyonlar ile e-Fatura uygulaması aracılığında fatura kesim işlemleri yapılabilir.

Kampanya Dönemlerinde Trendyol Komisyon Oranları Değişir mi? Hayır, Trendyol’un belirlediği komisyon oranlarını kampanya dönemlerinde değişmez. Komisyon oranları kategori bazlı olarak belirlenir ve kampanyalardan bağımsız şekilde uygulanır.`
        },
        {
            key: 'doc-desi',
            title: 'Desi Hesaplama Rehberi',
            category: 'help',
            contentType: 'text',
            content: `Desi Ne Demek?
Desi, bir kargo paketinin hacimsel ağırlığını ifade eden ölçü birimidir. Özellikle hafif fakat büyük hacimli ürünlerde gerçek ağırlık yerine desi dikkate alınır, böylece lojistik süreçleri daha adil ve standart bir şekilde fiyatlandırılır.

Desi Hesaplama Nedir?
Desi hesaplama, bir gönderinin hacimsel ağırlığını belirlemek için kullanılan matematiksel işlemdir. Kutu uzunluğu, genişliği ve yüksekliği ölçülerek standart formül üzerinden hacimsel değer oluşturulur.

Desi Hesaplama Formülü Nedir?
Standart formül: Uzunluk × Genişlik × Yükseklik / 3000

Yurtdışı Gönderilerinde Desi Hesaplama Farklı mıdır?
Yurtdışı gönderilerinde desi hesaplama prensibi aynı kalsa da kullanılan bölme katsayısı genellikle 5000 veya 6000 gibi daha yüksek değerlerdir.

1 Desi Kaç Santimetre (cm)?
1 desinin santimetre cinsinden karşılığı, desi formülüne göre 30 × 20 × 5 cm ölçülerine denk gelir.

Desi Kargo Ücretini Nasıl Etkiler?
Desi, kargo ücretlerinin belirlenmesinde en belirleyici unsurlardan biridir. Paket hafif olsa bile büyük hacme sahipse daha yüksek desi değeri çıkar ve bu durum gönderim maliyetini artırır.

1 Desi Kaç Kilogramdır?
1 desi, kargo firmalarının fiyatlandırma sistemlerinde genellikle 1 kilogram olarak kabul edilir.

Desi Değerini Küçültmek Kargo Maliyetlerini Azaltır mı?
Evet, desi değerini küçültmek kargo maliyetlerini azaltacaktır. Bunun için hacimsel olarak mümkün oldukça küçük paket ve ambalajları tercih etmek gerekmektedir.`
        }
    ]

    for (const content of contents) {
        await prisma.dynamicContent.upsert({
            where: { key: content.key },
            update: content,
            create: content
        })
    }

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
