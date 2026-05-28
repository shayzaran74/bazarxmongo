import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin&directConnection=true';

const categories = [
  { name: 'Hakkımızda', slug: 'hakkimizda', order: 1 },
  { name: 'Sipariş ve Kargo', slug: 'siparis-ve-kargo', order: 2 },
  { name: 'İade ve İptal', slug: 'iade-ve-iptal', order: 3 },
  { name: 'Satıcı Rehberi', slug: 'satici-rehberi', order: 4 },
  { name: 'Satıcı Bilgi Merkezi', slug: 'satici-bilgi-merkezi', order: 5 },
  { name: 'Satıcı Başvuru', slug: 'satici-basvuru', order: 6 },
  { name: 'Yasal Metinler', slug: 'yasal-metinler', order: 7 }
];

const articles = [
  // 1. Hakkımızda
  {
    slug: 'bazarx-nedir', categorySlug: 'hakkimizda', status: 'PUBLISHED',
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
    slug: 'siparisler', categorySlug: 'siparis-ve-kargo', status: 'PUBLISHED',
    title: 'Siparişler',
    content: 'Siparişlerinizi "Hesabım" > "Siparişlerim" sayfasından takip edebilirsiniz. Sipariş durumları: Onay Bekliyor, Hazırlanıyor, Kargoda, Teslim Edildi şeklinde güncellenir.'
  },
  {
    slug: 'kargo-teslimat', categorySlug: 'siparis-ve-kargo', status: 'PUBLISHED',
    title: 'Kargo ve Teslimat',
    content: 'Ürünler, sipariş onayından itibaren en geç 30 gün içerisinde teslim edilir. Kargo takip numaranız sipariş detay sayfasında görüntülenebilir.'
  },
  {
    slug: 'kargo-ucreti-hesaplama', categorySlug: 'siparis-ve-kargo', status: 'PUBLISHED',
    title: 'Kargo Ücreti Hesaplama',
    content: 'Kargo ücretleri desi ve mesafeye göre değişmektedir. Belirli tutarın üzerindeki siparişlerde kargo ücretsizdir.'
  },
  // 3. İade ve İptal
  {
    slug: 'iade', categorySlug: 'iade-ve-iptal', status: 'PUBLISHED',
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
    slug: 'iade-faturasi', categorySlug: 'iade-ve-iptal', status: 'PUBLISHED',
    title: 'İade Faturası Düzenleme',
    content: 'Kurumsal müşterilerimiz için iade faturası düzenleme rehberi. İade işlemi tamamlandıktan sonra kurumsal fatura düzenlemesi yapılabilir.'
  },
  // 4. Satıcı Rehberi
  {
    slug: 'desi-hesaplama', categorySlug: 'satici-rehberi', status: 'PUBLISHED',
    title: 'Desi Hesaplama',
    content: 'Kargo gönderimlerinde desi nasıl hesaplanır? Formül: Uzunluk × Genişlik × Yükseklik / 3000'
  },
  {
    slug: 'kdv-hesaplama', categorySlug: 'satici-rehberi', status: 'PUBLISHED',
    title: 'KDV Hesaplama',
    content: 'Ürün fiyatlandırmada KDV hesaplama yöntemleri. KDV dahil fiyat: Net Fiyat × (1 + KDV Oranı). KDV hariç fiyat: KDV dahil fiyat / (1 + KDV Oranı).'
  },
  // 5. Satıcı Bilgi Merkezi
  {
    slug: 'bazarxda-satis-yapmak', categorySlug: 'satici-bilgi-merkezi', status: 'PUBLISHED',
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
    slug: 'satici-olma-asamalari', categorySlug: 'satici-basvuru', status: 'PUBLISHED',
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
  // 7. Yasal Metinler (Önceki Hukuki)
  {
    slug: 'aydinlatma-metni', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Aydınlatma Metni',
    content: "Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni\nGüncelleme Tarihi: 01.09.2024\nVeri Sorumlusu\nBazarX Elektronik Hizmetler ve Ticaret Anonim Şirketi (“BazarX” veya “Şirket”)\n\nİştirak\nBazarX Dağıtım Hizmetleri ve Lojistik A.Ş. (BazarXKargo)\nBazarX Ödeme Elektronik Para ve Ödeme Hizmetleri A.Ş. (BazarXPay)\nBazarX Finansman A.Ş. (BazarXFinans)\nBazarX Finansal Danışmanlık A.Ş.\n\nBazarX olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili mevzuat ve yasal düzenlemelerden kaynaklanan faaliyetlerimiz çerçevesinde kişisel verilerinizin işlenmesi, saklanması ve aktarılması ile ilgili veri sahiplerini aydınlatmak amacıyla işbu Kişisel Verilerin İşlenmesi Aydınlatma Metni’ni (“Aydınlatma Metni”) hazırladık.\n\nBunlara ek olarak internet sitemizi, mobil sitemizi ve/veya mobil uygulamamızı ziyaret etmeniz durumunda kullanılan çerez ve SDK’lar hakkında ayrıntılı bilgiler Çerez Politikası’nda yer almaktadır. Bunlar aracılığıyla işlenen kişisel veriler ise bu Aydınlatma Metni’nde açıklanmaktadır.\n\nAydınlatma Metni, BazarX tarafından yayımlandığı tarih itibariyle geçerli olacaktır. BazarX, Aydınlatma Metni’nde gerekli olduğu takdirde her zaman değişiklik yapabilir. Yapılacak değişiklikler, Aydınlatma Metni’nin https://www.bazarx.com.tr/kisisel-verilerin-korunmasi adresinde yayımlanmasıyla birlikte derhal geçerlilik kazanır.\n\n"
  },
  {
    slug: 'hakkimizda', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Hakkımızda',
    content: "<h2>Hakkımızda</h2><p>BazarX Barter Borsa sistemine hoş geldiniz. Biz kimiz...</p>"
  },
  {
    slug: 'iletisim', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'İletişim',
    content: "<h2>İletişim</h2><p>Bize ulaşmak için destek@bazarx.com adresini kullanabilirsiniz.</p>"
  },
  {
    slug: 'gizlilik-politikasi', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Gizlilik Politikası',
    content: "BazarX Elektronik Hizmetler ve Ticaret Anonim Şirketi\nÖZET\n\nAşağıda bu Gizlilik Politikası’na (“Politika”) ilişkin temel başlıkların özeti yer almaktadır.\n\nBazarX Elektronik Hizmetler ve Ticaret Anonim Şirketi (“BazarX”) olarak, kullanıcılarımıza şeffaf ve güvenli bir hizmet sunmak için değerlerimizin temelini oluşturan gizlilik ve adil veri işleme ilkelerini benimsiyoruz.\n\nBu Gizlilik Politikası aşağıdakileri açıklamaktadır:\n\nGizlilik ilkelerimiz;\nVerileri nasıl ve hangi amaçla topladığımız;\nKişisel verileri nasıl kullandığımız;\nKişisel verilerin güvenliğini sağlama yöntemlerimiz;\nKişisel verileriniz konusunda sahip olduğunuz haklar ve seçenekler.\nGİZLİLİK POLİTİKASI\n\nSon Güncelleme: 4 Haziran 2024\n\n1. Giriş\n\nBazarX olarak, yönettiğimiz resmi internet sitesi www.hepsiburada.com (“Sitemiz”) ve resmi mobil uygulamamız (birlikte, “Hizmetlerimiz”) aracılığıyla ziyaretleriniz süresince toplanan verilerin gizliliği ve güvenliği hakkında sizleri bilgilendirmek amacıyla bu Politika’yı hazırladık.\n\nBazarX tarafından yönetilmeyen bir sitede ve/veya mobil uygulamada, BazarX ait bir logonun, işaretin vb. bir görselin bulunması işbu Politika’nın ilgili site ve/veya mobil uygulama için de geçerli olduğu anlamına gelmemektedir. Bu Politika, resmi Hizmetlerimiz dışında kalan internet sitelerini ve/veya mobil uygulamaları kapsamaz.\n\n2. Gizlilik İlkelerimiz\n\nBazarX tarafından kullanımınıza sunulan Hizmetlerimiz’i ziyaret etmeniz halinde verileriniz, aşağıda yer alan temel gizlilik prensiplerine uygun olarak toplanır, işlenir ve saklanır:\n\nHukuka ve dürüstlük kurallarına uygun işleme,\nBelirli, açık ve meşru amaçlar için işleme,\nGüncel ve doğru kişisel verileri işleme,\nİşlendikleri amaçla bağlantılı, sınırlı ve ölçülü işleme,\nİlgili mevzuatta öngörülen veya işlendikleri amaç için gerekli olan süre kadar saklama,\nGizli verilere yalnızca yetkililerin erişimini sağlama,\n3. BazarX Müşteri ve Ziyaretçileri Hakkında Kişisel Verileri Hangi Amaçla ve Yöntemle Toplar?\n\nKişisel verilerinizi ürün ve hizmetlerimizi sunmak ve sürekli olarak iyileştirmek amacıyla topluyoruz.\n\nBazarX sağlanan bilgilerin doğru ve eksiksiz olduğuna ilişkin sorumluluğun Hizmetlerimiz’i ziyaret eden müşterilerimizde olduğunu önemle hatırlatmak isteriz. Sağladığınız bilgilerin hatalı ya da eksik olduğunu düşünüyorsanız, her zaman Hepsiburada’ya ulaşarak düzeltilmesini sağlayabilirsiniz.\n\nBazarX ile paylaşmayı tercih ettiğiniz veriler\n\nİnternet Sitemizi ya da mobil uygulamamızı ziyaret ettiğinizde bazı hizmetlerimizin sunulabilmesi amacıyla ve bu amaçlarla sınırlı olarak, izin verdiğiniz ölçüde ve aydınlatma metinlerimizde belirtilen şekilde kişisel verilerinizi toplarız.\n\nÇeşitli süreçlere ilişkin (örn. üyelik süreci) kişisel veri toplama faaliyetlerimiz, Müşteri Aydınlatma Metni içerisinde detaylandırılmıştır. Müşteri Aydınlatma Metni’nde yer almayan süreçler açısından ise, Hizmetlerimiz’i ziyaret eden ziyaretçilerimizi ve müşterilerimizi kişisel veri topladığımız sırada ayrıca aydınlatır, mevzuat açısından gerekli olması halinde iznini alırız.\n\nBazarX tarafından otomatik yöntemlerle toplanan veriler\n\nHizmetlerimiz’i ziyaret ettiğinizde, bazı verileriniz otomatik yöntemlerle (örn. çerezler ve/veya yazılım geliştirme seti) toplanır. Bu veriler çoğu zaman kişiyi belirleyebilecek nitelikte olmayabilir. Örneğin, cihazınıza ait veriler analiz çalışmalarımızı yürütebilmek ve kullanım metriklerini ölçümleyebilmek amacıyla toplanabilir. Bu verileri toplamaktaki amacımız, Hizmetlerimiz’i optimize edebilmek ve sizlere daha iyi ve kesintisiz bir hizmet sunabilmektir.\n\nHizmetlerimiz’i kullandığınız esnada çerezler ve benzer teknolojiler vasıtasıyla toplanan verilerinize ilişkin detaylı bilgiye Çerez Politikası’nda yer verilmiştir. Çerezlere ilişkin detaylı bilgiler, çerez yönetim paneli aracılığıyla da tarafınıza sunulmaktadır.\n\n4. BazarX Kişisel Verileri Nasıl Kullanır?\n\nKişiyi belirleyici nitelikteki kişisel verileri nasıl kullandığımıza ilişkin detaylı bilgiye internet sitemizde yer alan “Kişisel Verilerin Korunması” başlıklı sekmede yer alan detaylı metinlerimiz aracılığıyla ulaşabilirsiniz. BazarX olarak, kişisel veri işleme faaliyetlerimizde bir değişiklik olması halinde bu sekmede yer alan metinleri düzenli olarak güncellemekteyiz.\n\n5. BazarX Sağladığınız Kişisel Verilerinizi Nasıl Koruruz?\n\nKişisel verilerinizi gizli ve güvende tutmak BazarX olarak önceliğimizdir. Kişisel verilerinize hukuka aykırı olarak erişimlerin önlenmesi amacıyla çeşitli güvenlik önlemlerini alır, gözden geçirir, gerekli olması halinde önlemlerimizi iyileştiririz.\n\nBu bağlamda, aşağıdakiler dahil ancak bunlarla sınırlı olmamak üzere, en az aşağıdaki güvenlik önlemlerini almayı taahhüt ediyoruz:\n\nVerilerin aktarımının söz konusu olması halinde, kişisel bilgilerinizi korumak için şifreleme protokolleri ve yazılımları kullanırız.\nKredi kartı verileriniz açısından, Ödeme Kartı Endüstrisi Veri Güvenlik Standartlarını (PCI DSS) uygularız.\nÇeşitli mevzuatlar kapsamında alınması gereken idari, organizasyonel ve teknik tedbirleri takip eder, uygulanabilir olanları tüm çalışanlarımızla birlikte benimseriz.\nTüm yazılım ve sertifikalarımızın güncel tutarız.\nISO 27001 gibi dünya standartlarında bilgi güvenliği yönetişim süreçlerini benimseriz.\nKredi kartınızın güvenliği hakkında:\n\nBazarX yalnızca resmi internet sitemiz olan www.hepsiburada.com ya da resmi mobil uygulamamız üzerinden alışveriş yapan kredi kartı sahiplerinin güvenliğini sağlar. www.hepsiburada.com uluslararsı güvenlik standartlarına uygun ödeme altyapısını kullanmaktadır. Alışveriş sırasında kullanılan kredi kartı ile ilgili bilgiler siteden bağımsız olarak SSL (Secure Sockets Layer) protokolü ile şifrelenip sorgulanmak üzere ilgili bankaya ulaşır. Kartın kullanılabilirliği onaylandığı takdirde alışverişe devam edilir. Ayrıca kredi kartı verileri bakımından Kartlı Ödeme Endüstrisi Veri Güvenlik Standartları (PCI DSS) uygulanarak güvenlik önlemleri alınmaktadır.\n\nBazarX, bu önlemlere ek olarak ödeme aşamasında sepet tutarı, ürün türü, kartın ilk defa kullanılma durumu, daha önce işlemin 3D Secure Güvenli Ödeme ile yapılıp yapılmadığı, adres değişikliği gibi parametreler ve risk durumunu dikkate alarak, 3D Secure kontrolünün yapılıp yapılmayacağına karar verir.\n\n3D Güvenli Ödeme; internet üzerinden yapılan kredi ve banka kartı işlemleri için ek bir güvenlik katmanı olarak tasarlanmış protokoldür.\n\nBu protokolde alışveriş yapan kişi www.hepsiburada.com üzerinden ya da mobil uygulamadan kredi kartı ile ödeme işlemini gerçekleştirmek için seçimini yaptığında, kredi kartına tanımlı olan telefon numarasına ilgili banka tarafından bir kod gönderilir. Gönderilen bu kod tek kullanımlıktır ve bu nedenle başka bir zamanda kullanılamaz. İşlem, ancak kişi bankadan cep telefonuna gelen kodu girdiğinde onaylanır. Bu kodu üçüncü bir kişiyle paylaşmamalısınız. Paylaşmanız halinde, BazarX sorumluluk kabul etmeyecektir. BazarX, işlemin tamamlanamaması halinde sizden banka bilgilerinizi talep etmez.\n\nHizmetlerimiz, üçüncü tarafların internet sitelerine ait bağlantılar içerebilir. Bu gibi hallerde üçüncü taraflarca veri toplanması, işlenmesi, paylaşılması veya aktarımı sorumluluğumuzun dışındadır. Üçüncü taraf siteleri kullanımınız ve bu sitelerle veri paylaşımınız, bu sitelerdeki gizlilik politikası ve kullanım şartlarına tabi olup, BazarX tarafından sunulan işbu Politika’nın kapsamı dışındadır. Kişisel verilerinizi paylaşmadan önce, ziyaret ettiğiniz internet sitelerinin gizlilik politikalarını okumanızı öneririz.\n\nHizmetlerimiz’i kullanırken oluşturduğunuz üyelik hesabınızın güvenliği, kişisel verilerinizin korunması açısından çok önemlidir. Bu sebeple, BazarX hesabınız için oluşturduğunuz parolanızı farklı platformlarda kullanmamanızı ve belirli periyotlarla parolanızı değiştirmenizi öneriyoruz. BazarX hesabınıza üçüncü kişilerle ortak kullandığınız bir bilgisayar ya da cihazdan giriş yapmanız halinde, kullanımızı tamamladıktan sonra mutlaka oturumunuzu kapatmanızı öneriyoruz.\n\nBazarX kredi kartı ve hesap bilgilerinizi ya da kod ve parolalarınızı talep eden elektronik posta ve SMS’ler göndermez. Bu sebeple BazarX ismi ve logosu kullanılarak; kişisel bilgileriniz ile kredi kartı ve hesap bilgilerinizi, parolalarınızı talep eden e-posta ve SMS’lere kesinlikle itibar etmemeniz gerektiğini önemle hatırlatırız.\n\n6. Politika’nın Güncellenmesi\n\nİşbu Politika’nın hükümleri kısmen veya tamamen BazarX tarafından çeşitli gereksinimler sebebiyle değiştirilebilir ya da yenilenebilir. Poltika, internet sitemizde yayımlandığı tarihte yürürlüğe girer.\n\nPolitika’daki değişiklikleri takip edebilmeniz adına, internet sitemizi belirli aralıklarla kontrol etmenizi tavsiye ederiz.\n\n7. Verilerinize İlişkin Haklarınız için Bize Ulaşın\n\nİşbu Politika’nın yorumlanması veya uygulanması ile kişisel verilerinizle ilgili sorularınızı, taleplerinizi veya şikayetlerinizi;\n\nElektronik posta yoluyla kvk@hepsiburada.com adresine veya\nKuştepe Mah. Mecidiyeköy Yolu Cad. Trump Towers Kule 2 Kat:2 No:12 34387 Şişli/İstanbul adresine posta yoluyla göndererek\niletebilirsiniz.\n\nKişisel verilerinize ilişkin hangi haklarınız olduğunu ve bu haklarınızı nasıl kullanabileceğinizi Kişisel Verilerin Korunması sekmesinde ayrıntılı olarak her zaman inceleyebilirsiniz. BazarX talebinizi yerine getirebilmek amacıyla kimlik teyidi gerçekleştirme hakkını saklı tutar.\n\n8. Üyelik İptali İstenildiği Durumda Gerekli Adımlar\n\nBazarX sizlere üyeliksiz alışveriş yapma imkanı sunar. Bu çerçevede üyeliğinizi dilediğiniz zaman herhangi bir ön şart bulunmaksızın iptal edebilir, bununla birlikte alışveriş yapmaya devam edebilirsiniz. Ancak bu halde BazarX platformunda sizlere özel ve kişiselleştirilmiş bir deneyim sunmamız mümkün değildir.\n\nBazarX üyeliğinizi iptal etmek istemeniz halinde mobil uygulama üzerinden Hesabım > Ayarlarım > Üyelik Bilgisi Güncelleme sayfasının altında bulunan \"Hesabımı Sil\" alanını kullanarak talepte bulunabilirsiniz. Üyelik iptal işlemlerini gerçekleştirebilmek için dilerseniz \"0850 252 31 31\" numaralı müşteri hizmetlerimizle de iletişime geçebilirsiniz. İptal edilen üyelik yeniden aktif edilemez. Ayrıca iptal edilen üyeliğinizde yer alan kuponlarınız, kampanyalarınız ve BazarXCash bakiyeleriniz başka bir hesaba devredilemez.\n\nBununla birlikte, kişisel verilerinizin silinmesi talebinde bulunmak istemeniz halinde dilerseniz ilgili kişi başvuru formu nu kullanarak;\n\nIslak imzalı ve kimlik fotokopisi ile Kuştepe Mah. Mecidiyeköy Yolu Cad. Trump Towers Kule 2 Kat:2 No:12 34387 Şişli/İstanbul adresine göndererek,\nGeçerli bir kimlik belgesi ile birlikte D-Market Elektronik Hizmetler ve Ticaret Anonim Şirketi’ne bizzat başvurarak,\nKayıtlı elektronik posta (KEP) adresi ve güvenli elektronik imza ya da mobil imza kullanmak suretiyle dmarket@hs02.kep.tr kayıtlı elektronik posta adresimize göndererek,\nİlgili Kişi tarafından D-Market Elektronik Hizmetler ve Ticaret Anonim Şirketi’ne daha önce bildirilen ve sistemimizde kayıtlı bulunan elektronik posta adresinden kvk@hepsiburada.com adresimize göndererek\nBazarX iletebilirsiniz."
  },
  {
    slug: 'kullanim-kosullari', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Kullanım Koşulları',
    content: "<h2>Kullanım Koşulları</h2><p>Sitemizi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız...</p>"
  },
  {
    slug: 'kvkk', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'KVKK Aydınlatma Metni',
    content: "Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni\n\nGüncelleme Tarihi: 01.09.2024\nVeri Sorumlusu\nBazarX Elektronik Hizmetler ve Ticaret Anonim Şirketi (“BazarX” veya “Şirket”)\n\nİştirak\nBazarX Dağıtım Hizmetleri ve Lojistik A.Ş. (BazarXKargo)\nBazarX Ödeme Elektronik Para ve Ödeme Hizmetleri A.Ş. (BazarXCash)\nBazarX Finansman A.Ş. (BazarXFinans)\nBazarX Finansal Danışmanlık A.Ş.\n\nBazarX olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili mevzuat ve yasal düzenlemelerden kaynaklanan faaliyetlerimiz çerçevesinde kişisel verilerinizin işlenmesi, saklanması ve aktarılması ile ilgili veri sahiplerini aydınlatmak amacıyla işbu Kişisel Verilerin İşlenmesi Aydınlatma Metni’ni (“Aydınlatma Metni”) hazırladık.\n\nBunlara ek olarak internet sitemizi, mobil sitemizi ve/veya mobil uygulamamızı ziyaret etmeniz durumunda kullanılan çerez ve SDK’lar hakkında ayrıntılı bilgiler Çerez Politikası’nda yer almaktadır. Bunlar aracılığıyla işlenen kişisel veriler ise bu Aydınlatma Metni’nde açıklanmaktadır.\n\nAydınlatma Metni, BazarX tarafından yayımlandığı tarih itibariyle geçerli olacaktır. BazarX, Aydınlatma Metni’nde gerekli olduğu takdirde her zaman değişiklik yapabilir. Yapılacak değişiklikler, Aydınlatma Metni’nin https://www.bazarx.com.tr/kisisel-verilerin-korunmasi adresinde yayımlanmasıyla birlikte derhal geçerlilik kazanır.\n\n"
  },
  {
    slug: 'musteri-aydinlatma-metni', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Müşteri Aydınlatma Metni',
    content: "Müşteri Aydınlatma Metni\n\nGüncelleme Tarihi: 24.03.2026\nVeri Sorumlusu\nBazarX Market Elektronik Hizmetler ve Ticaret Anonim Şirketi (“BazarX” veya “Şirket”)\n\nİştirak\nBazarX Dağıtım Hizmetleri ve Lojistik A.Ş. (BazarXKargo)\nBazarX Ödeme Elektronik Para ve Ödeme Hizmetleri A.Ş. (BazarXCash)\nBazarX Finansman A.Ş. (BazarXFinans)\nBazarX Finansal Danışmanlık A.Ş.\n\nBazarX olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili mevzuat ve yasal düzenlemelerden kaynaklanan faaliyetlerimiz çerçevesinde kişisel verilerinizin işlenmesi, saklanması ve aktarılması ile ilgili veri sahiplerini aydınlatmak amacıyla işbu Kişisel Verilerin İşlenmesi Aydınlatma Metni’ni (“Aydınlatma Metni”) hazırladık.\n\nBunlara ek olarak internet sitemizi ve/veya mobil uygulamamızı ziyaret etmeniz durumunda kullanılan çerez ve SDK’lar (“çerezler”) hakkında ayrıntılı bilgiler Çerez Politikası’nda yer almaktadır. Çerezler aracılığıyla işlenen kişisel veriler ise bu Aydınlatma Metni’nde açıklanmaktadır.\n\nAydınlatma Metni, BazarX tarafından yayımlandığı tarih itibariyle geçerli olacaktır. BazarX, Aydınlatma Metni’nde gerekli olduğu takdirde her zaman değişiklik yapabilir. Yapılacak değişiklikler, Aydınlatma Metni’nin https://www.bazarx.com.tr/kisisel-verilerin-korunmasi adresinde yayımlanmasıyla birlikte derhal geçerlilik kazanır.\n\nKişisel Verilerinizin İşlenme Amacı, Hukuki Sebebi ve Toplanma Yöntemleri\n\nBazarX ait www.hepsiburada.com internet sitesi veya mobil uygulamamız (“Platform”) üzerinden üye kaydı oluşturarak veya “üye olmadan devam et” seçeneği ile üye olmadan alışveriş yapabilirsiniz. Üye olmadan alışveriş yapma seçeneğinden farklı olarak üyelik seçeneği; alışkanlıkları, alışveriş geçmişi, incelemeleri takip edilip değerlendirilerek kendisine özgü kişiselleştirilmiş bir hizmet almak isteyen kullanıcılar için tasarlanmıştır."
  },
  {
    slug: 'cerez-politikasi', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Çerez Politikası',
    content: "Çerez Politikası\nBu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (“Kanun”) 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ Kapsamında veri sorumlusu sıfatıyla D-Market Elektronik Hizmetler ve Ticaret A.Ş. (“BazarX”) tarafından hazırlanmıştır.\n\nBazarX olarak www.hepsiburada.com adresindeki internet sitemiz (“Site”) ile mobil uygulamamız (hepsi birlikte “Platform” olarak anılacaktır) içerisinde yer alan bazı alanlarda çerezler kullanmaktayız. Ayrıca mobil uygulamamız içerisinde, Site’de kullanılan çerezlerle benzer işlevlere sahip SDK’lar (Software Development Kit) da kullanılmaktadır. Bu Çerez Politikası (“Politika”), BazarX tarafından yönetilen Platform için geçerli olup çerezler ve SDK’lar Politika’da açıklanan şekilde kullanılacaktır.\n\nBu Politika’nın amacı, internet sitemizde kullanılan çerezlerin ve Uygulama’da kullanılan SDK’ların cihazınıza yerleştirilmesi aracılığıyla otomatik yolla elde edilen kişisel verilerin işlenmesine ilişkin olarak, hangi amaçlarla hangi tür çerezleri kullandığımızı ve bu çerezleri nasıl yönetebileceğiniz hakkında sizlere bilgi vermektir. İnternet sitemizde kullandığımız, zorunlu çerezler haricindeki çerezler için, kullanıcıların açık rızaları alınmakta ve istedikleri zaman rızalarını değiştirebilme olanağı sağlanmaktadır.\n\nKullanıcılar çerez yönetim paneli üzerinden, internet sitemizde kullanılan çerez çeşitlerini görebilmekte ve Zorunlu Çerezler dışında kalan tüm çerezler için “açık” veya “kapalı” seçenekleri ile tercihlerini belirleyebilmektedirler. Yine bu panel üzerinden kullanıcılar tercihlerini her zaman değiştirebilmektedirler.\n\nÇerez Nedir?\n\nÇerezler bir internet sitesi tarafından cihazınızda oluşturulan ve isim-değer formatında veri barındıran küçük metin dosyalarıdır. Çerezler, ziyaret ettiğiniz internet sitesinin cihazınızda bilgi saklamasını ve bu bilgilerin sonraki ziyaretleriniz sırasında kullanmasını mümkün kılmaktadır. Bir internet sitesi tarafından oluşturulan çerezler siteye erişim için kullandığınız internet tarayıcısı tarafından saklanmakta olup çerezler, ziyaretçilere ilişkin isim, cinsiyet veya adres gibi kişisel verileri içermezler. Çerezlerin içerdiği bilgilere ancak aynı internet tarayıcısını kullanmanız halinde ve yalnızca ilgili çerezi oluşturan internet sitesi alan adı (örn; www.hepsiburada.com) tarafından erişilebilmektedir.\n\nÇerezler günümüzde, internet teknolojilerinin önemli bir parçası haline gelmiştir ve temel işlevleri çevrimiçi ziyaretçinin tercihlerinin hatırlanması ve bağlantı sırasında cihazın tanınması olup neredeyse her internet sitesinde çerez kullanımı söz konusudur.\n\nÇerezleri Kim, Nasıl Gönderir?\n\nÇerezler, gezintiniz sırasında cihazınızda bulunan internet tarayıcınız (Chrome, Firefox, Safari, Edge vb. gibi) ile BazarX bünyesindeki internet sitesi sunucuları arasında kurulan iletişim vasıtasıyla gönderilmektedir.\n\nÇerez Tipleri:\n\nSahipliklerine göre:\nBirinci Taraf Çerezler\nDoğrudan ziyaret edilen web sitesi veya BazarX tarafından cihaza yerleştirilmektedir.\nÜçüncü Taraf Çerezler\nBazarX ile iş birliği içerisinde olan, reklam veren veya analitik sistem gibi üçüncü bir tarafça cihaza yerleştirilen çerezlerdir.\nAktif olduğu süreye göre:\nOturum Çerezleri\nKullanıcının tarayıcıyı kapatması veya oturumun sona ermesi süresine kadar depolanabilecek verileri sağlamaktadır. Kısa süreli çerezlerdir.\nKalıcı Çerezler\nÇerezin kullanıcı tarafından silinme tarihine kadar veya çerez için belirli son kullanma tarihine kadar sürücüde yer alan çerezlerdir. Kalıcı çerezlerin kodlarında değişken süreli, yazılı bir son kullanma tarihi vardır.\nKullanım amaçlarına göre:\nTeknik/Zorunlu Çerezler\nWeb sitesinde gezinmek ve sitenin güvenli alanlarına erişim gibi özelliklerin kullanılması için gerekli olan çerezlerdir.\nFonksiyonel Çerezleri\nWeb sitesinde geçmişte yapılan seçimlerin (kullanıcı adı bilgisi, parola bilgisi, hangi dilin tercih edildiği vb.) ne olduğunu hatırlamasını sağlar. Web sitesine otomatik girişi sağlayan tercih çerezleri, işlevsel çerezler olarak da adlandırılmaktadır.\nPerformans/Analiz Çerezleri\nİstatistik çerezleri olarak da bilinen performans çerezleri, web sitesinin kullanımına ilişkin anonim, istatistiksel veri sağlayan çerezlerdir. İstatistik çerezleri ile kullanıcının web sitesini nasıl kullandığı, ziyaret ettiği sayfalar, tıkladığı bağlantılar depolanabilmektedir. Anonim hale getirilen istatistik çerezleri, web sitesi kullanıcısını tanımlamak için kullanılmamaktadır. Bu çerezlerin amacı, web sitesini daha işlevsel hale getirmektir.\nPazarlama/Hedefleme Çerezleri\nİlgi alanlarınızın bir profilini oluşturmak ve diğer sitelerdeki alakalı reklamları göstermek amacıyla faaliyet gösteren firmalar tarafından kullanılabilen çerezlerdir.\nKişisel Verilerin Hangi Amaçlarla İşleneceği ve Hukuki Sebepler\n\nTeknik/Zorunlu çerezler, talep etmiş olduğunuz bir bilgi toplumu hizmetinin (log-in olma, form doldurma ve gizlilik tercihlerinin hatırlanması) yerine getirilebilmesi amacıyla kullanılmaktadır. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanunun 5’inci maddesinin (2) numaralı fıkrasının (c) bendi “Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması” veya (f) bendi “İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması” kapsamında işlenmektedir.\n\nFonksiyonel çerezler, internet sayfamızı daha işlevsel kılmak ve kişiselleştirmek (gizlilik tercihleriniz hariç olmak üzere diğer tercihlerinizin siteye tekrar girdiğinizde hatırlanmasını sağlamak) amaçlarıyla kullanılmaktadır. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanun’un 5’inci maddesinin (1) numaralı fıkrası kapsamında açık rızanızın alınması suretiyle işlenmektedir\n\nPerformans/Analiz Çerezleri, internet sitelerinde kullanıcıların davranışlarını analiz etmek amacıyla istatistiki ölçümüne imkân veren çerezlerdir. Bu çerezler, sitenin iyileştirilmesi için sıklıkla kullanılmakta olup bu duruma reklamların ilgili kişiler üzerindeki etkisinin ölçümü de dâhildir. İnternet sitesi sahipleri tarafından, tekil ziyaretçilerin sayısını tahmin etmek, bir internet sayfasına götüren en önemli arama motoru anahtar kelimelerini tespit etmek veya internet sitesinde gezinme durumunu izlemek için kullanılmaktadırlar. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanun’un 5’inci maddesinin (1) numaralı fıkrası kapsamında açık rızanızın alınması suretiyle işlenmektedir.\n\nPazarlama/Hedefleme çerezleri, iş ortaklarımız tarafından ilgi alanlarınıza göre profilinizin çıkarılması ve size ilgili reklamlar göstermek amacıyla kullanılmaktadır. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanun’un 5’inci maddesinin (1) numaralı fıkrası kapsamında açık rızanızın alınması suretiyle işlenmektedir.\n\nSitemizde Kullanılan Çerezlere İlişkin Bilgiler\n\nİnternet sitemizde yer alan çerezlere ilişkin bilgilere (çerez türü, çerez süresi, çerez amacı, servis sağlayıcı)\n\ninternet sitemizde yer alan çerez yönetim aracından ulaşabilirsiniz. Çerez Ayarları\n\nÇerezler;\n\nPlatform’un çalışması için gerekli temel fonksiyonları gerçekleştirmek. Örneğin, BazarX üyelerinin, ürün sepetindeki ürünlerin ziyaretleri süresince kaybolmaması. Oturum açan üyelerin Platform’da farklı sayfaları ziyaret ederken tekrar şifre girmelerine gerek kalmaması.\nPlatform’u analiz etmek ve Platform’un performansını arttırmak. Örneğin, Platform’un üzerinde çalıştığı farklı sunucuların entegrasyonu, Platform’u ziyaret edenlerin sayısının tespit edilmesi ve buna göre performans ayarlarının yapılması ya da ziyaretçilerin aradıklarını bulmalarının kolaylaştırılması.\nPlatform’un işlevselliğini arttırmak ve kullanım kolaylığı sağlamak. Örneğin, Platform üzerinden üçüncü taraf sosyal medya mecralarına paylaşımda bulunmak, Platform’u ziyaret eden ziyaretçinin daha sonraki ziyaretinde kullanıcı adı bilgisinin ya da arama sorgularının hatırlanması.\nKişiselleştirme, hedefleme ve reklamcılık faaliyeti gerçekleştirmek. Örneğin, ziyaretçilerin görüntüledikleri sayfa ve ürünler üzerinden ziyaretçilerin ilgi alanlarıyla bağlantılı reklam gösterilmesi.\namaçlarıyla kullanılmaktadır.\n\nÇerezler Aracılığıyla İşlenen Kişisel Verilerin Aktarılması\n\nÇerezler ile yürütülen faaliyetlerimiz kapsamında kişisel verileriniz; BazarX hizmetlerinin size özelleştirilerek geliştirilmesi, pazarlama faaliyetlerinin yürütülebilmesi, iş faaliyetlerinin yürütülmesi ve denetimi, mal / hizmet satın alım süreçlerinin yürütülmesi amaçları ile yurt içinde yer alan Tedarikçilerimize aktarılmaktadır.\n\nAyrıca kişisel verileriniz, performans / analitik çerezlerine onay vermeniz halinde; saklama ve arşiv faaliyetlerinin yürütülmesi amacıyla sınırlı olarak yurt dışında yerleşik üçüncü taraf altyapı sağlayıcı Google Analytics aracılığıyla yurt dışındaki sunucularda işlenecektir. Bu kapsamda; tarafınıza ait kişisel veriler, açık rızanıza dayalı olarak, gerekli teknik ve idari tedbirler alınarak, sunucuları yurt dışında bulunan hizmet sağlayıcılara aktarılacaktır.\n\nİnternet sitemizde bulunan çerez yönetim aracı aracılığıyla Hedefleme Çerezlerine onay vermeniz halinde; ilgili kişisel verileriniz, mal/hizmet satış süreçlerinin yürütülmesi, pazarlama ve analiz çalışmalarının yürütülmesi ve stratejik planlama faaliyetlerinin yürütülmesi amacıyla açık rızanıza dayalı olarak Kurumsal Müşterilerimize aktarılacaktır. Bu kapsamda; tarafınıza ait kişisel veriler, açık rızanıza dayalı olarak, gerekli teknik ve idari tedbirler alınarak, sunucuları yurt dışında bulunan hizmet sağlayıcılara aktarılacaktır.\n\nİnternet sitemizde sizlere sunulan çerez yönetiminin teknoloji alanındaki tedarikçilerimiz tarafından sağlanan programlarımız aracılığıyla gerçekleştirilmesi sebebiyle çerezlerin kullanılmasına ilişkin açık rıza vermeniz halinde tüm çerezler aracılığıyla işlenen kişisel verileriniz yurt dışında yer alan teknolojik altyapı tedarikçilerimize aktarılacaktır. Kişisel verilerinizin yurt dışına aktarımına açık rıza vermek istememeniz halinde çerez yönetim aracı ile rızalarınızı yönetebilirsiniz.\n\nÇerezlerin Yönetimi\n\nTarayıcılar genellikle çerezleri otomatik olarak kabul etmektedir. İnternet sitemizi kullanabilmek için çerez kullanımı zorunlu değildir, fakat tarayıcınızı çerezleri kabul etmemeye ayarlamanız halinde kullanıcı deneyiminizin kalitesi düşebilir ve sitelerimizin çeşitli işlevleri bozulabilir. Özellikle teknik çerezler, Site’nin temel işlevlerini yerine getirebilmesini sağlamaktadır. Teknik çerezler Site’nin teknik olarak çalışmasını tesis ettiğinden bunları kapatmanız halinde Site’de bazı fonksiyonların gereği gibi çalışmaması söz konusu olabilir.\n\nÇerez yönetim panelindeki butonları tercihinize göre açık veya kapalı konuma getirerek “Ayarları kaydet” butonuna tıklayınız. Ayarlarınızı etkin hâle getirmek için sayfayı yenileyiniz.\n\nÇerez tercihlerinizi değiştirmek için Çerez Ayarları\n\nİlgili Kişilerin Talepleri\n\n6698 sayılı Kişisel Verileri Koruma Kanunu’nun 11. maddesi kapsamındaki haklarınız ve ayrıntılı bilgi için Aydınlatma Metni’ni inceleyebilirsiniz. BazarX, çerezlerle ilgili kullanım şartlarını ve Çerez Politikası’nı değiştirme hakkını saklı tutar."
  },
  {
    slug: 'ticari-elektronik-ileti-bilgilendirme-metni', categorySlug: 'yasal-metinler', status: 'PUBLISHED',
    title: 'Ticari Elektronik İleti Bilgilendirme Metni',
    content: "Ticari Elektronik İleti Bilgilendirme Metni\n\nD-Market Elektronik Hizmetler ve Ticaret A.Ş. (“BazarX”) olarak 5809 sayılı Elektronik Haberleşme Kanunu (“EHK”), 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun (“ETK”) ve 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili mevzuat kapsamında tarafınıza ticari elektronik ileti gönderilmesi ve kişisel verilerinizin işlenmesi, saklanması ve aktarılması ile ilgili sizlere bilgi vermek amacıyla işbu Elektronik Ticari İleti Kuralları ve Bilgilendirme Metni hazırlanmıştır.\n\nBazarX ile paylaşmış olduğunuz kimlik bilgileri (ad, soyad) ve iletişim bilgileriniz (e-posta adresi, telefon numarası) ticari ileti onayı vermeniz halinde BazarX tarafından pazarlama iletişiminde kullanmak üzere, anlık/kısa mesaj, telefon, e-posta dahil rıza vermiş olduğunuz kanallar üzerinden elektronik ticari iletilerin gönderilmesi, müşteri memnuniyetine yönelik aktivitelerin yürütülmesi, pazarlama analiz çalışmalarının yürütülmesi, reklam, kampanya promosyon süreçlerinin yürütülmesi, ürün hizmetlerin pazarlama süreçlerinin yürütülmesi, müşterilere yönelik kampanyaların oluşturulması, BazarX iş ortakları tarafından BazarX müşterilerine özel fırsatların sunulması, hedef kitle belirlenmesi, müşteri hareketlerinin takip edilerek kullanıcı deneyimini arttırıcı faaliyetlerin yürütülmesi, doğrudan ve doğrudan olmayan pazarlama, kişiye özel pazarlama ve yeniden pazarlama faaliyetlerinin yürütülmesi, kişiye özel segmentasyon, hedefleme, analiz ve şirket içi raporlama faaliyetlerinin yürütülmesi, pazar araştırmaları, müşteri memnuniyeti aktivitelerinin planlanması ve icrası, BazarX'in sunduğu ürün ve hizmetlerin ilgili kişilerin beğeni, kullanım alışkanlıkları ve ihtiyaçlarına göre özelleştirilerek ilgili kişilere önerilmesi ve tanıtılması ile müşteri ilişkileri yönetimi süreçlerinin planlanması ve icrası amaçları da dahil olmak üzere genel anlamda BazarX ve iştiraklerinin ürün ve/veya hizmetlerinin pazarlama süreçlerinin planlanması ve icrası, BazarX ve iştiraklerinin sunduğu ürün ve/veya hizmetlere bağlılık oluşturulması ve/veya arttırılması süreçlerinin planlanması ve icrası amaçlarıyla sınırlı olarak ETK’nın 6. maddesi gereğince ticari elektronik ileti onay şartına ve elektronik ticari ileti gönderimi faaliyetiyle sınırlı olarak KVKK’nın 5. maddesinin 1. fıkrası gereğince açık rıza hukuki sebebine dayanılarak işlenecektir.\n\nElektronik ticari ileti gönderimine ilişkin onayınızı dilediğiniz zaman geri alabilirsiniz.\n\nBazarX Elektronik Hizmetler ve Ticaret A.Ş. tarafından kişisel verileriniz yukarıda belirtilen amaçlarla sınırlı olarak doğrudan veya veri işleyenleri aracılığıyla kullanılacak, teknolojik altyapı tedarikçilerimiz ile paylaşılabilecektir.\n\nVeri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e göre KVKK’nın 11. maddesinde sayılan haklarınız mevcut olup, işlenen kişisel verilerinize ilişkin hak ve talepleriniz ile ilgili başvuru yöntemlerine https://www.bazarx.com.tr/kisisel-verilerin-korunmasi#basvuru-formu adresinde yer alan Kişisel Verilerin Korunması Başvuru Formu’ndan ulaşabilirsiniz."
  }
];

async function main() {
  console.log('✅ MongoDB bağlantısı kuruluyor...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("bazarxmongo");

  console.log('🗑️  Eski kategori ve makale verileri temizleniyor...');
  await db.collection("help_categories").deleteMany({});
  await db.collection("help_articles").deleteMany({});

  console.log(`🚀 ${categories.length} kategori yükleniyor...\n`);
  const catSlugToId = {};
  
  for (const cat of categories) {
    const catId = new ObjectId().toString();
    catSlugToId[cat.slug] = catId;
    await db.collection("help_categories").insertOne({
      _id: catId,
      id: catId,
      name: cat.name,
      slug: cat.slug,
      language: "tr",
      order: cat.order,
      isActive: true,
      platform: "BAZARX",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`  📁 [Kategori] ${cat.name} (${catId})`);
  }

  console.log(`\n🚀 ${articles.length} yardım makalesi yükleniyor...\n`);
  
  let count = 0;
  for (const art of articles) {
    const catId = catSlugToId[art.categorySlug];
    if (!catId) {
      console.warn(`  ⚠️ Kategori bulunamadı: ${art.categorySlug} (${art.title})`);
      continue;
    }
    
    const artId = new ObjectId().toString();
    await db.collection("help_articles").insertOne({
      _id: artId,
      id: artId,
      title: art.title,
      slug: art.slug,
      content: art.content,
      categoryId: catId,
      language: "tr",
      order: count,
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
      platform: "BAZARX",
      status: art.status,
      isActive: true,
      isPopular: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`  ✅ [Makale] ${art.title} -> ${art.categorySlug}`);
    count++;
  }

  console.log(`\n🎉 Yardım makaleleri seed tamamlandı! Toplam: ${count} makale`);
  await client.close();
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});
