import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {

    const policies = [
        {
            slug: 'kvkk-aydinlatma-metni',
            title: 'KVKK Aydınlatma Metni',
            type: 'privacy',
            version: '2.0',
            content: `# KİŞİSEL VERİLERİN KORUNMASINA İLİŞKİN AYDINLATMA METNİ

## 1 - Giriş

BazarX ("Şirket") olarak; kişisel verilerinizin gizliliği ve güvenliği en önemli önceliklerimiz arasındadır. Şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") düzenlemelerine ve ikincil mevzuata uyumlu bir şekilde kişisel verilerinizi işlemektedir. Kişisel verileriniz, kimliğinizi belirli ya da belirlenebilir kılan her türlü bilgi anlamına gelmektedir.

Şirketimize ait mobil uygulamalarda ve/veya internet sitelerinde (hepsi birlikte "Platform") sunulan hizmetlerden (hepsi birlikte "Platform Hizmetleri") yararlanabilmek amacıyla Üyelik Sözleşmesi'ni kabul ederek "Platform Üyesi" olmanız halinde işlenen kişisel verileriniz hakkında sizleri bilgilendirmek isteriz.

## 2 - Hangi kişisel verilerinizi işliyoruz?

Platform Üyesi olmanız halinde, aşağıdaki kişisel verileriniz işlenmektedir.

- **Kullanıcı Hesap Bilgileriniz:** adınız, soyadınız, müşteri numaranız, üyelik e-posta adresiniz ve kullanıcı bilgilerinize eklemeniz halinde telefon numaranız, cinsiyet, doğum tarihi, T.C. Kimlik Numaranız (yalnızca belli ürün gruplarını satın almanız halinde ilgili mevzuat uyarınca işlenmektedir.)
- **Müşteri İşlem Bilgileriniz:** sipariş ve fatura bilginiz, alışverişlerinizle ilgili gerçekleşen işlem geçmişi bilginiz, talep ve şikayet bilgileriniz, Platform kullanım bilgileriniz, puan ve değerlendirme bilgileriniz, chat kanalıyla yapılan konuşma içeriklerine yönelik bilgiler, iptal/iade bilgileriniz.
- **Teslimat Bilgileriniz:** sipariş verdiğiniz ürünün teslimatı için eklediğiniz telefon numarası ve teslimat adresi bilgileriniz, teslimat işlem bilgileriniz.
- **Ödeme Bilgileriniz:** tarafınızca yapılan ödemelere ve ödeme yöntemlerine ilişkin bilgileriniz, kayıtlı kart bilgileriniz.
- **İşlem Güvenliği Bilgileriniz:** cihaz bilgileriniz, IP adresi bilgisi, şifre ve parola bilgileriniz, çerez bilgileriniz, platform erişim kayıtları.
- **Hukuki İşlem Bilgileriniz:** yetkili kişi, kurum ve kuruluşlarla yazışmalardaki bilgiler, dava ve icra dosyalarındaki bilgiler, yasal bilgi talebi bilgileriniz.
- **İşitsel Kayıt Bilgileriniz:** çağrı merkeziyle görüşmeniz halinde ses kaydınız.

## 3 - Kişisel verilerinizin işlenmesinin hukuki sebepleri, amaçları ve toplama yöntemleri nelerdir?

Kişisel verileriniz, Şirketimiz tarafından tamamen veya kısmen otomatik olan ya da herhangi bir veri kayıt sisteminin parçası olmak kaydıyla otomatik olmayan yollarla, üyelik sözleşmemiz kapsamında Şirketimize ait yararlandığınız Platform Hizmeti'nin yer aldığı mobil uygulama ya da internet siteleri üzerinden elektronik ortamda toplanmaktadır.

### 3.1 Üyelik ve Hesap Oluşturma Süreci
- Üyelik sözleşmesinin kurulması ve ifasına yönelik süreçlerin yürütülmesi
- Platform üye profilinin/hesabın oluşturulması ve kapatılması süreçlerinin yönetilmesi
- İletişim bilgilerinin doğrulanması
- Platform vasıtasıyla satın alım işlemlerinizin gerçekleştirilmesine yönelik faaliyetlerin yürütülmesi

### 3.2 Sipariş, Teslimat ve İptal/İade Süreçleri
- Siparişin verilmesi ve sipariş oluşturulması
- Mesafeli satış sözleşmesinin kurulması ve ifasının sağlanması
- Teslimat ve lojistik faaliyetlerin yürütülmesi
- İptal/iade süreçlerinin yürütülmesi
- Ödeme ve fatura süreçlerinin yürütülmesi

### 3.3 Müşteri Deneyiminin İyileştirilmesi Süreçleri
- Tercihlerinize ve ilgi alanlarınıza uygun olan ürünlere hızlı ve kolay ulaşabilmenizin sağlanması
- Kullanıcı deneyimizin geliştirilmesi ve iyileştirilmesi
- Hizmet kalitemizin iyileştirilmesi
- Analiz ve raporlama çalışmalarının yapılması

### 3.4 Şirketin Bilgi Güvenliği, Risk, Denetim ve Kontrol Süreçleri
- Finans ve muhasebe süreçlerinin yürütülmesi ve denetimi
- Bilgi güvenliği süreçlerinin yürütülmesi ve şüpheli işlemlere yönelik inceleme yapılması
- Dolandırıcılıkların önlenmesi

### 3.5 Hukuki İşlemlerin Yürütülmesi Süreci
- Hukuk ve dava işlerinin yürütülmesi
- Faaliyetlerin mevzuata uygun yürütülmesi
- Talep edilmesi halinde yetkili kişi, kurum ve kuruluşlarla bilgi paylaşılması

### 3.6 Açık Rızaya Dayalı Yürütülen Süreçler
- Pazarlama, reklam ve tanıtım faaliyetlerinin yürütülmesi
- Size özel avantajlı tekliflerin sunulabilmesi

## 4 - Şirket kişisel verilerinizi kimlere hangi sebeplerle aktarıyor?

Şirketimiz, kişisel verilerinizi "bilme gereği" ve "kullanma gereği" ilkelerine uygun olarak, gerekli veri minimizasyonunu sağlayarak ve gerekli teknik ve idari güvenlik tedbirlerini alarak işlemeye özen göstermektedir.

## 5 - Şirket Kişisel Verilerinizi Nasıl Koruyor?

- Veri gizliliğini konu alan uluslararası ve ulusal teknik standartlara uygun surette periyodik aralıklarda sızma testleri yaptırılmaktadır.
- Web sitesi, mobil site ve mobil uygulama aracılığıyla Şirket'e ilettiğiniz kişisel verileriniz SSL teknolojisi kullanılarak korunmaktadır.
- Kişisel veri işleme faaliyetlerine ilişkin düzenli olarak risk analizleri yapılmaktadır.
- Kişisel verilere yetkisiz erişimleri engellemek için erişim ve yetki kontrolleri uygulanmaktadır.

## 6 - Kişisel Verilerinizin Korunmasına Yönelik Haklarınız

KVKK 11. madde uyarınca:
- Kişisel verilerinizin işlenip işlenmediğini öğrenme
- İşlenmişse buna ilişkin bilgi talep etme
- İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme
- Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
- Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme
- KVKK'da öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme

## 7 - Hak ve Talepleriniz İçin İletişim

Başvuru Yöntemi: Şahsen Yazılı Başvuru veya KEP
Adres: Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara
KEP: dsm@hs02.kep.tr
E-posta: kvkk@bazarx.com.tr

Güncellenme Tarihi: 22.08.2024`
        },
        {
            slug: 'uyelik-sozlesmesi',
            title: 'Üyelik Sözleşmesi',
            type: 'terms',
            version: '2.0',
            content: `# ÜYELİK SÖZLEŞMESİ

Bu sözleşme, BazarX platformuna üye olan kullanıcılar ile BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş. ("Şirket") arasındaki hak ve yükümlülükleri belirler.

## 1. Taraflar
- **Platform:** BazarX (www.bazarx.com.tr)
- **Üye:** Kayıt olan kullanıcı

## 2. Sözleşmenin Konusu
İşbu sözleşmenin konusu, Platform üzerinde sunulan hizmetlerden yararlanma şartlarının belirlenmesidir.

## 3. Üyelik Şartları
- Üyeler, üyelik formunda belirttikleri bilgilerin doğruluğunu taahhüt ederler.
- Her üye yalnızca bir hesap açabilir.
- 18 yaşından küçükler üyelik oluşturamazlar.

## 4. Platform Kullanımı
- BazarX, sözleşmenin ihlali, haksız fiil veya diğer sebepler neticesinde doğabilecek doğrudan ya da dolaylı hiçbir zarardan sorumlu değildir.
- BazarX işbu site ve uzantısında mevcut her tür hizmeti önceden ihtara gerek olmaksızın değiştirme, yeniden organize etme ve yayını durdurma hakkını saklı tutar.

## 5. Fikri Mülkiyet Hakları
BazarX'in genel görünüm ve dizaynı ile internet sitesindeki tüm bilgi, resim, marka, logo, ikon, yazılım ve diğer materyaller yasal koruma altındadır.

## 6. Gizlilik ve Kişisel Veriler
Üyelerin kişisel verileri, KVKK Aydınlatma Metni kapsamında işlenmektedir.

## 7. Sözleşmenin Feshi
BazarX, üyelik sözleşmesini tek taraflı olarak feshetme hakkına sahiptir.

İletişim: Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara`
        },
        {
            slug: 'cerez-politikasi',
            title: 'Çerez Politikası',
            type: 'privacy',
            version: '2.0',
            content: `# ÇEREZ POLİTİKASI

## 1. Çerezler Hakkında Genel Bilgi

BazarX ("Şirket") olarak, internet sitelerimizde ve mobil uygulamalarımızda çeşitli çerezler kullanılmaktadır. Bu çerezlerin bir kısmı teknik olarak gerekli olan çerezler olup dijital ortamlarımızın düzgün bir şekilde çalışması için zorunlu çerezlerdir.

## 2. Çerez Türleri

### Zorunlu Çerezler
Bu çerezler, dijital ortamın düzgün bir şekilde çalışması için zorunlu çerezlerdir. Oturum bilgileri, güvenlik ayarları ve dil tercihi gibi temel ayarları içerirler.

### İşlevsel Çerezler
Bu çerezler, dijital ortamın işlevselliğini artırmak için kullanılan çerezlerdir. Kullanıcı tercihlerini hatırlama ve kişiselleştirilmiş deneyim sunma amacıyla kullanılırlar.

### Performans ve Analitik Çerezler
Dijital ortamlarımızın performansını ölçmek ve iyileştirmek amacıyla kullanılan çerezlerdir. Ziyaretçi sayısı, sayfa görüntüleme ve ziyaret süresi gibi anonim istatistiksel verileri toplarlar.

### Hedefleme ve Reklam Çerezleri
Bu çerezler, sizlere ilgi alanlarınıza göre özelleştirilmiş reklamlar göstermek amacıyla kullanılmaktadır.

## 3. Çerez Tercihlerinin Yönetimi

Tarayıcı ayarlarınız aracılığıyla çerezleri silebilir ya da engelleyebilirsiniz. Bununla birlikte, çerezleri engellemek dijital ortamın bazı özelliklerinin çalışmamasına yol açabilir.

## 4. Veri Sorumlusu İletişim Bilgileri

BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş.
Adres: Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara
E-posta: kvkk@bazarx.com.tr`
        },
        {
            slug: 'kullanim-kosullari',
            title: 'Kullanım Koşulları',
            type: 'terms',
            version: '2.0',
            content: `# KULLANIM KOŞULLARI

Bu internet sitesine girmeniz veya bu internet sitesindeki herhangi bir bilgiyi kullanmanız aşağıdaki koşulları kabul ettiğiniz anlamına gelir.

Bu internet sitesine girilmesi, sitenin ya da sitedeki bilgilerin ve diğer verilerin programların vs. kullanılması sebebiyle, sözleşmenin ihlali, haksız fiil, ya da başkaca sebeplere binaen, doğabilecek doğrudan ya da dolaylı hiçbir zarardan BazarX sorumlu değildir.

BazarX işbu site ve site uzantısında mevcut her tür hizmet, ürün, siteyi kullanma koşulları ile sitede sunulan bilgileri önceden bir ihtara gerek olmaksızın değiştirme, siteyi yeniden organize etme, yayını durdurma hakkını saklı tutar. Değişiklikler sitede yayım anında yürürlüğe girer.

BazarX, sözleşmenin ihlali, haksız fiil, ihmal veya diğer sebepler neticesinde; işlemin kesintiye uğraması, hata, ihmal, kesinti, silinme, kayıp, işlemin veya iletişimin gecikmesi, bilgisayar virüsü, iletişim hatası, hırsızlık, imha veya izinsiz olarak kayıtlara girilmesi, değiştirilmesi veya kullanılması hususunda herhangi bir sorumluluk kabul etmez.

Bu internet sitesi BazarX'in kontrolü altında olmayan başka internet sitelerine bağlantı veya referans içerebilir. BazarX, bu sitelerin içerikleri veya içerdikleri diğer bağlantılardan sorumlu değildir.

BazarX bu internet sitesinin genel görünüm ve dizaynı ile internet sitesindeki tüm bilgi, resim, BazarX markası ve diğer markalar, www.bazarx.com.tr alan adı, logo, ikon, demonstratif, yazılı, elektronik, grafik veya makinede okunabilir şekilde sunulan teknik veriler, bilgisayar yazılımları, uygulanan satış sistemi, iş metodu ve iş modeli de dahil tüm materyallerin ("Materyaller") ve bunlara ilişkin fikri ve sınai mülkiyet haklarının sahibi veya lisans sahibidir ve yasal koruma altındadır.

BazarX, dilediği zaman bu yasal uyarı sayfasının içeriğini güncelleme yetkisini saklı tutmaktadır ve kullanıcılarına siteye her girişte yasal uyarı sayfasını ziyaret etmelerini tavsiye etmektedir.`
        },
        {
            slug: 'mesafeli-satis-sozlesmesi',
            title: 'Mesafeli Satış Sözleşmesi',
            type: 'return',
            version: '2.0',
            content: `# MESAFELİ SATIŞ SÖZLEŞMESİ

## 1. TARAFLAR
İşbu Mesafeli Satış Sözleşmesi ("Sözleşme"), Alıcı ve Satıcı arasında elektronik ortamda kurulmuştur.

## 2. TANIMLAR
- **BZX veya Elektronik Ticaret Aracı Hizmet Sağlayıcı:** Oluşturduğu sistem ile Satıcı'nın Ürün/Hizmet'i satışa sunduğu Platform'u işleten ve Satıcı adına mesafeli sözleşme kurulmasına aracılık eden BZX Grup Danışmanlık İletişim ve Satış Ticaret Anonim Şirketi'ni ifade eder.
- **Platform:** BZX'ye ait www.bazarx.com.tr adlı internet sitesini ve mobil uygulamasını ifade eder.
- **BazarX Teslimat Noktası:** Alıcı'nın satın aldığı Ürünler'i kolayca teslim alabildiği anlaşmalı esnaf noktalarını, kargo şubelerini ve zincir mağazalarını ifade eder.

## 3. SÖZLEŞMENİN KONUSU VE KAPSAMI
Sözleşme'nin akdedilmesi Taraflar'ın ayrı ayrı BZX ile akdetmiş oldukları sözleşmelerin hükümlerinin ifasını engellemeyecek olup, Taraflar, BZX'nin Sözleşme'ye taraf olmadığını kabul ederler.

## 4. BİLGİLER
- **Unvanı:** BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş.
- **Adresi:** Mustafa Kemal Mahallesi, Barış Sitesi, 2085 sok, no 5 Çankaya/Ankara
- **Şikâyet/Öneri Kanalları:** Platform'da yer alan "BazarX Asistan'a Sor" başlıklı alandan şikayet ve öneriler iletilebilecektir.

## 5. ÜRÜN VE TESLİMAT BİLGİLERİ
- **Teslim Şekli:** Alıcıya Teslim veya BazarX Teslimat Noktasına teslim.
- **Ödeme Tahsilatı:** Söz konusu ürün bedeli, "BAZARX ALICI GÜVENCESİ" kapsamında Satıcı adına, BZX tarafından Alıcı'dan tahsil edilmektedir.

## 6. GENEL VE ÖZEL HÜKÜMLER
- **Teslimat:** Ürün en geç 30 günlük yasal süre içerisinde teslim edilir.
- **Fikri Mülkiyet:** Platform'a ait her türlü bilgi ve içerik üzerindeki tüm fikri-sınaî haklar ve mülkiyet hakları BZX'ye aittir.

## 7. CAYMA HAKKI VE UYUŞMAZLIKLAR
- Cayma bildirimi Platform'da belirtilen BZX'ye ve/veya Satıcı'ya ait iletişim kanallarından yapılmalıdır.
- Alıcı, Sözleşme'den doğabilecek ihtilaflarda BZX'nin ve Satıcı'nın kayıtlarının kesin delil teşkil edeceğini kabul eder.

Bu sözleşme, Alıcı tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer.`
        },
        {
            slug: 'iade-ve-iptal-kosullari',
            title: 'İade ve İptal Koşulları / Cayma Hakkı',
            type: 'return',
            version: '2.0',
            content: `# CAYMA HAKKI

## Cayma Hakkı Nedir? Nasıl Kullanılır?

7/11/2013 tarihli ve 6502 sayılı Tüketicinin Korunması Hakkında Kanun'un ilgili maddelerine dayanılarak hazırlanan Mesafeli Sözleşmeler Yönetmeliği uyarınca:
- Alıcı, on dört gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.

## Cayma Hakkı Kullanılabilen Ürünleri Nasıl İade Ederim?

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
- Sağlık ve hijyen açısından uygun olmayan (kozmetik, iç giyim, kulaklık vb.) ürünlerin ancak ambalajı açılmamış ve denenmemiş olması halinde iadesi kabul edilir.

## İletişim ve Adres Bilgileri
- **Adres:** Mustafa Kemal Mahallesi, Barış Sitesi, 2085 sok, no 5 Çankaya/Ankara
- **Platform Aracı Hizmet Sağlayıcı:** BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş.`
        },
        {
            slug: 'on-bilgilendirme-formu',
            title: 'Ön Bilgilendirme Formu',
            type: 'terms',
            version: '2.0',
            content: `# ÖN BİLGİLENDİRME FORMU

## 1. TARAFLAR VE KONU
İşbu Ön Bilgilendirme Formu'nun konusu, Alıcı ve Satıcı arasındaki Sözleşme'ye ilişkin Kanun ve Yönetmelik hükümleri uyarınca bilgilendirilmesidir. ALICI, Ön Bilgilendirme Formu ve Sözleşme'ye ilişkin bilgileri üyeliğinin bağlı olduğu "Hesabım" sayfasından takip edebilecek olup değişen bilgilerini bu sayfa üstünden güncelleyebilecektir.

## 2. TANIMLAR
- **BZX veya Elektronik Ticaret Aracı Hizmet Sağlayıcı:** Oluşturduğu sistem ile Satıcı'nın Ürün/Hizmet'i satışa sunduğu Platform'u işleten BZX Grup Danışmanlık İletişim ve Satış Ticaret Anonim Şirketi'ni ifade eder.
- **Platform:** BZX'ye ait www.bazarx.com.tr adlı internet sitesini ve mobil uygulamasını ifade eder.
- **BazarX Teslimat Noktası:** Alıcı'nın satın aldığı Ürünler'i kolayca teslim alabildiği anlaşmalı esnaf noktalarını, kargo şubelerini ve zincir mağazalarını ifade eder.

## 3. ELEKTRONİK TİCARET ARACI HİZMET SAĞLAYICI BİLGİLERİ
- **Unvanı:** BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş.
- **Adresi:** Mustafa Kemal Mahallesi, Barış Sitesi, 2085 sok, no 5 Çankaya/Ankara
- **Şikâyet/Öneri Kanalları:** Platform'da yer alan "BazarX Asistan'a Sor" başlıklı alandan şikayet ve öneriler iletilebilecektir.

## 4. ÜRÜN/HİZMET BİLGİLERİ
- **Teslim Şekli:** Alıcıya Teslim veya BazarX Teslimat Noktasına teslim.
- **Ödeme Tahsilatı:** Söz konusu ürün bedeli, "BAZARX ALICI GÜVENCESİ" kapsamında Satıcı adına, BZX tarafından Alıcı'dan tahsil edilmektedir.

## 5. GENEL HÜKÜMLER
- Teslimat Noktası: Alıcı'nın sipariş esnasında Ürün'ün BazarX Teslimat Noktası'na teslim edilmesini seçmesi halinde, Ürün, en geç 30 günlük yasal süre içerisinde teslim edilecektir.
- Sorumluluk: Alıcı, banka işlem süreciyle ilgili olası gecikmelerde BZX'yi ve Satıcı'yı sorumlu tutamaz.

## 6. CAYMA HAKKI
- Bildirim: Cayma hakkı bildiriminin mevzuata uygun ve süresi içerisinde Platform'da belirtilen BZX'ye ve/veya Satıcı'ya ait iletişim kanallarından yapılması şarttır.

## 7. FİKRİ-SINAİ HAKLAR
Platform'a ait her türlü bilgi ve içerik ile bunların düzenlenmesi ve kullanımı konusundaki tüm fikri-sınai haklar ve mülkiyet hakları BZX'ye aittir.`
        },
        {
            slug: 'gizlilik-politikasi',
            title: 'Gizlilik Politikası',
            type: 'privacy',
            version: '2.0',
            content: `# GİZLİLİK POLİTİKASI

BazarX olarak verilerinizin gizliliği bizim için büyük önem taşımaktadır. Hangi verileri, nasıl ve hangi amaçlarla işlediğimiz hakkında detaylı bilgi KVKK Aydınlatma Metni'nde yer almaktadır.

Veri Sorumlusu: BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş.
Adres: Mustafa Kemal Mah. Barış Sitesi 2085 sok No 5, Çankaya/Ankara
E-posta: kvkk@bazarx.com.tr`
        },
        {
            slug: 'aydinlatma-metni',
            title: 'Aydınlatma Metni',
            type: 'privacy',
            version: '2.0',
            content: `# KİŞİSEL VERİLERİN KORUNMASI HAKKINDA AYDINLATMA METNİ

Kişisel verilerinizin gizliliği ve güvenliği en önemli önceliklerimiz arasındadır. Bu kapsamda, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesinden doğan aydınlatma yükümlülüğümüzü yerine getirmek amacıyla veri sorumlusu sıfatıyla Mustafa Kemal Mahallesi, Barış Sitesi, 2085 sok no 5 Çankaya/Ankara adresinde mukim BZX Grup Danışmanlık İletişim ve Satış Ticaret A.Ş. ("BazarX") olarak alışveriş işlemlerinizin gerçekleşmesi amacıyla işlenen kişisel verileriniz hakkında sizleri bilgilendirmek isteriz.

## Hangi kişisel verilerinizi işliyoruz?
BazarX platformları üzerinden toplanan verileriniz, KVKK Aydınlatma Metni'nde detaylı olarak açıklanmıştır.

İletişim: kvkk@bazarx.com.tr`
        },
        {
            slug: 'ticari-elektronik-ileti-bilgilendirme-metni',
            title: 'Ticari Elektronik İleti Bilgilendirme Metni',
            type: 'privacy',
            version: '2.0',
            content: `# TİCARİ ELEKTRONİK İLETİ BİLGİLENDİRME METNİ

BazarX tarafından gönderilen ticari elektronik iletiler (SMS, e-posta, bildirim) hakkında bilgilendirme.

Onayınız halinde tarafınıza kampanya, indirim, yeni ürün ve hizmet bilgilendirmeleri içeren ticari elektronik iletiler gönderilebilecektir. Bu onayınızı her zaman geri alabilirsiniz.

İletişim: kvkk@bazarx.com.tr`
        }
    ]

    // Priority 1: Fill the Policy model (This is what the Admin Panel uses)
    for (const policy of policies) {
        await prisma.policy.upsert({
            where: { slug: policy.slug },
            update: {
                title: policy.title,
                content: policy.content,
                type: policy.type,
                version: policy.version
            },
            create: policy
        })
    }

/*
    for (const policy of policies) {
        await prisma.legalDocument.upsert({
            where: { slug: policy.slug },
            update: {
                title: policy.title,
                content: policy.content,
                version: policy.version
            },
            create: {
                slug: policy.slug,
                title: policy.title,
                content: policy.content,
                version: policy.version,
                isActive: true
            }
        })
    }
*/

    console.log('✅ Legal documents and policies seeded successfully (XML-based v2)')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
