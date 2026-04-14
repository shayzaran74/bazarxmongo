<template>
  <div class="space-y-8">
    <!-- Calculator Card -->
    <div class="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <!-- Header from Reference -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
        <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
          <CalculatorIcon class="w-7 h-7" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">
            Komisyon Hesaplama
          </h2>
          <p class="text-sm text-gray-500">
            Pazar yerlerine göre net kazancınızı hesaplayın
          </p>
        </div>
      </div>

      <div class="p-8">
        <!-- Platform Tabs -->
        <div class="flex flex-wrap gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-xl">
          <button
            v-for="p in platforms"
            :key="p.id"
            :class="{ 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5': selectedPlatform === p.id, 'text-gray-500 hover:text-gray-700 hover:bg-white/50': selectedPlatform !== p.id }"
            class="flex-1 min-w-[120px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200"
            @click="selectedPlatform = p.id"
          >
            {{ p.name }}
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <!-- Inputs -->
          <div class="lg:col-span-5 space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Satış Fiyatı (KDV Dahil)</label>
              <div class="relative">
                <input
                  v-model.number="price"
                  type="number"
                  class="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-semibold text-gray-900"
                  placeholder="0.00"
                >
                <span
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold"
                >TL</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
              <div class="relative">
                <select
                  v-model="selectedCategoryRate"
                  class="w-full pl-4 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-semibold text-gray-900 appearance-none"
                >
                  <option
                    v-for="cat in currentPlatformCategories"
                    :key="cat.name"
                    :value="cat.rate"
                  >
                    {{ cat.name }} (%{{ cat.rate }})
                  </option>
                </select>
                <ChevronDownIcon
                  class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Kargo Gideri (Opsiyonel)</label>
              <div class="relative">
                <input
                  v-model.number="shippingCost"
                  type="number"
                  class="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all font-semibold text-gray-900"
                  placeholder="0.00"
                >
                <span
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold"
                >TL</span>
              </div>
            </div>
          </div>

          <!-- Summary / Results -->
          <div
            class="lg:col-span-7 bg-gray-50 rounded-2xl p-6 lg:p-8 flex flex-col justify-center border border-gray-100"
          >
            <div class="space-y-4">
              <div class="flex items-center justify-between text-gray-600">
                <span class="font-medium">Satış Fiyatı</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(price || 0) }}</span>
              </div>
              <div class="flex items-center justify-between text-red-500">
                <span class="font-medium">Komisyon Tutarı (%{{ selectedCategoryRate }})</span>
                <span class="font-bold">-{{ formatCurrency(commissionAmount) }}</span>
              </div>
              <div class="flex items-center justify-between text-red-400">
                <span class="font-medium">Kargo Maliyeti</span>
                <span class="font-bold">-{{ formatCurrency(shippingCost || 0) }}</span>
              </div>
              <div class="h-px bg-gray-200 my-4" />
              <div class="flex items-center justify-between">
                <div>
                  <span class="block text-2xl font-black text-gray-900">Net Kazanç</span>
                  <span class="text-xs text-gray-500 font-medium">*Tahmini hesaptır</span>
                </div>
                <span class="text-3xl font-black text-green-600">{{ formatCurrency(netEarnings)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info / Docs Section -->
    <div
      v-if="currentPlatformDoc"
      class="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 lg:p-10"
    >
      <div class="flex items-center gap-3 mb-6">
        <InformationCircleIcon class="w-6 h-6 text-orange-500" />
        <h3 class="text-lg font-bold text-gray-900">
          {{ platforms.find(p => p.id === selectedPlatform)?.name }} Komisyon Bilgileri
        </h3>
      </div>
      <div class="prose prose-orange max-w-none text-sm text-gray-600 whitespace-pre-line leading-relaxed">
        {{ currentPlatformDoc }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from '#imports'
import CalculatorIcon from '@heroicons/vue/24/outline/CalculatorIcon'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import InformationCircleIcon from '@heroicons/vue/24/outline/InformationCircleIcon'

const price = ref(1000)
const shippingCost = ref(35)
const selectedPlatform = ref('ticaritakas')
const selectedCategoryRate = ref(10)

const platforms = [
    { id: 'ticaritakas', name: 'TicariTakas' },
    { id: 'amazon', name: 'Amazon' },
    { id: 'trendyol', name: 'Trendyol' },
    { id: 'hepsiburada', name: 'Hepsiburada' },
    { id: 'n11', name: 'n11' },
    { id: 'ciceksepeti', name: 'Çiçeksepeti' }
]

const categoryRates = {
    ticaritakas: [
        { name: 'Genel / Diğer', rate: 10 },
        { name: 'Giyim & Moda', rate: 20 },
        { name: 'Elektronik', rate: 5 },
        { name: 'Ev & Yaşam', rate: 15 },
    ],
    amazon: [
        { name: 'Mobilya', rate: 20 },
        { name: 'Elektronik & Bilgisayar', rate: 6 },
        { name: 'Giyim', rate: 15 },
        { name: 'Kişisel Bakım', rate: 10 },
        { name: 'Diğer Her Şey', rate: 15 }
    ],
    trendyol: [
        { name: 'Elektronik', rate: 10 },
        { name: 'Moda & Giyim', rate: 20 },
        { name: 'Ayakkabı & Çanta', rate: 22 },
        { name: 'Ev & Yaşam', rate: 18 },
        { name: 'Kozmetik', rate: 16 }
    ],
    hepsiburada: [
        { name: 'Telefon', rate: 5 },
        { name: 'Bilgisayar', rate: 9 },
        { name: 'Elektronik Aksesuar', rate: 18 },
        { name: 'Giyim & Ayakkabı', rate: 18 },
        { name: 'Mobilya', rate: 22 },
        { name: 'Altın & Mücevher', rate: 4 }
    ],
    n11: [
        { name: 'Bilgisayar', rate: 6 },
        { name: 'Telefon Aksesuarları', rate: 12 },
        { name: 'Giyim', rate: 20 },
        { name: 'Kozmetik', rate: 13 },
        { name: 'Mücevher & Saat', rate: 15 }
    ],
    ciceksepeti: [
        { name: 'Tasarım Çiçek', rate: 30 },
        { name: 'Yenebilir Çiçek', rate: 15 },
        { name: 'Hediyelik Eşya', rate: 20 },
        { name: 'Kişisel Bakım', rate: 15 }
    ]
}

const currentPlatformCategories = computed(() => {
    return categoryRates[selectedPlatform.value] || []
})

watch(selectedPlatform, () => {
    if (currentPlatformCategories.value.length > 0) {
        selectedCategoryRate.value = currentPlatformCategories.value[0].rate
    }
}, { immediate: true })

// Raw Text Data extracted from documents
const platformDocs = {
    ticaritakas: "TicariTakas, satıcı dostu politikalarıyla düşük komisyon oranları sunar.\n\nKategorilere göre değişen oranlar genellikle %5 ile %20 arasındadır. Detaylı bilgi için satıcı panelini ziyaret ediniz.",
    amazon: `Amazon Komisyonu Nedir? Amazon komisyonu, satıcıların platform üzerindeki satışlarından alınan bir ücrettir. Bu ücret, satılan ürünün türüne, kategorisine ve bazen de satış fiyatına göre farklılık gösterebilmektedir.\n\nAmazon Komisyon Oranları Ne Kadardır? Amazon, satış yapılan ürünün kategorisine bağlı olarak %6'dan %20'ye kadar değişen komisyon oranları uygulamaktadır. Bu oranlar, ürünün kategorisine, belirlenen fiyat aralığına ve satıcının türüne göre farklılık göstermektedir. Örneğin, mobilya kategorisinde %20, elektronik ve bilgisayarlar için %6, giyim için %15 gibi oranlar mevcuttur. Amazon komisyonlarına ait detaylı bilgi için Amazon ücretlendirme sayfasını ziyaret edebilirsiniz.\n\nAmazon Neden Komisyon Alıyor? Amazon, satıcıların platform üzerindeki satışlarından komisyon alarak, bu geliri platformun işletilmesi, bakımı, güçlü pazarlama faaliyetleri, lojistik/depolama hizmetleri, müşteri hizmetleri, güvenlik, sürekli teknolojik yenilik ve gelişmeler gibi çeşitli hizmetlerin finansmanında kullanır. Bu komisyon sistemi, Amazon'un geniş müşteri tabanına erişim sağladığı satıcılar için değerli hizmetler sunarken, aynı zamanda şirketin kârlılığını ve uzun vadeli sürdürülebilirliğini de desteklemektedir.\n\nAmazon Komisyonları Neden Değişkenlik Gösteriyor? Amazon komisyonlarının değişkenlik göstermesinin birkaç temel sebebi bulunmaktadır. Bu farklılıkların ana nedenleri arasında ürün kategorilerinin çeşitliliği, satış fiyatlarının farklılıkları ve coğrafi konumlar yer almaktadır. Ayrıca, her bir ürün kategorisi, farklı işlem maliyetleri, rekabet durumu ve kâr marjlarına göre belirlenen ayrı bir komisyon oranına sahiptir.\n\nAmazon Komisyonu Nasıl Hesaplanır? Amazon'da komisyon hesaplama, ürün kategorisine bağlı olarak değişen oranlar üzerinden yapılır. Örneğin, elektronik kategorisinde %8 komisyon oranı varsa ve ürününüz 500 TL ise, komisyon tutarı 500 TL x %8 = 40 TL olacaktır.\n\nAmazon Ne Kadar Komisyon Alıyor? Amazon'da her ürün kategorisi için farklı komisyon oranları uygulanmaktadır. Bu oranlar genellikle %6 ile %45 arasında değişirken, en sık rastlanan oranlar yaklaşık %15 civarındadır. Kitaplar, elektronik ürünler ve giysiler gibi bazı kategoriler, daha düşük ya da daha yüksek oranlara tabii olabilmektedir. Ek olarak, Amazon, çeşitli coğrafi bölgelerde faaliyet gösterirken, bu bölgelere göre değişen komisyon oranları belirleyebilmektedir.`,
    trendyol: `Trendyol Komisyonu Nedir?Trendyol komisyonu, Trendyol pazar yerinde satılan her ürün üzerinden satıcıdan alınan hizmet bedelidir. Bu komisyon, Trendyol’un sağladığı altyapı, ödeme ve kargo entegrasyonu, müşteri erişimi ve pazaryeri görünürlüğü gibi hizmetlerin karşılığı olarak alınır.\n\nTrendyol Komisyon Oranları Nelerdir?Trendyol’da komisyon oranı, satılan ürünün ait olduğu kategoriye göre değişkenlik gösterir. Genel aralık, %5 ile %30 arasındadır. Örnek vermek gerekirse, elektronik ürünlerde oranlar %6-%15 aralığındadır. Moda, giyim, ayakkabı ve çanta gibi kategorilerde ise bu oranlar %10-%25 aralığında değişmektedir.\n\nTrendyol Satıcı Komisyonunu Hesaplamak için Hangi Formül Kullanılır?Trendyol'da satış yapmak istiyor veya halihazırda yapıyorsanız, satıcı komisyonunu hesaplamak için "Komisyon = Satış Fiyatı x Komisyon Oranı" formülünü kullanabilirsiniz.\n\nTrendyol Komisyon Kesintisi Nasıl Tahsil Edilmektedir?Satıcılara yapılacak olan ödemeler, kayıtlı banka hesabına havale edilir. Trendyol tarafından gerçekleştirilen komisyon kesintileri için satıcılarla bir e-arşiv faturası paylaşılır. Bu süreçte Trendyol komisyon ücreti tahsil etme işlemleri tamamlanır. Herhangi bir siparişin iadesi gerçekleşirse, kesilen komisyon ücreti otomatik olarak satıcıya iade edilir.\n\nTrendyol Komisyonuna Kargo Dahil mi?Trendyol, ürün satış fiyatı üzerinden komisyon ve hizmet bedeli olmak üzere bazı ana giderleri kesmektedir. Ürün satış fiyatı üzerinden kesilen giderler gibi kargo ücreti de platform tarafından kesilir. Böylelikle satış fiyatından kalan tutar, banka hesabınıza yatırılır. Hesaplamalar sonucu belirlenen KDV tutarını ise ay sonunda devlete ödemeniz gerekir.\n\nTrendyol Komisyon İndirimi Uyguluyor mu?Trendyol’da satıcılara yönelik kalıcı bir komisyon indirimi uygulaması bulunmaz ve komisyon oranları kategori bazlı olarak herkese standart şekilde uygulanır.\n\nTrendyol Komisyon Hesaplama Nasıl Yapılır?Trendyol komisyonu, satılan ürünün KDV hariç satış fiyatı üzerinden belirlenir ve bu nedenle doğru bir fiyatlandırma için KDV hesaplama sürecinin dikkate alınması gerekir. Komisyon tutarı, ürünün bu net fiyatının kategoriye ait komisyon oranı ile çarpılmasıyla elde edilir. Örneğin 500 TL’lik bir ürünün komisyon oranı %10 ise satıcıdan 50 TL komisyon kesilir. Bu yüzden fiyatlandırma yaparken ürünün kategorisi, komisyon oranı ve KDV ayrımı birlikte değerlendirilmelidir.\n\nTrendyol'da Komisyon Nasıl Ödenir?Trendyol’da bir satış tamamlandıktan ve sipariş süreci onaylandıktan sonra, sözleşmede belirtilen süre içinde ilgili kategorinin komisyon oranı uygulanır ve bu tutar satış bedelinden düşülerek satıcıya ödeme yapılır.\n\nTrendyol Komisyonu Ürün Başına mı Alır?Trendyol, satıcılardan aldığı komisyon oranlarını ürün başına temin eder. Ayrıca her ürün kategorisi için farklı komisyon oranları bulunur.`,
    hepsiburada: `Hepsiburada Komisyonu Nedir?Hepsiburada komisyonu, satıcıların Hepsiburada platformu üzerindeki ürün satışlarından alınan bir bedeldir. Bu oran, genellikle ürünün satış değerine göre ayarlanır ve Hepsiburada'nın sunduğu hizmetlerin karşılığı olarak alınır.\n\nHepsiburada Komisyon Oranları Nelerdir?2023 yılında Hepsiburada'da satılan ürünler için komisyon oranları aşağıdaki gibidir:Altın %4, aksesuarlar, çantalar, ayakkabılar ve giysiler %18, parfümler %15, spor ve dış, mekan ürünleri %5 ile %13, taraftar ürünleri ve cep telefonları %18, cep telefonları %4,5 ile %7, bilgisayarlar %6 ile %15, fotoğraf makinesi ve kameralar %5 ile %15, oto aksesuarları %9 ile %18, televizyonlar %6, anne ve bebek ürünleri %12,5 ile %16, cilt bakımı ve makyaj ürünleri %15, petshop ürünleri %13 ile %15, sağlık ve kişisel bakım ürünleri %15, ev bakımı ve temel tüketim ürünleri %12,5, bahçe ürünleri %9 ile %20, yapı market ürünleri %14 ile %18, ev tekstili, mobilya ve züccaciye %18, mobilyada %22, oyuncaklar %16, cep telefonu aksesuarları %12,5 ile %23, film, kitap, müzik ve kırtasiye ürünleri %8,5 ile %15, oyun konsolları %5 ile %15, hobi oyunlar %16, NON Smart TV ürünler %10 ile %20, dijital ürünler %8,5 ile %10.\n\nNeden Hepsiburada Komisyon Hesaplama Aracını Kullanmalıyım?Hepsiburada komisyon hesaplama aracı, satıcılara, satışlarını yönetmeleri için ihtiyaç duydukları tüm bilgileri tek bir yerde sunar. Bu araç, satış komisyonunu doğru bir şekilde hesaplar, satıcıların gelirlerini ve fiyat politikalarını belirlemelerine yardımcı olur. Ayrıca Hepsiburada komisyon hesaplama aracı, satış işlemlerinin takibini kolaylaştırarak, satıcıların satışlarını daha doğru, daha verimli ve daha kârlı bir şekilde yönetmelerine yardımcı olur.\n\nHepsiburada Komisyonu Nasıl Ödenir?Hepsiburada'da komisyon ücreti, satış işlemi gerçekleştiğinde otomatik olarak tahsil edilir. Satıcıların herhangi bir işlem yapmasına gerek yoktur.\n\nHepsiburada Komisyonu Nasıl Hesaplanıyor?Hepsiburada komisyonu, satılan ürünün kategorisine ve türüne göre değişen bir yüzde oranı ile hesaplanır. Ürün Satış Tutarı x Kategoriye Ait Komisyon Oranı = Hepsiburada Komisyon Bedeli\n\nÖrneğin, çanta kategorisinde satılan bir ürün için komisyon oranı %18'dir. Bu nedenle, 1000 TL değerinde bir çanta satışı için satıcı 180 TL komisyon ödeyecektir.\n\nHepsiburada Komisyonuna Kargo Ücretleri Dahil mi?Hayır. Hepsiburada komisyonuna kargo ücretleri dahil değildir. Hepsiburada, satıcılardan aldığı komisyonu, ürünün KDV dahil satış fiyatı üzerinden hesaplar. Kargo ücreti, satıcının sorumluluğundadır ve komisyona dahil değildir.`,
    n11: `n11 Komisyonu Nedir?n11 komisyonu, n11 pazar yerinde gerçekleşen satış işlemleri karşılığında satıcılardan alınan yüzde bazlı bir hizmet bedelidir. Komisyon oranı genellikle satılan ürünün fiyatına göre belirlenir ve n11.com tarafından sağlanan hizmetlere karşılık gelir.\n\nn11 Komisyon Oranları Nelerdir?2023 yılında n11'in başlıca kategoriler için belirlediği komisyon oranları şu şekildedir:\n- Bilgisayar: %5.5 - %25\n- Telefon Aksesuarları: %5 -%15\n- Kozmetik ve Kişisel Bakım Ürünleri: %10 - %15\n- Kitap, Müzik, Film, Oyun: %6.5 - %17\n- Giyim: %20\n- Mücevher ve Saat: %15 -%20\n- Otomotiv ve Motosiklet: %0 -%12\n\nn11 Komisyon Oranlarına KDV Dahil mi?n11 komisyon oranları, Türkiye'de geçerli olan yasal düzenlemelere göre genellikle KDV dahil olarak belirlenir. Yani komisyon oranları üzerinden hesaplanan tutarlar KDV'yi içerir. Bu durumda, satıcılar tarafından ödenen komisyon tutarı KDV'yi kapsayacak şekilde hesaplanır ve fatura edilir.\n\nn11, Satılan Her Ürün için Komisyon mu Alır?Evet, genellikle n11 komisyonu ürün başına alınır.\n\nn11 Satıcı Komisyonu Nasıl Hesaplanır?n11 satıcı komisyonu, satılan ürünün kategorisine bağlı olarak belirlenen bir yüzde üzerinden hesaplanır. Örneğin; n11 e-ticaret platformu, her bir tablet satışından komisyon olarak ürün fiyatının %5,5 oranında ücret almaktadır.\n\nn11 Komisyonuna Kargo Dahil mi?n11 komisyonu, genellikle ürün fiyatı üzerinden hesaplanır ve kargo ücretini kapsamaz. Yani komisyon, satış yapılan ürünün fiyatının belirli bir yüzdesi olarak alınır ve kargo ücretiyle ilgili bir kesinti yapılmaz.`,
    ciceksepeti: `Çiçeksepeti Nedir? Çiçeksepeti, Emre Aydın tarafından 2006 yılında kurulan bir online alışveriş platformudur. Türkiye'nin tüm şehirlerine çiçek siparişi imkanı sunan bu sitede, ayrıca gurme ürünler, takı, meyve sepeti ve çeşitli hediyelik eşya satışları da yapılmaktadır.\n\nÇiçeksepeti Komisyon Oranı Kaçtır? Çiçeksepeti, satıcıların yaptığı satışlardan değişken oranlarda komisyon alır. Bu oranlar satılan ürünün kategorisine göre belirlenir ve %6 ile %30 arasında değişiklik gösterir. Örneğin, Bilgisayar ve Tablet kategorisinde komisyon oranı %6 iken, Tasarım Çiçek kategorisinde ise %30'dur.\n\nÇiçeksepeti Komisyonu Nasıl Hesaplanır? Çiçeksepeti komisyonu "Komisyon Tutarı = Komisyon Oranı (%) × KDV Dahil Satış Fiyatı" formülü ile hesaplanmaktadır. Örnek ile açıklayacak olursak; Tasarım Çiçek kategorisi komisyon oranının %30 olduğunu düşünelim. Bu kategoride 100 TL'lik bir ürün sattığınızda, Çiçeksepeti sizden 30 TL komisyon alacaktır.\n\nÇiçeksepeti Komisyon Oranları Nasıl Tahsil Edilmektedir? Çiçeksepeti, satışlardan doğan komisyonunu otomatik olarak keser ve daha sonrasında komisyon harici kalan tutarı satıcıya aktarır.`
}

const currentPlatformDoc = computed(() => {
    return platformDocs[selectedPlatform.value]
})

const commissionAmount = computed(() => {
    if (!price.value) return 0
    return (price.value * selectedCategoryRate.value) / 100
})

const netEarnings = computed(() => {
    return (price.value || 0) - commissionAmount.value - (shippingCost.value || 0)
})

const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(value)
}
</script>
