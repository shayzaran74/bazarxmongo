<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          💰 Cüzdanım
        </h1>
        <p class="text-gray-600 mt-1">
          Bakiyenizi yönetin ve işlemlerinizi takip edin
        </p>
      </div>

      <!-- Loading state -->
      <div
        v-if="walletLoading"
        class="flex justify-center items-center h-64"
      >
        <div class="spinner h-12 w-12" />
      </div>

      <!-- Error state -->
      <div
        v-else-if="walletError"
        class="bg-red-50 border border-red-200 rounded-md p-4 mb-6"
      >
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800">
              {{ walletError }}
            </p>
          </div>
        </div>
      </div>

      <!-- Wallet Content -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- TicariTakas Card -->
        <div class="ticari-takas-card-container mb-2">
          <div class="ticari-takas-card group">
            <!-- Card Background Image -->
            <div
              class="relative overflow-hidden rounded-2xl shadow-2xl"
              style="perspective: 1000px;"
            >
              <div
                class="card-inner relative transform transition-all duration-500 group-hover:rotate-y-5 group-hover:scale-105"
              >
                <!-- Background Image -->
                <img
                  src="/images/ticaritakas-card.png"
                  alt="TicariTakas Card"
                  class="w-full h-auto max-w-md mx-auto drop-shadow-2xl"
                >

                <!-- Balance Overlay -->
                <div
                  class="absolute inset-0 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl"
                >
                  <div class="text-center">
                    <p class="text-white/80 text-xs font-bold uppercase tracking-widest mb-2">
                      💰 Aktif Bakiyeniz
                    </p>
                    <p class="text-white text-4xl font-black tracking-tight drop-shadow-lg">
                      {{
                        formatPrice(mainAccount?.availableBalance || 0) }}
                    </p>
                    <p
                      v-if="mainAccount?.blockedBalance > 0"
                      class="text-red-300 text-sm font-bold mt-2"
                    >
                      🔒 {{ formatPrice(mainAccount.blockedBalance) }} bloke
                    </p>
                  </div>
                </div>

                <!-- Shine Effect -->
                <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                >
                  <div class="card-shine" />
                </div>
              </div>
            </div>

            <!-- Balance Info Below Card -->
            <div
              class="mt-6 flex items-center justify-between bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-orange-900/10 rounded-2xl p-5 border border-purple-200/50 backdrop-blur-sm"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-200"
                >
                  <span class="text-2xl">💳</span>
                </div>
                <div>
                  <h2 class="text-lg font-black text-gray-900 tracking-tight">
                    {{ authStore.isVendor ? 'TicariTakas Bakiyem' : 'Cüzdan Bakiyesi' }}
                  </h2>
                  <p class="text-xs text-gray-500 font-medium">
                    Kullanılabilir bakiye
                  </p>
                </div>
              </div>
              <div class="text-right">
                <div
                  class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500"
                >
                  {{ formatPrice(mainAccount?.availableBalance || 0) }}
                </div>
                <div
                  v-if="mainAccount?.blockedBalance > 0"
                  class="mt-1 text-xs font-bold text-red-500"
                >
                  🔒 {{ formatPrice(mainAccount.blockedBalance) }} bloke edildi
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BazarX XP & Barter Pool Status (Vendor Only) -->
        <div
          v-if="authStore.isVendor"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <!-- XP Accounts -->
          <div class="bg-white rounded-2xl shadow-md p-6 border border-purple-100">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🚀</span> BazarX XP Hesaplarım
              </h2>
              <div class="flex items-center gap-2">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border"
                  :class="tierBadgeClass"
                >
                  {{ tierIcon }} {{ userTierLabel }}
                </span>
              </div>
            </div>

            <!-- XP Split Info -->
            <div class="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100/50">
              <p class="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">
                XP Dağılım Kuralı
              </p>
              <div class="flex items-center gap-2 text-[10px] font-medium text-gray-500">
                <span class="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">%50 Komisyon</span>
                <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">%25 Reklam</span>
                <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">%25 Servis</span>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">
                Komisyon XP'nin en fazla %50'si komisyon ödemesinde
                kullanılabilir
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
                <div>
                  <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    İndirim Paneli
                  </p>
                  <p class="text-xs text-indigo-400">
                    Komisyon ödemelerinde kullanılır (maks %50)
                  </p>
                </div>
                <div class="text-xl font-black text-indigo-700">
                  {{ formatPrice(commissionAccount?.availableBalance || 0)
                  }}
                </div>
              </div>
              <div class="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <div>
                  <p class="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                    Reklam Bakiyesi
                  </p>
                  <p class="text-xs text-purple-400">
                    Ürün öne çıkarma ve reklamlar
                  </p>
                </div>
                <div class="text-xl font-black text-purple-700">
                  {{ formatPrice(adAccount?.availableBalance || 0) }}
                </div>
              </div>
              <div class="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <div>
                  <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Sistem Giderleri
                  </p>
                  <p class="text-xs text-blue-400">
                    Kargo, kırtasiye vb. servisler
                  </p>
                </div>
                <div class="text-xl font-black text-blue-700">
                  {{ formatPrice(serviceAccount?.availableBalance || 0) }}
                </div>
              </div>
            </div>

            <!-- Tier ROI Info -->
            <div class="mt-4 p-3 bg-gray-50 rounded-xl">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Komisyon Oranı (Barter)
                  </p>
                  <p class="text-xs text-gray-400">
                    {{ userTierLabel }} tier'ına göre
                  </p>
                </div>
                <div class="text-lg font-black text-gray-700">
                  %{{ tierCommissionRate }}
                </div>
              </div>
              <div class="flex justify-between items-center mt-2">
                <div>
                  <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    XP Kazanım (ROI)
                  </p>
                </div>
                <div class="text-lg font-black text-green-600">
                  %{{ tierROIRate }}
                </div>
              </div>
            </div>
          </div>

          <!-- Barter Pool Status -->
          <div class="bg-white rounded-2xl shadow-md p-6 border border-orange-100 flex flex-col justify-between">
            <div>
              <h2 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <span>🔄</span> Barter Havuzu
              </h2>
              <div class="space-y-4">
                <div class="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div class="flex justify-between items-end">
                    <div>
                      <p class="text-[10px] font-black text-orange-600 uppercase tracking-widest">
                        Havuz Bakiyeniz
                      </p>
                      <p class="text-2xl font-black text-orange-700">
                        {{ formatPrice(barterAccount?.availableBalance ||
                          0) }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Kredi Limiti
                      </p>
                      <p class="text-sm font-bold text-gray-600">
                        {{ formatPrice(barterAccount?.creditLimit || 0) }}
                      </p>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 font-medium leading-relaxed">
                  Barter havuzuna nakit bakiyenizden aktarım yaparak takas işlemlerine katılabilir ve ticari ağınızı
                  genişletebilirsiniz.
                </p>
              </div>
            </div>

            <div
              v-if="!barterAccount"
              class="mt-6 flex flex-col gap-2"
            >
              <button
                class="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-green-200 hover:shadow-green-300 transition-all active:scale-95"
                @click="registerForBarter"
              >
                Havuz Hesabını Etkinleştir
              </button>
              <p class="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">
                İşlemlere başlamak
                için hesabı aktif edin
              </p>
            </div>
            <div
              v-else
              class="mt-6 flex gap-3"
            >
              <button
                class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95"
                @click="showBarterTopup = true"
              >
                💰 Havuza Aktar
              </button>
              <button
                class="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-95"
                :disabled="(barterAccount?.availableBalance || 0) <= 0"
                @click="showBarterWithdraw = true"
              >
                💸 Para Çek
              </button>
            </div>
          </div>
        </div>

        <!-- Barter Topup Modal -->
        <div
          v-if="showBarterTopup"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 class="text-2xl font-black text-gray-900 mb-2">
              Havuz Aktarımı
            </h3>
            <p class="text-sm text-gray-500 mb-6">
              Cüzdan bakiyenizden barter havuzuna aktarmak istediğiniz tutarı girin.
            </p>

            <div class="mb-6">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aktarılacak Tutar
                (TL)</label>
              <input
                v-model="barterTopupAmount"
                type="number"
                class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:outline-none font-black text-xl"
                placeholder="0.00"
              >
              <p class="mt-2 text-[10px] font-bold text-gray-400">
                Mevcut Nakit: {{
                  formatPrice(mainAccount?.availableBalance || 0) }}
              </p>
            </div>

            <div class="flex gap-4">
              <button
                class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest"
                @click="showBarterTopup = false"
              >
                İptal
              </button>
              <button
                :disabled="!barterTopupAmount || barterTopupAmount < 1 || barterTopupAmount > (mainAccount?.availableBalance || 0)"
                class="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-orange-200 disabled:opacity-50"
                @click="topUpBarter"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>

        <!-- Barter Withdraw Modal -->
        <div
          v-if="showBarterWithdraw"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 class="text-2xl font-black text-gray-900 mb-2">
              💸 Havuzdan Para Çek
            </h3>
            <p class="text-sm text-gray-500 mb-6">
              Barter havuzunuzdan nakit bakiyenize aktarmak istediğiniz tutarı
              girin.
            </p>

            <div class="mb-6">
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Çekilecek Tutar
                (TL)</label>
              <input
                v-model="barterWithdrawAmount"
                type="number"
                class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:outline-none font-black text-xl"
                placeholder="0.00"
                :max="barterAccount?.availableBalance || 0"
              >
              <p class="mt-2 text-[10px] font-bold text-gray-400">
                Havuz Bakiyeniz: {{
                  formatPrice(barterAccount?.availableBalance || 0) }}
              </p>
            </div>

            <div class="flex gap-4">
              <button
                class="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest"
                @click="showBarterWithdraw = false"
              >
                İptal
              </button>
              <button
                :disabled="!barterWithdrawAmount || barterWithdrawAmount < 1 || barterWithdrawAmount > (barterAccount?.availableBalance || 0)"
                class="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-200 disabled:opacity-50"
                @click="withdrawBarter"
              >
                Çek
              </button>
            </div>
          </div>
        </div>

        <!-- Action Tabs (Top Up / Withdraw) -->
        <div
          v-if="authStore.isVendor"
          class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div class="flex border-b border-gray-100">
            <button
              class="flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all"
              :class="activeActionTab === 'topup' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'"
              @click="activeActionTab = 'topup'"
            >
              Bakiye Yükle
            </button>
            <button
              class="flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all"
              :class="activeActionTab === 'withdraw' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-400 hover:text-gray-600'"
              @click="activeActionTab = 'withdraw'"
            >
              Para Çek
            </button>
          </div>

          <div class="p-6">
            <div v-if="activeActionTab === 'topup'">
              <WalletTopUpForm @success="handleTopUpSuccess" />
            </div>
            <div v-else-if="activeActionTab === 'withdraw'">
              <WalletWithdrawForm
                :available-balance="mainAccount?.availableBalance || 0"
                @success="handleTopUpSuccess"
              />
            </div>
          </div>
        </div>

        <!-- Top Up Form (For non-vendors or if tabbed UI not used) -->
        <div
          v-else
          class="bg-white rounded-lg shadow-md p-6"
        >
          <WalletTopUpForm @success="handleTopUpSuccess" />
        </div>

        <!-- Gift Cards Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
              🎁 Hediye Kartlarım
            </h2>
            <div class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Müşteriye Tanımlı
            </div>
          </div>

          <div
            v-if="wallet.giftCards && wallet.giftCards.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              v-for="card in wallet.giftCards"
              :key="card.id"
              class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg group transition-all hover:shadow-xl"
            >
              <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <GiftIcon class="h-24 w-24" />
              </div>

              <div class="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-start mb-4">
                    <span
                      class="text-[10px] font-black uppercase tracking-widest opacity-80 bg-white/10 px-2 py-0.5 rounded"
                    >TicariTakas
                      Gift Card</span>
                    <span
                      class="bg-green-400/20 text-green-100 px-2 py-0.5 rounded text-[10px] font-bold border border-green-400/30"
                    >AKTİF</span>
                  </div>
                  <div class="text-xl font-mono font-bold tracking-widest mb-1">
                    {{ card.code }}
                  </div>
                  <div class="text-[10px] font-medium opacity-70 mb-4">
                    <span v-if="card.expiresAt">GEÇERLİLİK: {{ new Date(card.expiresAt).toLocaleDateString() }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-end">
                  <div class="flex-shrink-0">
                    <p class="text-[10px] font-bold opacity-80 uppercase tracking-tighter">
                      Değer
                    </p>
                    <p class="text-2xl font-black leading-tight">
                      {{ formatPrice(card.currentValue) }}
                    </p>
                  </div>

                  <button
                    class="ml-4 bg-white text-indigo-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-50 transition-all transform active:scale-95 shadow-md flex items-center gap-1"
                    @click="redeemGiftCard(card.code)"
                  >
                    <span>Cüzdana Aktar</span>
                    <span class="text-sm">💸</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl"
          >
            <div class="text-gray-300 text-5xl mb-4">
              🎁
            </div>
            <p class="text-gray-400 font-medium">
              Henüz size tanımlı bir hediye kartı bulunmuyor.
            </p>
          </div>
        </div>

        <!-- My Lottery Cards Section -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            🎫 Çekiliş Kartlarım
          </h2>
          <div
            v-if="wallet.cards && wallet.cards.length > 0"
            class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar"
          >
            <div
              v-for="(card, index) in wallet.cards"
              :key="index"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div class="mb-2 md:mb-0">
                  <h3 class="font-semibold text-blue-700 text-sm tracking-tight">
                    {{ card.giveawayTitle }}
                  </h3>
                  <p class="text-gray-500 text-[10px] font-medium uppercase tracking-widest">
                    {{ card.purchasedAt ? new Date(card.purchasedAt).toLocaleString('tr-TR') : '' }}
                  </p>
                </div>
                <div class="flex gap-2 flex-wrap items-center">
                  <div class="flex gap-2 flex-wrap">
                    <span
                      v-for="(num, i) in card.numbers"
                      :key="i"
                      class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono font-black text-sm tracking-widest border border-blue-200 shadow-sm"
                    >
                      {{ num }}
                    </span>
                  </div>

                  <div v-if="isCardWinner(card) !== null">
                    <span
                      v-if="isCardWinner(card)"
                      class="ml-2 px-3 py-1 rounded-full bg-green-200 text-green-800 font-black text-[10px] uppercase tracking-widest shadow-sm"
                    >
                      🎉 Kazandınız
                    </span>
                    <span
                      v-else
                      class="ml-2 px-3 py-1 rounded-full bg-red-100 text-red-500 font-black text-[10px] uppercase tracking-widest"
                    >
                      ❌ Kazanamadınız
                    </span>
                  </div>
                  <span
                    v-else
                    class="ml-2 px-3 py-1 rounded-full bg-blue-50 text-blue-500 font-black text-[10px] uppercase tracking-widest italic"
                  >
                    ⏳ Bekleniyor
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8"
          >
            <div class="text-gray-400 text-4xl mb-4">
              🎫
            </div>
            <p class="text-gray-500 text-sm">
              Henüz çekiliş kartınız yok.
            </p>
            <NuxtLink
              to="/lotteries"
              class="mt-4 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-[1.5rem] hover:bg-primary-700 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg"
            >
              Çekilişlere Katıl
            </NuxtLink>
          </div>
        </div>

        <!-- My Auction Bids Section (Vendor Only) -->
        <div
          v-if="authStore.isVendor"
          class="bg-white rounded-lg shadow-md p-6"
        >
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            🎯 Açık Artırma Tekliflerim
          </h2>
          <div
            v-if="wallet.auctions && wallet.auctions.length > 0"
            class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar"
          >
            <div
              v-for="auc in wallet.auctions"
              :key="auc.id"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                <div class="mb-2 md:mb-0">
                  <h3 class="font-semibold text-primary-700 text-sm tracking-tight">
                    {{ auc.auctionTitle }}
                  </h3>
                  <p class="text-gray-500 text-[10px] font-medium uppercase tracking-widest">
                    {{ auc.createdAt ? new Date(auc.createdAt).toLocaleString('tr-TR') : '' }}
                  </p>
                </div>
                <div class="flex gap-4 items-center">
                  <div class="text-right">
                    <span class="block text-lg font-black text-gray-900 tracking-tight">{{ formatPrice(auc.amount)
                    }}</span>
                    <span
                      v-if="auc.isHighest"
                      class="text-[8px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-2 py-0.5 rounded shadow-sm border border-green-200"
                    >En
                      Yüksek</span>
                    <span
                      v-else
                      class="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-100 px-2 py-0.5 rounded border border-red-200"
                    >Geçildi</span>
                  </div>

                  <NuxtLink
                    :to="`/auctions/${auc.auctionId}`"
                    class="bg-white border border-gray-200 text-gray-700 p-3 rounded-2xl hover:bg-gray-100 transition-all shadow-sm active:scale-95"
                  >
                    <ArrowRightIcon class="w-5 h-5" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8 text-gray-400"
          >
            <div class="text-4xl mb-2">
              🎯
            </div>
            <p class="text-sm font-medium">
              Henüz bir açık artırmaya teklif vermediniz.
            </p>
            <NuxtLink
              to="/auctions"
              class="mt-4 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-[1.5rem] hover:bg-primary-700 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg"
            >
              Keşfet
            </NuxtLink>
          </div>
        </div>

        <!-- Wallet Transactions History -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 class="text-xl font-bold text-gray-900">
              💸 Cüzdan Hareketlerim
            </h2>

            <!-- Account Switcher -->
            <div class="flex bg-gray-100 p-1 rounded-xl items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
              <button
                v-if="authStore.isVendor"
                class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap"
                :class="selectedAccountId === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                @click="handleAccountSwitch('all')"
              >
                Tümü
              </button>
              <button
                v-for="acc in accounts"
                :key="acc.id"
                class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap"
                :class="selectedAccountId === acc.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                @click="handleAccountSwitch(acc.id)"
              >
                {{ acc.type === 'MAIN' ? 'Nakit' : acc.type === 'BARTER' ? 'Barter' : 'XP' }}
              </button>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="text-xs text-indigo-600 font-bold hover:underline shrink-0"
                @click="loadTransactions"
              >
                Yenile
              </button>

              <NuxtLink
                to="/wallet/transactions"
                class="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded shadow-sm hover:bg-indigo-100 transition-colors shrink-0"
              >
                Detaylı İncele →
              </NuxtLink>
            </div>
          </div>

          <div
            v-if="txLoading"
            class="flex justify-center py-8"
          >
            <div class="spinner h-8 w-8" />
          </div>

          <div
            v-else-if="transactions.length > 0"
            class="overflow-x-auto"
          >
            <table class="w-full text-left">
              <thead
                class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
              >
                <tr>
                  <th class="px-4 py-3">
                    Tarih
                  </th>
                  <th class="px-4 py-3">
                    İşlem
                  </th>
                  <th class="px-4 py-3">
                    Hesap
                  </th>
                  <th class="px-4 py-3 text-right">
                    Miktar
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="tx in transactions"
                  :key="tx.id"
                  class="text-xs"
                >
                  <td class="px-4 py-4 text-gray-500 whitespace-nowrap">
                    {{ new Date(tx.createdAt).toLocaleDateString('tr-TR') }}
                  </td>
                  <td class="px-4 py-4">
                    <div class="font-bold text-gray-900 line-clamp-1">
                      {{ tx.description || (tx.direction === 'CREDIT' ?
                        'Giriş' : 'Çıkış') }}
                    </div>
                    <div class="text-[10px] text-gray-400 uppercase tracking-tight">
                      {{ tx.type }}
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span
                      v-if="!tx.account"
                      class="text-[10px] font-bold text-gray-400 uppercase"
                    >Bilinmiyor</span>
                    <span
                      v-else
                      class="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-tighter"
                      :class="{
                        'bg-blue-100 text-blue-700': tx.account?.type === 'MAIN',
                        'bg-orange-100 text-orange-700': tx.account?.type === 'BARTER',
                        'bg-purple-100 text-purple-700': tx.account?.type?.includes('XP')
                      }"
                    >
                      {{ tx.account?.type }}
                    </span>
                  </td>
                  <td
                    class="px-4 py-4 text-right font-black whitespace-nowrap"
                    :class="tx.direction === 'DEBIT' ? 'text-red-500' : 'text-green-600'"
                  >
                    {{ tx.direction === 'DEBIT' ? '-' : '+' }}{{ formatPrice(tx.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="text-center py-8"
          >
            <div class="text-gray-200 text-4xl mb-4">
              📑
            </div>
            <p class="text-gray-500 text-sm font-medium">
              Henüz bir işlem hareketiniz yok.
            </p>
          </div>
        </div>

        <!-- Top Up Requests -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            📋 Yükleme Taleplerim
          </h2>
          <div
            v-if="wallet.requests && wallet.requests.length > 0"
            class="space-y-4"
          >
            <div
              v-for="request in wallet.requests"
              :key="request.id"
              class="flex items-center justify-between border-b border-gray-50 py-4 last:border-b-0"
            >
              <div>
                <p class="text-lg font-black text-gray-900 tracking-tight">
                  {{ formatPrice(request.amount) }}
                </p>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {{ new Date(request.createdAt).toLocaleString('tr-TR') }}
                </p>
              </div>
              <div>
                <span
                  class="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                  :class="{
                    'bg-green-100 text-green-700 border border-green-200': request.status === 'approved',
                    'bg-amber-100 text-amber-700 border border-amber-200': request.status === 'pending',
                    'bg-red-100 text-red-700 border border-red-200': request.status === 'rejected'
                  }"
                >
                  {{ getStatusText(request.status) }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8"
          >
            <div class="text-gray-400 text-4xl mb-4 text-gray-200">
              📋
            </div>
            <p class="text-gray-500 text-sm font-medium">
              Henüz yükleme talebiniz yok.
            </p>
          </div>
        </div>

        <!-- Withdrawal Requests -->
        <div
          v-if="authStore.isVendor"
          class="bg-white rounded-lg shadow-md p-6 mt-6"
        >
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            💸 Para Çekme Taleplerim
          </h2>
          <div
            v-if="wallet.withdrawalRequests && wallet.withdrawalRequests.length > 0"
            class="space-y-4"
          >
            <div
              v-for="request in wallet.withdrawalRequests"
              :key="request.id"
              class="flex items-center justify-between border-b border-gray-50 py-4 last:border-b-0"
            >
              <div>
                <p class="text-lg font-black text-gray-900 tracking-tight">
                  {{ formatPrice(request.amount) }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] text-gray-400 uppercase font-bold">{{ new
                    Date(request.createdAt).toLocaleDateString('tr-TR') }}</span>
                  <span
                    v-if="request.bankName"
                    class="text-[9px] text-indigo-400 font-black uppercase"
                  >{{
                    request.bankName }}</span>
                </div>
              </div>
              <div class="text-right">
                <span
                  class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                  :class="{
                    'bg-amber-100 text-amber-700 border-amber-200 shadow-sm': request.status === 'pending' || request.status === 'pending_verification',
                    'bg-green-100 text-green-700 border-green-200 shadow-sm': request.status === 'approved' || request.status === 'COMPLETED',
                    'bg-red-100 text-red-700 border-red-200 shadow-sm': request.status === 'rejected' || request.status === 'FAILED'
                  }"
                >
                  {{ request.status === 'pending_verification' ? 'Onaylanmadı (Posta)' : request.status === 'pending' ? 'Bekliyor' : getStatusText(request.status)
                  }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="text-center py-8"
          >
            <div class="text-gray-200 text-4xl mb-4">
              💸
            </div>
            <p class="text-gray-500 text-sm font-medium">
              Henüz bir para çekme talebi oluşturmadınız.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon, GiftIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import WalletTopUpForm from '~/components/forms/WalletTopUpForm.vue'
import WalletWithdrawForm from '~/components/forms/WalletWithdrawForm.vue'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Cüzdanım - TicariTakas',
  meta: [
    {
      name: 'description',
      content: 'Cüzdan bakiyenizi yönetin ve işlemlerinizi takip edin.'
    }
  ]
})

// Composables
// Composables
const {
  wallet,
  loading: walletLoading,
  error: walletError,
  formatPrice,
  isCardWinner,
  fetchWallet,
  fetchTransactions,
  fetchAccountTransactions
} = useWallet()
const authStore = useAuthStore()

// Tier config mapping
const TIER_CONFIG = {
  CORE: { label: 'Çekirdek', icon: '🌱', color: 'bg-green-100 text-green-700 border-green-200', commission: 10, roi: 65 },
  PRIME: { label: 'Asil', icon: '⭐', color: 'bg-blue-100 text-blue-700 border-blue-200', commission: 8, roi: 75 },
  ELITE: { label: 'Elit', icon: '🏢', color: 'bg-orange-100 text-orange-700 border-orange-200', commission: 6, roi: 85 },
  APEX: { label: 'Zirve', icon: '🏆', color: 'bg-purple-100 text-purple-700 border-purple-200', commission: 4, roi: 100 }
}

// Computed tier info
const userTier = computed(() => authStore.user?.currentTier || authStore.user?.vendor?.vendorTier || 'CORE')
const userTierConfig = computed(() => TIER_CONFIG[userTier.value] || TIER_CONFIG.CORE)
const userTierLabel = computed(() => userTierConfig.value.label)
const tierIcon = computed(() => userTierConfig.value.icon)
const tierBadgeClass = computed(() => userTierConfig.value.color)
const tierCommissionRate = computed(() => userTierConfig.value.commission)
const tierROIRate = computed(() => userTierConfig.value.roi)

// Accounts mapping
const accounts = computed(() => wallet.value.accounts || [])
const mainAccount = computed(() => accounts.value.find(a => a.type === 'MAIN'))
const barterAccount = computed(() => accounts.value.find(a => a.type === 'BARTER'))
const commissionAccount = computed(() => accounts.value.find(a => a.type === 'XP_COMMISSION'))
const adAccount = computed(() => accounts.value.find(a => a.type === 'XP_AD'))
const serviceAccount = computed(() => accounts.value.find(a => a.type === 'XP_SERVICE'))

// State
const transactions = ref([])
const txLoading = ref(false)
const selectedAccountId = ref('all') // 'all' or specific accountId
const showBarterTopup = ref(false)
const showBarterWithdraw = ref(false)
const barterTopupAmount = ref(0)
const barterWithdrawAmount = ref(0)
const loading = ref(false)
const activeActionTab = ref('topup') // 'topup' or 'withdraw'

// Methods
const loadTransactions = async () => {
  txLoading.value = true
  try {
    let res
    if (selectedAccountId.value === 'all') {
      res = await fetchTransactions({ limit: 15 })
    } else {
      res = await fetchAccountTransactions(selectedAccountId.value, { limit: 15 })
    }

    if (res.success) {
      transactions.value = res.data
    }
  } catch (err) {
    console.error('Load transactions error:', err)
  } finally {
    txLoading.value = false
  }
}

const handleAccountSwitch = async (accountId) => {
  selectedAccountId.value = accountId
  await loadTransactions()
}

const getStatusText = (status) => {
  switch (status) {
    case 'approved':
    case 'COMPLETED':
      return 'Tamamlandı'
    case 'pending':
    case 'PENDING':
      return 'Bekliyor'
    case 'rejected':
    case 'FAILED':
      return 'Reddedildi'
    default:
      return status
  }
}

const handleTopUpSuccess = async () => {
  await fetchWallet()
  await authStore.fetchUser()
  await loadTransactions()
}

const topUpBarter = async () => {
  if (!barterTopupAmount.value || barterTopupAmount.value < 1) return

  try {
    loading.value = true
    const { $api } = useApi()
    const response = await $api('/api/barter/topup', {
      method: 'POST',
      body: { amount: barterTopupAmount.value }
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Havuza aktarım başarılı!')
      showBarterTopup.value = false
      barterTopupAmount.value = 0

      // Refresh data
      await fetchWallet()
      await authStore.fetchUser()
      await loadTransactions()
    }
  } catch (error) {
    const toast = useNuxtApp().$toast
    toast.error(error.data?.error || 'Aktarım sırasında bir hata oluştu')
    console.error('Barter topup error:', error)
    if (error.data) console.error('Barter topup error response:', error.data)
  } finally {
    loading.value = false
  }
}

const registerForBarter = async () => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/barter/register', {
      method: 'POST'
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success(response.message || 'Barter havuzuna başarıyla kayıt oldunuz!')
      await fetchWallet()
      await authStore.fetchUser()
    }
  } catch (error) {
    const toast = useNuxtApp().$toast
    toast.error(error.data?.error || 'Kayıt sırasında bir hata oluştu.')
  }
}

const withdrawBarter = async () => {
  if (!barterWithdrawAmount.value || barterWithdrawAmount.value < 1) return

  try {
    loading.value = true
    const { $api } = useApi()
    const response = await $api('/api/barter/withdraw', {
      method: 'POST',
      body: { amount: barterWithdrawAmount.value }
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Havuzdan para çekme başarılı!')
      showBarterWithdraw.value = false
      barterWithdrawAmount.value = 0

      // Refresh data
      await fetchWallet()
      await authStore.fetchUser()
      await loadTransactions()
    }
  } catch (error) {
    const toast = useNuxtApp().$toast
    toast.error(error.data?.error || 'Para çekme sırasında bir hata oluştu')
    console.error('Barter withdraw error:', error)
    if (error.data) console.error('Barter withdraw error response:', error.data)
  } finally {
    loading.value = false
  }
}

const redeemGiftCard = async (code) => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/wallet/redeem-gift-card', {
      method: 'POST',
      body: { code }
    })

    if (response.success) {
      const toast = useNuxtApp().$toast
      toast.success('Hediye kartı yüklendi!')

      // Refresh statistics
      await fetchWallet()
      await authStore.fetchUser()
      await loadTransactions()
    }
  } catch (error) {
    console.error('Redeem error:', error)
    const toast = useNuxtApp().$toast
    toast.error(error.data?.error || 'Hediye kartı yüklenirken bir hata oluştu')
  }
}

// Initialize
onMounted(async () => {
  await authStore.init()
  if (!authStore.isLoggedIn) {
    await navigateTo('/login')
    return
  }

  await fetchWallet()

  // For non-vendors, default to MAIN account instead of 'all'
  if (!authStore.isVendor && mainAccount.value) {
    selectedAccountId.value = mainAccount.value.id
  }

  await loadTransactions()
})
</script>

<style scoped>
.spinner {
  border-width: 4px;
  border-color: #e5e7eb;
  border-top-color: var(--color-primary-600, #7c3aed);
  border-radius: 9999px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* TicariTakas Card Styles */
.ticari-takas-card-container {
  padding: 1rem;
}

.ticari-takas-card {
  position: relative;
}

.card-inner {
  transform-style: preserve-3d;
}

.group:hover .card-inner {
  transform: rotateY(5deg) scale(1.02);
}

/* Card Shine Effect */
.card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
      transparent 20%,
      rgba(255, 255, 255, 0.15) 35%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0.15) 65%,
      transparent 80%);
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>