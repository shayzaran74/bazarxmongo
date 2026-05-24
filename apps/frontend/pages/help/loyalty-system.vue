<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <AnnouncementBar page="help" />

    <!-- Hero: Kullanıcı Loyalty Durumu -->
    <div
      class="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden"
    >
      <div class="absolute top-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div class="relative z-10 max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-bold mb-6">
          <SparklesIcon class="w-4 h-4" />
          Sadakat Sistemi
        </div>
        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          XP &amp; Sadakat Sistemi
        </h1>
        <p class="text-purple-100 text-lg mb-8">
          Deneyim puanları, seviye atlama ve ödül sistemiyle ilgili detaylı bilgi.
        </p>

        <!-- Kullanıcı Özet Kartı -->
        <div v-if="!loading" class="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-left">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-4xl">{{ userTierIcon }}</span>
              <div>
                <p class="text-[10px] font-black uppercase opacity-60 tracking-widest">Mevcut Seviye</p>
                <p class="text-xl font-black">{{ userXpData.tier }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black uppercase opacity-60 tracking-widest">Mevcut XP</p>
              <p class="text-xl font-black">{{ userXpData.currentXp.toLocaleString('tr-TR') }}</p>
            </div>
          </div>
          <div class="mb-2">
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>{{ userXpData.currentXp.toLocaleString('tr-TR') }} XP</span>
              <span v-if="!userXpData.isMaxTier" class="opacity-70">{{ userXpData.nextTierMinXp.toLocaleString('tr-TR') }} XP</span>
              <span v-else class="opacity-70">MAX</span>
            </div>
            <div class="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 transition-all duration-1000"
                :style="{ width: `${xpProgressPercent}%` }"
              />
            </div>
          </div>
          <p class="text-[10px] font-black uppercase opacity-60 text-right">
            <span v-if="userXpData.isMaxTier">EN ÜST SEVİYEDESİNİZ</span>
            <span v-else>SONRAKİ SEVİYE İÇİN {{ (userXpData.nextTierMinXp - userXpData.currentXp).toLocaleString('tr-TR') }} XP GEREKLİ</span>
          </p>
        </div>
        <div v-else class="max-w-md mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 animate-pulse">
          <div class="h-16 bg-white/10 rounded-2xl" />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">

      <!-- İçindekiler -->
      <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-10">
        <h2 class="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">İçindekiler</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <a v-for="item in tableOfContents" :key="item.id" :href="`#${item.id}`"
            class="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-sm font-semibold text-gray-700 group">
            <component :is="item.icon" class="w-5 h-5 text-indigo-500 group-hover:text-indigo-600" />
            {{ item.label }}
          </a>
        </div>
      </div>

      <!-- XP Nasıl Kazanılır -->
      <section id="xp-kazanim" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <SparklesIcon class="w-6 h-6 text-indigo-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">XP Nasıl Kazanılır?</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="source in xpSources" :key="source.title"
            class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center" :class="source.bgColor">
                <component :is="source.icon" class="w-6 h-6" :class="source.iconColor" />
              </div>
              <span class="text-2xl font-black text-gray-900">+{{ source.amount }}</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">{{ source.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ source.desc }}</p>
          </div>
        </div>

        <div class="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
          <InformationCircleIcon class="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
          <div class="text-sm text-gray-700">
            <strong class="font-bold">İlk sipariş Engeli:</strong> Platformdaki ilk siparişinizde XP kazanılmaz. Bu, sistemi kötüye kullanımı önlemek için tasarlanmıştır. Tüm sonraki siparişlerden XP kazanırsınız.
          </div>
        </div>
      </section>

      <!-- XP Harcama Kuralları -->
      <section id="xp-harcama" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
            <ArrowRightCircleIcon class="w-6 h-6 text-amber-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">XP Nasıl Harcansın?</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div class="space-y-6">
            <div>
              <h3 class="text-base font-bold text-gray-900 mb-3">Harcama Kuralları</h3>
              <ul class="space-y-3">
                <li v-for="rule in spendingRules" :key="rule.title" class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-black">!</div>
                  <div>
                    <span class="font-semibold text-gray-900">{{ rule.title }}</span>
                    <span class="text-gray-600 text-sm"> — {{ rule.desc }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <h3 class="text-base font-bold text-gray-900 mb-3">Harcama Limitleri</h3>
              <p class="text-sm text-gray-600 mb-4">
                XP harcaması, tier seviyenize ve aylık harcama limitlerinize göre kısıtlanmış olabilir. Bakiye yetersizliği durumunda harcama reddedilir.
              </p>
              <div class="bg-gray-50 rounded-2xl p-4">
                <div class="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">ÖRNEK HESAPLAMA</div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">100 TL'lik siparişte max XP kullanımı:</span>
                  <span class="font-bold text-gray-900">50 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Seviye & Tier Sistemi -->
      <section id="seviye-sistemi" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <ArrowTrendingUpIcon class="w-6 h-6 text-emerald-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Seviye &amp; Tier Sistemi</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Tier açıklama -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Loyalty Tier Seviyeleri</h3>
            <div class="space-y-4">
              <div v-for="tier in loyaltyTiers" :key="tier.name"
                class="flex items-center gap-4 p-4 rounded-2xl transition-all"
                :class="tier.isCurrent ? 'bg-indigo-50 border-2 border-indigo-200' : 'bg-gray-50'">
                <span class="text-3xl">{{ tier.icon }}</span>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-gray-900">{{ tier.name }}</span>
                    <span v-if="tier.isCurrent" class="text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">MEVCUT</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">{{ tier.desc }}</p>
                  <p class="text-xs font-semibold text-gray-700 mt-1">Gerekli: {{ tier.threshold.toLocaleString('tr-TR') }} XP</p>
                </div>
                <div class="text-right">
                  <span class="text-lg font-black text-gray-900">{{ tier.xpMultiplier }}x</span>
                  <p class="text-[10px] text-gray-400">XP Çarpanı</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Seviye atlama süreci -->
          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Seviye Atlama</h3>
            <div class="space-y-4">
              <div v-for="(step, i) in levelUpSteps" :key="i" class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-black shrink-0">{{ i + 1 }}</div>
                  <div v-if="i < levelUpSteps.length - 1" class="w-0.5 flex-1 bg-indigo-100 my-1" />
                </div>
                <div class="pb-6">
                  <p class="font-semibold text-gray-900 text-sm">{{ step.title }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <div class="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5">
              <div class="flex items-center gap-2 mb-2">
                <LockClosedIcon class="w-5 h-5 text-emerald-600" />
                <span class="font-bold text-gray-900 text-sm">Tier Yükseltme</span>
              </div>
              <p class="text-xs text-gray-600">
                Yüksek seviyelere yükselmek için yıllık aidat ödemesi ve yeterli işlem hacmi gereklidir. Komisyon indirimleri tier yükseltmesiyle birlikte aktif hale gelir.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Görevler & Milestone -->
      <section id="gorevler" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
            <FlagIcon class="w-6 h-6 text-rose-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Görevler &amp; Milestone</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div class="mb-6">
            <p class="text-sm text-gray-600 leading-relaxed">
              Platformda tamamlayabileceğiniz çeşitli görevler ve milestone'lar bulunur. Her görev ve milestone tamamlandığında XP ödülleri kazanırsınız.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="cat in missionCategories" :key="cat.title" class="border border-gray-100 rounded-2xl p-5">
              <div class="flex items-center gap-2 mb-3">
                <component :is="cat.icon" class="w-5 h-5 text-rose-500" />
                <h4 class="font-bold text-gray-900 text-sm">{{ cat.title }}</h4>
              </div>
              <div class="space-y-2">
                <div v-for="m in cat.missions" :key="m.name" class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">{{ m.name }}</span>
                  <span class="text-xs font-bold text-indigo-600">+{{ m.xp }} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- XP Aşınması (Decay) -->
      <section id="xp-decay" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
            <ClockIcon class="w-6 h-6 text-amber-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">XP Aşınması (Decay)</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 space-y-5">
              <div>
                <h3 class="text-base font-bold text-gray-900 mb-2">XP Aşınması Nedir?</h3>
                <p class="text-sm text-gray-600 leading-relaxed">
                  Her ay, kullanılmayan (harcanmamış) XP bakiyenizin <strong class="font-semibold">%10'u aşınır</strong>. Bu mekanizma, aktif kullanıcıları ödüllendirmek ve hesaplarınızda duran atıl XP'yi azaltmak için tasarlanmıştır. Kullanılan (harcenen) XP'ler aşınmaz; sadece mevcut bakiye üzerinden hesaplanır.
                </p>
              </div>

              <div class="bg-gray-50 rounded-2xl p-5">
                <div class="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">NASIL HESAPLANIR?</div>
                <div class="text-sm text-gray-700 space-y-2">
                  <div class="flex justify-between">
                    <span>Aylık aşınma oranı:</span>
                    <span class="font-bold">%10</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Hesaplama yöntemi:</span>
                    <span class="font-bold">Her ayın sonunda</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Aşınma hangi bakiyeye uygulanır:</span>
                    <span class="font-bold">Harcanmamış XP bakiyesi</span>
                  </div>
                </div>
              </div>

              <div class="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div class="flex items-start gap-3">
                  <ExclamationTriangleIcon class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div class="text-sm text-amber-800">
                    <strong class="font-bold">Önemli:</strong> XP aşınmasını önlemenin en iyi yolu, kazandığınız XP'leri düzenli olarak harcamaktır. Komisyon indirimi veya ödül kullanımı için XP'nizi aktif tutun.
                  </div>
                </div>
              </div>
            </div>

            <!-- Örnek hesaplama -->
            <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <div class="text-xs font-black uppercase tracking-widest text-indigo-400 mb-3">ÖRNEK HESAPLAMA</div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Mevcut XP:</span>
                  <span class="font-bold text-gray-900">10.000 XP</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Aylık aşınma (%10):</span>
                  <span class="font-bold text-amber-600">-1.000 XP</span>
                </div>
                <div class="border-t border-indigo-200 pt-2 flex justify-between">
                  <span class="text-gray-700 font-semibold">Sonraki ay bakiye:</span>
                  <span class="font-black text-gray-900">9.000 XP</span>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-indigo-200">
                <div class="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">6 AY SONRA</div>
                <div class="text-sm">
                  <div class="flex justify-between mb-1">
                    <span class="text-gray-600">Sonraki aşınma yoksa:</span>
                    <span class="font-bold">10.000 XP</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Aşınma sonrası (~):</span>
                    <span class="font-bold text-amber-600">5.310 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Escrow Coupons -->
      <section id="escrow-coupons" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
            <GiftTopIcon class="w-6 h-6 text-green-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Escrow Kuponları &amp; Ödüller</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <p class="text-sm text-gray-600 mb-6 leading-relaxed">
            Takas işlemleriniz tamamlandığında, escrow sisteminden kalan tutar kupon olarak cüzdanınıza yüklenir. Bu kuponlar doğrudan ödeme yöntemi olarak kullanılabilir.
          </p>

          <div v-if="!couponsLoading && userCoupons.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div v-for="coupon in userCoupons" :key="coupon.id"
              class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <div class="flex items-start justify-between mb-2">
                <span class="text-2xl font-black text-gray-900">{{ coupon.amount.toLocaleString('tr-TR') }} TL</span>
                <span v-if="coupon.rewardValue" class="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">+{{ coupon.rewardValue }} TL ödül</span>
              </div>
              <p class="text-xs text-gray-500">
                Son kullanma: {{ formatDate(coupon.expiryDate) }}
              </p>
              <p v-if="coupon.listing?.catalogProduct?.name" class="text-xs text-gray-500 mt-1">
                Ürün: {{ coupon.listing.catalogProduct.name }}
              </p>
            </div>
          </div>
          <div v-else-if="couponsLoading" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div v-for="i in 3" :key="i" class="bg-gray-50 rounded-2xl p-5 animate-pulse h-24" />
          </div>
          <div v-else class="bg-gray-50 rounded-2xl p-6 text-center text-sm text-gray-500">
            Henüz aktif kuponunuz bulunmuyor.
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <InformationCircleIcon class="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div class="text-sm text-blue-800">
              <strong class="font-bold">Kupon Kullanımı:</strong> Kuponlarınız otomatik olarak ödeme adımında değerlendirilir. Yeterli bakiyeniz varsa kuponlarınız sırayla kullanılır.
            </div>
          </div>
        </div>
      </section>

      <!-- Referans Sistemi -->
      <section id="referans-sistemi" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
            <UserGroupIcon class="w-6 h-6 text-violet-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Referans Sistemi</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="space-y-4">
              <h3 class="text-base font-bold text-gray-900">Nasıl Çalışır?</h3>
              <div v-for="(step, i) in referralSteps" :key="i" class="flex items-start gap-3">
                <div class="w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-black shrink-0">{{ i + 1 }}</div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ step.title }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ step.desc }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h3 class="text-base font-bold text-gray-900">Referans Ödülleri</h3>
              <div class="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700">Referans yapan kullanıcı (gönderen):</span>
                  <span class="font-bold text-violet-600">+20 XP</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-700">Referans kabul eden kullanıcı (alan):</span>
                  <span class="font-bold text-violet-600">+10 XP</span>
                </div>
                <div class="border-t border-violet-200 pt-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-700">3. referanstan sonra ek bonus:</span>
                    <span class="font-bold text-violet-600">%60 XP bonus</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-2xl p-4">
                <div class="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">ÖNEMLİ NOT</div>
                <p class="text-xs text-gray-600">
                  Referans bağlantınızı sosyal medyada paylaşarak veya doğrudan arkadaşlarınıza göndererek more kişi kazanabilirsiniz. Her kullanıcı sadece bir referans kodu kullanabilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SSS -->
      <section id="sss" class="mb-16 scroll-mt-20">
        <div class="flex items-center gap-3 mb-6">
          <StarIcon class="w-8 h-8 text-orange-500" />
          <h2 class="text-2xl font-bold text-gray-900">Sıkça Sorulan Sorular</h2>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div v-for="(faq, i) in loyaltyFaqs" :key="i" class="border-b border-gray-50 last:border-0">
            <button
              class="flex justify-between items-center w-full text-left p-6 sm:p-8 hover:bg-gray-50 transition-colors group"
              @click="openFaqId = openFaqId === i ? null : i"
            >
              <span class="flex items-center gap-4">
                <span class="w-8 h-8 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-bold shrink-0">{{ i + 1 }}</span>
                <span class="font-semibold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">{{ faq.q }}</span>
              </span>
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all ml-4 shrink-0">
                <ChevronDownIcon :class="{ 'rotate-180 text-orange-600': openFaqId === i }" class="w-5 h-5 text-gray-400 transition-transform duration-300" />
              </div>
            </button>
            <div v-show="openFaqId === i" class="px-8 pb-8 pt-0">
              <div class="pl-12 pt-4 border-t border-gray-100 text-gray-600 leading-relaxed text-sm">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SparklesIcon,
  ArrowRightCircleIcon,
  ArrowTrendingUpIcon,
  FlagIcon,
  ClockIcon,
  GiftTopIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  StarIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  ArrowPathIcon,
  TruckIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/vue/24/outline'
import AnnouncementBar from '~/components/common/AnnouncementBar.vue'

useHead({
  title: 'XP & Sadakat Sistemi — Yardım',
  meta: [{ name: 'description', content: 'XP kazanımı, seviye sistemi, görevler, XP decay ve sadakat ödülleri hakkında detaylı bilgi.' }],
})

const { $api } = useApi()

const loading = ref(true)
const couponsLoading = ref(true)
const openFaqId = ref<number | null>(null)
const userCoupons = ref<Array<{
  id: string
  code: string
  amount: number
  rewardValue?: number
  expiryDate: string
  listing?: { catalogProduct?: { name: string } }
}>>([])

// XP sources
const xpSources = [
  { title: 'Sipariş Tamamlama', desc: 'Platform üzerindeki siparişleriniz tamamlandığında', amount: '5-50 XP', icon: ShoppingBagIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  { title: 'Barter Takası', desc: 'Ticari takas işlemleriniz onaylandığında', amount: '20-100 XP', icon: ArrowPathIcon, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  { title: 'Profil Tamamlama', desc: 'Hesap bilgilerinizi tamamen doldurduğunuzda', amount: '5 XP', icon: UserPlusIcon, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
  { title: 'Sosyal Paylaşım', desc: 'Ürün veya kampanyaları sosyal medyada paylaştığınızda', amount: '10 XP', icon: FlagIcon, bgColor: 'bg-pink-100', iconColor: 'text-pink-600' },
  { title: 'Günlük Giriş', desc: 'Her gün platforma giriş yaptığınızda', amount: '1-5 XP', icon: ClockIcon, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
  { title: 'Referans', desc: 'Arkadaşlarınızı platforma davet ettiğinizde (gönderen)', amount: '20 XP', icon: UserGroupIcon, bgColor: 'bg-violet-100', iconColor: 'text-violet-600' },
]

const spendingRules = [
  { title: 'Komisyon İndirimi', desc: 'Tier seviyenize göre sipariş komisyonlarınızda indirim' },
  { title: 'Tier Yükseltme', desc: 'Bir üst tier\'a yükselmek için aidat ödemesinde kullanabilirsiniz' },
  { title: 'Ödül Kataloğu', desc: 'XP puanlarınızı ödül ve hediyelere dönüştürebilirsiniz' },
]

const loyaltyTiers = [
  { name: 'BRONZE', icon: '🥉', desc: 'Giriş seviyesi', threshold: 0, xpMultiplier: 1, isCurrent: false },
  { name: 'SILVER', icon: '🥈', desc: 'Orta seviye', threshold: 1000, xpMultiplier: 1.5, isCurrent: false },
  { name: 'GOLD', icon: '🥇', desc: 'İleri seviye', threshold: 5000, xpMultiplier: 2, isCurrent: false },
  { name: 'PLATINUM', icon: '💎', desc: 'Premium seviye', threshold: 15000, xpMultiplier: 3, isCurrent: false },
  { name: 'DIAMOND', icon: '👑', desc: 'En yüksek seviye', threshold: 50000, xpMultiplier: 5, isCurrent: false },
]

const levelUpSteps = [
  { title: 'XP Kazan', desc: 'Platformda alışveriş ve takas yaparak XP kazanın' },
  { title: 'Seviye Ata', desc: 'Yeterli XP biriktirdiğinizde seviyeniz otomatik olarak yükselir' },
  { title: 'Avantajlardan Yararlan', desc: 'Daha yüksek çarpan ve komisyon indirimleri aktif olur' },
]

const missionCategories = [
  {
    title: 'Alışveriş Görevleri',
    icon: ShoppingBagIcon,
    missions: [
      { name: 'İlk sipariş', xp: 50 },
      { name: '5 sipariş tamamla', xp: 100 },
      { name: '10 sipariş tamamla', xp: 250 },
    ],
  },
  {
    title: 'Takas Görevleri',
    icon: ArrowPathIcon,
    missions: [
      { name: 'İlk takas tamamla', xp: 75 },
      { name: '3 takas tamamla', xp: 150 },
      { name: 'Takas havuzunu doldur', xp: 200 },
    ],
  },
  {
    title: 'Profil Görevleri',
    icon: UserPlusIcon,
    missions: [
      { name: 'Profil fotoğrafı ekle', xp: 10 },
      { name: 'Telefon doğrula', xp: 5 },
      { name: 'Şirket bilgilerini tamamla', xp: 25 },
    ],
  },
]

const referralSteps = [
  { title: 'Referans Kodunuzu Alın', desc: 'Hesap ayarlarınızdan referans bağlantınızı kopyalayın' },
  { title: 'Arkadaşlarınızı Davet Edin', desc: 'Bağlantıyı sosyal medya veya mesajla paylaşın' },
  { title: 'Arkadaş Kaydolur', desc: 'Davet edilen kişi bağlantıyla kaydolur ve ilk siparişini tamamlar' },
  { title: 'İkiniz de Kazanın', desc: 'Gönderen +20 XP, alan +10 XP bonus kazanır' },
]

const loyaltyFaqs = [
  { q: 'XP aşınması nedir ve nasıl çalışır?', a: 'Her ayın sonunda, harcanmamış XP bakiyenizin %10\'u otomatik olarak aşınır (erode olur). Bu mekanizma aktif kullanıcıları ödüllendirmek için tasarlanmıştır. Kullanıcı tarafından harcama yapılmadığı sürece aşınma devam eder. Aşınma durdurmak için XP\'nizi komisyon indirimi veya ödül kullanımı için harcayabilirsiniz.' },
  { q: 'Tier seviyemi nasıl yükseltirim?', a: 'Tier yükseltmek için yeterli XP biriktirmeniz ve ilgili tier\'ın gereksinimlerini karşılamanız gerekir. Yıllık aidat planınıza göre otomatik olarak tier ataması yapılır. Belirli eşikleri (1000, 5000, 15000, 50000 XP) geçtiğinizde tier\'ınız yükselir.' },
  { q: 'Harcanan XP geri alınabilir mi?', a: 'Hayır, XP harcandıktan sonra geri alınamaz. Komisyon indirimi olarak kullanıldıysa, indirim uygulanmış sipariş iptal edilmedikçe XP iade yapılmaz.' },
  { q: 'İlk siparişimde neden XP kazanmadım?', a: 'Platformdaki ilk siparişinizde XP kazanımı güvenlik nedeniyle engellenmiştir. Bu, sistemi kötüye kullanımı önlemek için tasarlanmış bir koruma mekanizmasıdır.' },
  { q: 'XP çarpanı ne işe yarar?', a: 'XP çarpanı, tier seviyenize bağlı olarak her işlemden kazandığınız XP miktarını artırır. Diamond tier\'da 5x, Platinum\'da 3x, Gold\'da 2x, Silver\'da 1.5x çarpan uygulanır. Bu çarpan, aynı işlemden daha fazla XP kazanmanızı sağlar.' },
  { q: 'Escrow kuponları neden kullanılamıyor olabilir?', a: 'Escrow kuponlarının geçerlilik süresi olabilir (son kullanma tarihi). Ayrıca belirli ürün kategorilerinde veya minimum sipariş tutarında kupon kullanılamayabilir. Kupon detaylarını cüzdanınızdan kontrol edebilirsiniz.' },
]

const tableOfContents = [
  { id: 'xp-kazanim', label: 'XP Kazanımı', icon: SparklesIcon },
  { id: 'xp-harcama', label: 'XP Harcama', icon: ArrowRightCircleIcon },
  { id: 'seviye-sistemi', label: 'Seviye & Tier', icon: ArrowTrendingUpIcon },
  { id: 'gorevler', label: 'Görevler', icon: FlagIcon },
  { id: 'xp-decay', label: 'XP Decay', icon: ClockIcon },
]

// Kullanıcı XP verisi
const LOYALTY_THRESHOLDS: Record<string, number> = {
  BRONZE: 0, SILVER: 1000, GOLD: 5000, PLATINUM: 15000, DIAMOND: 50000,
}
const LOYALTY_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

const userXpData = ref({
  tier: 'BRONZE',
  currentXp: 0,
  lifetimeXp: 0,
  nextTierMinXp: 1000,
  isMaxTier: false,
})

const userTierIcon = computed(() => ({
  BRONZE: '🥉', SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎', DIAMOND: '👑',
}[userXpData.value.tier] ?? '🥉'))

const xpProgressPercent = computed(() => {
  if (userXpData.value.isMaxTier) return 100
  const pct = (userXpData.value.currentXp / userXpData.value.nextTierMinXp) * 100
  return Math.min(Math.round(pct * 100) / 100, 100)
})

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function fetchXpStatus() {
  try {
    const res = await $api<{ success: boolean; data?: { tier?: string; currentXp?: number; lifetimeXp?: number; nextTierXp?: number } }>('/api/v1/xp/balance')
    const d = res?.data
    if (!d) return

    const tier = d.tier ?? 'BRONZE'
    const curXp = d.currentXp ?? 0
    const idx = LOYALTY_ORDER.indexOf(tier)
    const isMax = idx === LOYALTY_ORDER.length - 1
    const nextXp = isMax ? curXp : (LOYALTY_THRESHOLDS[LOYALTY_ORDER[idx + 1]] ?? curXp)

    userXpData.value = {
      tier,
      currentXp: curXp,
      lifetimeXp: d.lifetimeXp ?? curXp,
      nextTierMinXp: nextXp,
      isMaxTier: isMax,
    }

    // Update current tier in loyaltyTiers
    loyaltyTiers.forEach(t => { t.isCurrent = t.name === tier })
  } catch { /* fail silently */ }
}

async function fetchCoupons() {
  try {
    const res = await $api<{ success: boolean; data?: typeof userCoupons.value }>('/api/v1/cart/escrow-coupons')
    if (res?.success && res.data) userCoupons.value = res.data
  } catch { /* fail silently */ } finally {
    couponsLoading.value = false
  }
}

onMounted(async () => {
  await fetchXpStatus()
  fetchCoupons()
  loading.value = false
})
</script>