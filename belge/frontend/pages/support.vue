<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Breadcrumb Area -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav class="flex text-sm font-medium text-gray-500">
          <NuxtLink
            to="/"
            class="hover:text-primary-600 transition-colors flex items-center"
          >
            <HomeIcon class="h-4 w-4 mr-1" />
            Anasayfa
          </NuxtLink>
          <span class="mx-2">/</span>
          <span class="text-gray-900 font-bold">Müşteri Hizmetleri</span>
        </nav>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 flex-1 w-full">
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <!-- Sidebar Navigation (Horizontal on mobile, Vertical on desktop) -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <div
            class="lg:bg-white lg:rounded-3xl lg:shadow-sm lg:border lg:border-gray-100 lg:overflow-hidden sticky top-20 lg:top-24 z-20"
          >
            <div class="hidden lg:block p-6 border-b border-gray-50">
              <h2 class="text-lg font-black text-gray-900 uppercase tracking-tighter italic">
                Yardım Merkezi
              </h2>
            </div>

            <!-- Mobile Horizontal Scroll Menu -->
            <div class="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar flex space-x-2 pb-4">
              <button
                v-for="item in sidebarItems"
                :key="item.label"
                :class="[
                  'flex-shrink-0 flex items-center px-4 py-2.5 text-xs font-bold rounded-full border transition-all',
                  activeCategory === item.label
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 shadow-sm'
                ]"
                @click="activeCategory = item.label"
              >
                <component
                  :is="item.icon"
                  class="h-3.5 w-3.5 mr-2"
                />
                {{ item.label }}
              </button>
            </div>

            <!-- Desktop Vertical Menu -->
            <nav class="hidden lg:block p-2">
              <ul class="space-y-1">
                <li
                  v-for="item in sidebarItems"
                  :key="item.label"
                >
                  <button
                    :class="[
                      'w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-200 group',
                      activeCategory === item.label
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    ]"
                    @click="activeCategory = item.label"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        'h-5 w-5 mr-3 transition-colors',
                        activeCategory === item.label ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                      ]"
                    />
                    {{ item.label }}
                    <ChevronRightIcon
                      v-if="activeCategory === item.label"
                      class="ml-auto h-4 w-4"
                    />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 space-y-6 lg:space-y-8">
          <!-- Security Warning -->
          <div
            class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl lg:rounded-3xl p-4 lg:p-6 flex items-start space-x-3 lg:space-x-4 shadow-sm"
          >
            <div class="bg-amber-100 p-1.5 lg:p-2 rounded-lg flex-shrink-0">
              <ExclamationTriangleIcon class="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
            </div>
            <div>
              <p class="text-amber-900 font-bold text-xs lg:text-sm leading-relaxed">
                Güvenli alışveriş için ödemelerinizi yalnızca <span
                  class="text-primary-600 uppercase italic"
                >TicariTakas</span> üzerinden gerçekleştirin.
                Satıcılara doğrudan IBAN ile ödeme yapmayın.
              </p>
            </div>
          </div>

          <!-- Greeting & Search -->
          <div
            class="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden"
          >
            <!-- Decorative background -->
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50" />
            <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50" />

            <div class="relative z-10 text-center max-w-2xl mx-auto">
              <h1 class="text-3xl lg:text-4xl font-black text-gray-900 mb-2 tracking-tight">
                Merhaba 👋
              </h1>
              <p class="text-lg lg:text-xl font-medium text-gray-500 mb-6 lg:mb-8">
                Hangi konuda desteğe ihtiyacınız var?
              </p>

              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 lg:pl-6 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon
                    class="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Konuyu birkaç kelime ile özetler misiniz?"
                  class="w-full pl-12 lg:pl-16 pr-4 lg:pr-6 py-4 lg:py-5 bg-gray-50 border-2 border-transparent rounded-2xl lg:rounded-[2rem] focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-sm lg:text-lg transition-all shadow-inner font-medium"
                >
                <button
                  class="hidden lg:block absolute right-3 top-3 bottom-3 px-8 bg-primary-600 text-white rounded-2xl font-black text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 uppercase tracking-widest"
                >
                  ARA
                </button>
              </div>

              <button
                class="lg:hidden w-full mt-3 py-3 bg-primary-600 text-white rounded-xl font-black text-xs hover:bg-primary-700 transition-all shadow-lg uppercase tracking-widest"
              >
                ŞUBETİ ARA
              </button>

              <!-- Popular Topics -->
              <div class="mt-6 lg:mt-8 flex flex-wrap justify-center gap-2 lg:gap-3">
                <span class="text-[10px] lg:text-xs font-black text-gray-400 uppercase tracking-widest">Popüler:</span>
                <button
                  v-for="tag in ['Kargo Takip', 'İade Süreci', 'Cüzdan Limit', 'Üyelik İptali']"
                  :key="tag"
                  class="text-[10px] lg:text-xs font-bold text-gray-600 hover:text-primary-600 transition-colors px-2 lg:px-3 py-0.5 lg:py-1 bg-gray-100 rounded-full hover:bg-primary-50"
                >
                  # {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Help Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div
              v-for="card in helpCards"
              :key="card.title"
              class="group p-6 lg:p-8 bg-white border border-gray-100 rounded-[1.5rem] lg:rounded-3xl hover:shadow-2xl hover:shadow-gray-200 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
            >
              <div class="relative z-10 flex flex-col h-full">
                <div
                  :class="['w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 transition-transform group-hover:scale-110 duration-500', card.bgClass]"
                >
                  <component
                    :is="card.icon"
                    class="h-6 w-6 lg:h-8 lg:w-8"
                  />
                </div>
                <h3
                  class="text-lg lg:text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic leading-none"
                >
                  {{ card.title }}
                </h3>
                <p class="text-gray-500 font-medium text-xs lg:text-sm leading-relaxed mb-4 lg:mb-6">
                  {{ card.desc }}
                </p>
                <div
                  class="mt-auto pt-2 lg:pt-4 flex items-center text-primary-600 font-black text-[10px] lg:text-sm tracking-widest group-hover:gap-2 transition-all"
                >
                  DETAYLARI GÖR
                  <ArrowRightIcon class="h-3 w-3 lg:h-4 lg:w-4 ml-1" />
                </div>
              </div>
            </div>
          </div>

          <!-- Sıkça Sorulan Sorular (Scraped Content) -->
          <div class="space-y-4">
            <h2 class="text-2xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic">
              Sıkça Sorulan Sorular
            </h2>

            <div class="space-y-3">
              <!-- FAQ 1 -->
              <div
                class="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  class="w-full flex items-center justify-between p-6 text-left group"
                  @click="toggleFaq(1)"
                >
                  <span class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">📄 Kurumsal iade
                    faturası nasıl kesebilirim?</span>
                  <ChevronDownIcon
                    :class="['h-5 w-5 text-gray-400 transition-transform duration-300', activeFaq === 1 ? 'rotate-180' : '']"
                  />
                </button>
                <div
                  v-if="activeFaq === 1"
                  class="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4"
                >
                  Kurumsal bir siparişin iadesi için faturayı, ürünü satın aldığınız satıcının bilgilerini kullanarak
                  düzenlemelisiniz.
                  Fatura tipi <strong class="text-gray-900">"iade"</strong> olmalı ve açıklama kısmına <strong
                    class="text-gray-900"
                  >sipariş numarası</strong> eklenmelidir.
                  Hazırlanan fatura, <span class="bg-gray-100 px-1 rounded font-bold">“Hesabım > Soru ve
                    Taleplerim”</span> sayfasından ilgili talep bulunarak sisteme yüklenmelidir.
                  <p class="mt-2 text-xs text-amber-600 font-bold italic">
                    ! Not: Yalnızca yurt içi siparişlerde
                    geçerlidir.
                  </p>
                </div>
              </div>

              <!-- FAQ 2 -->
              <div
                class="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  class="w-full flex items-center justify-between p-6 text-left group"
                  @click="toggleFaq(2)"
                >
                  <span class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">📦 Ürünümü iptal
                    edebilir miyim?</span>
                  <ChevronDownIcon
                    :class="['h-5 w-5 text-gray-400 transition-transform duration-300', activeFaq === 2 ? 'rotate-180' : '']"
                  />
                </button>
                <div
                  v-if="activeFaq === 2"
                  class="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4"
                >
                  Siparişiniz <span class="bg-green-50 text-green-700 px-1 rounded font-bold">"Hazırlanıyor"</span> veya
                  <span class="bg-blue-50 text-blue-700 px-1 rounded font-bold">"Kargoya Verildi"</span> aşamasındayken,
                  sistemde <strong class="text-gray-900">"İptal Et"</strong> butonu aktif ise iptal işlemini
                  gerçekleştirebilirsiniz.
                  Eğer buton aktif değilse (kargo yola çıkmışsa); ürünü kapıda teslim almayarak iade sürecini
                  başlatabilir veya teslim aldıktan sonra
                  <strong class="text-gray-900">14 gün</strong> içinde <strong class="text-gray-900">"Kolay
                    İade"</strong> adımıyla geri gönderebilirsiniz.
                </div>
              </div>
            </div>
          </div>
          <div class="relative mt-4 lg:mt-8 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-gray-900 via-primary-950 to-indigo-950" />
            <!-- Decorative Elements -->
            <div class="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-400/10 to-transparent" />
            <div
              class="absolute -top-20 -left-20 w-64 h-64 bg-primary-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"
            />

            <div
              class="relative z-10 p-6 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8"
            >
              <div class="flex items-center gap-4 lg:gap-8 w-full">
                <div
                  class="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0 shadow-amber-500/30 transform rotate-3 group-hover:rotate-6 transition-transform"
                >
                  <StarIcon class="h-8 w-8 lg:h-14 lg:w-14 text-white" />
                </div>
                <div>
                  <h2 class="text-xl lg:text-3xl font-black text-white mb-1 leading-none">
                    TicariTakas Premium
                  </h2>
                  <p class="text-primary-100 text-xs lg:text-lg font-medium opacity-80 leading-snug">
                    Premium’a geç, öncelikli Çağrı Merkezi’nden yararlan ve <br class="hidden md:block">
                    sana özel destek ekibine anında ulaş.
                  </p>
                </div>
              </div>
              <button
                class="w-full lg:w-auto px-8 lg:px-10 py-4 lg:py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 rounded-xl lg:rounded-2xl font-black text-sm lg:text-lg shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-1 transition-all active:scale-95 whitespace-nowrap"
                @click="navigateTo('/premium')"
              >
                ŞİMDİ GEÇ ✨
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  HomeIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  TruckIcon,
  CreditCardIcon,
  WalletIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
  PuzzlePieceIcon,
  StarIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  XCircleIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const activeCategory = ref('Anasayfa')
const activeFaq = ref(null)

const toggleFaq = (id) => {
  activeFaq.value = activeFaq.value === id ? null : id
}

const sidebarItems = [
  { label: 'Anasayfa', icon: HomeIcon },
  { label: 'Merak Edilenler', icon: QuestionMarkCircleIcon },
  { label: 'İptal / İade ve Diğer Talepler', icon: ArrowPathIcon },
  { label: 'Teslimat ve kargo', icon: TruckIcon },
  { label: 'Sipariş ve ödeme', icon: CreditCardIcon },
  { label: 'TicariPay', icon: WalletIcon },
  { label: 'Servis ve teknik destek', icon: WrenchScrewdriverIcon },
  { label: 'Üyelik ve hesap', icon: UserIcon },
  { label: 'Ürün bilgisi', icon: TagIcon },
  { label: 'Kampanya ve kuponlar', icon: TicketIcon },
  { label: 'Oyunlar', icon: PuzzlePieceIcon },
  { label: 'Premium', icon: StarIcon },
  { label: 'Kurumsal İletişim', icon: PhoneIcon }
]

const helpCards = [
  {
    title: 'Kurumsal İade',
    desc: 'Kurumsal siparişlerinizde iade faturasını nasıl düzenleyeceğiniz ve sisteme nasıl yükleyeceğiniz hakkında detaylı bilgi alın.',
    icon: DocumentTextIcon,
    bgClass: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Sipariş İptali',
    desc: 'Henüz kargoya verilmemiş siparişlerinizi nasıl iptal edeceğinizi ve ücret iade sürecini öğrenin.',
    icon: XCircleIcon,
    bgClass: 'bg-red-50 text-red-600'
  },
  {
    title: 'Üyelik & Güvenlik',
    desc: 'Hesap bilgilerinizi güncelleyin, şifre değişikliği yapın ve TicariTakas hesap güvenliğinizi kontrol edin.',
    icon: ShieldCheckIcon,
    bgClass: 'bg-indigo-50 text-indigo-600'
  },
  {
    title: 'Kargo Takip',
    desc: 'Siparişinizin hangi aşamada olduğunu ve tahmini teslimat süresini anlık olarak sorgulayın.',
    icon: TruckIcon,
    bgClass: 'bg-green-50 text-green-600'
  }
]
</script>

<style scoped>
.italic {
  font-style: italic;
}
</style>
