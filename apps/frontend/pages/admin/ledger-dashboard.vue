<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Genel Mizan
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Tüm finansal hareketler ve sipariş olaylarının immutable ledger
          kaydı
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Period Selector -->
        <div class="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
          <button
            v-for="d in periods"
            :key="d.value"
            class="px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors"
            :class="selectedDays === d.value ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'"
            @click="changePeriod(d.value)"
          >
            {{ d.label }}
          </button>
        </div>
        <button
          class="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          @click="fetchAll"
        >
          <ArrowPathIcon
            class="h-5 w-5 text-gray-600"
            :class="{ 'animate-spin': loading }"
          />
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse"
      >
        <div class="h-3 bg-gray-100 rounded w-2/3 mb-4" />
        <div class="h-8 bg-gray-100 rounded w-1/2" />
      </div>
    </div>

    <!-- KPI Cards -->
    <div
      v-if="!loading && kpis"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">
          Toplam Finansal Hacim
        </p>
        <p class="text-3xl font-black text-gray-900 mt-2 relative">
          {{ formatCurrency(kpis.totalVolume) }}
        </p>
        <div class="mt-3 flex items-center gap-1 relative">
          <span class="text-[10px] text-indigo-600 font-bold uppercase">Son {{ selectedDays }} gün</span>
        </div>
        <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-100 rounded-full opacity-30" />
      </div>

      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">
          Cüzdan İşlemleri
        </p>
        <p class="text-3xl font-black text-gray-900 mt-2 relative">
          {{ formatNumber(kpis.walletTxCount) }}
        </p>
        <div class="mt-3 relative">
          <span class="text-[10px] text-green-600 font-bold uppercase">WALLET_TX eventi</span>
        </div>
        <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-green-100 rounded-full opacity-30" />
      </div>

      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">
          Sipariş Olayları
        </p>
        <p class="text-3xl font-black text-gray-900 mt-2 relative">
          {{ formatNumber(kpis.orderEventCount) }}
        </p>
        <div class="mt-3 relative">
          <span class="text-[10px] text-amber-600 font-bold uppercase">ORDER_STATUS eventi</span>
        </div>
        <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-100 rounded-full opacity-30" />
      </div>

      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest relative">
          Toplam Ledger Kaydı
        </p>
        <p class="text-3xl font-black text-gray-900 mt-2 relative">
          {{ formatNumber(kpis.totalEvents) }}
        </p>
        <div class="mt-3 relative">
          <span class="text-[10px] text-purple-600 font-bold uppercase">Tüm event türleri</span>
        </div>
        <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-100 rounded-full opacity-30" />
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Daily Activity Chart -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">
              Günlük Ledger Aktivitesi
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Finansal ve sipariş olaylarının günlük dağılımı
            </p>
          </div>
        </div>
        <ClientOnly>
          <apexchart
            v-if="!loading && dailySeries[0]?.data?.length"
            type="area"
            height="280"
            :options="dailyChartOptions"
            :series="dailySeries"
          />
          <div
            v-else-if="!loading"
            class="flex items-center justify-center h-64 text-xs text-gray-400 font-bold uppercase tracking-widest"
          >
            Gösterilecek veri yok
          </div>
          <div
            v-else
            class="h-64 bg-gray-50 rounded-xl animate-pulse"
          />
        </ClientOnly>
      </div>

      <!-- Event Distribution Donut -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="mb-6">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">
            Event Dağılımı
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Ledger türlerine göre dağılım
          </p>
        </div>
        <ClientOnly>
          <apexchart
            v-if="!loading && distSeries.length"
            type="donut"
            height="280"
            :options="distChartOptions"
            :series="distSeries"
          />
          <div
            v-else-if="!loading"
            class="flex items-center justify-center h-64 text-xs text-gray-400 font-bold uppercase tracking-widest"
          >
            Gösterilecek veri yok
          </div>
          <div
            v-else
            class="h-64 bg-gray-50 rounded-xl animate-pulse"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Volume Chart Row 2 -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">
            Günlük Finansal Hacim (TL)
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Wallet TX işlemlerinin günlük parasal büyüklüğü
          </p>
        </div>
      </div>
      <ClientOnly>
        <apexchart
          v-if="!loading && volumeSeries[0]?.data?.length"
          type="bar"
          height="220"
          :options="volumeChartOptions"
          :series="volumeSeries"
        />
        <div
          v-else-if="!loading"
          class="flex items-center justify-center h-48 text-xs text-gray-400 font-bold uppercase tracking-widest"
        >
          Gösterilecek veri yok
        </div>
        <div
          v-else
          class="h-48 bg-gray-50 rounded-xl animate-pulse"
        />
      </ClientOnly>
    </div>

    <!-- Recent Ledger Entries Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">
            Son Ledger Kayıtları
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            En son 20 immutable journal girişi
          </p>
        </div>
        <NuxtLink
          to="/admin/wallet-transactions"
          class="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Tüm Hareketler →
        </NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th class="px-6 py-3">
                Tarih
              </th>
              <th class="px-6 py-3">
                Tür
              </th>
              <th class="px-6 py-3">
                Açıklama
              </th>
              <th class="px-6 py-3">
                Miktar
              </th>
              <th class="px-6 py-3">
                Ref. ID
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <template v-if="loading">
              <tr
                v-for="i in 5"
                :key="i"
                class="animate-pulse"
              >
                <td
                  colspan="5"
                  class="px-6 py-4"
                >
                  <div class="h-4 bg-gray-100 rounded w-full" />
                </td>
              </tr>
            </template>
            <tr v-if="!loading && recentEntries.length === 0">
              <td
                colspan="5"
                class="px-6 py-12 text-center text-xs text-gray-400 font-bold uppercase tracking-widest"
              >
                Henüz ledger kaydı yok
              </td>
            </tr>
            <tr
              v-for="entry in recentEntries"
              :key="entry.id"
              class="hover:bg-gray-50/50 transition-colors text-sm"
            >
              <td class="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                {{ formatDate(entry.createdAt)
                }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getTypeBadge(entry.type)"
                  class="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                >
                  {{ entry.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-600 text-xs max-w-xs truncate">
                {{ entry.description || '—' }}
              </td>
              <td
                class="px-6 py-4 font-black text-xs"
                :class="entry.amount > 0 ? 'text-green-600' : entry.amount < 0 ? 'text-red-500' : 'text-gray-400'"
              >
                {{ entry.amount ? formatCurrency(Math.abs(entry.amount)) : '—' }}
              </td>
              <td class="px-6 py-4 text-gray-400 text-xs font-mono">
                {{ entry.referenceId ?
                  String(entry.referenceId).slice(0, 12) + '…' : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ─── Anomali Tespiti ──────────────────────────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="relative">
            <span class="text-lg">🔴</span>
            <span
              v-if="anomalySummary.high > 0"
              class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white"
            >{{
              anomalySummary.high }}</span>
          </div>
          <div>
            <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">
              Anomali Uyarıları
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Son 60 dakikada tespit edilen şüpheli işlemler
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Severity filter -->
          <div class="flex gap-1">
            <button
              v-for="s in severityFilters"
              :key="s.value"
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors"
              :class="anomalySeverityFilter === s.value ? s.activeClass : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
              @click="anomalySeverityFilter = s.value; fetchAnomalies()"
            >
              {{ s.label }}
            </button>
          </div>
          <button
            class="p-1.5 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
            @click="fetchAnomalies"
          >
            <ArrowPathIcon
              class="h-4 w-4 text-gray-500"
              :class="{ 'animate-spin': anomalyLoading }"
            />
          </button>
        </div>
      </div>

      <!-- Summary Badges -->
      <div
        v-if="!anomalyLoading && anomalySummary.total > 0"
        class="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-4"
      >
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-red-500" />
          <span class="text-[10px] font-black text-gray-500 uppercase">{{ anomalySummary.high }} Yüksek</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-400" />
          <span class="text-[10px] font-black text-gray-500 uppercase">{{ anomalySummary.medium }} Orta</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-green-400" />
          <span class="text-[10px] font-black text-gray-500 uppercase">{{ anomalySummary.low }} Düşük</span>
        </div>
      </div>

      <!-- Alert List -->
      <div class="divide-y divide-gray-50">
        <!-- Loading -->
        <template v-if="anomalyLoading">
          <div
            v-for="i in 3"
            :key="'al' + i"
            class="px-6 py-4 animate-pulse"
          >
            <div class="h-4 bg-gray-100 rounded w-3/4 mb-2" />
            <div class="h-3 bg-gray-50 rounded w-1/2" />
          </div>
        </template>

        <!-- Empty -->
        <div
          v-else-if="!anomalyAlerts.length"
          class="px-6 py-10 text-center text-xs text-gray-400 font-bold uppercase tracking-widest"
        >
          ✅ Şüpheli işlem tespit edilmedi
        </div>

        <!-- Alert Rows -->
        <div
          v-for="alert in anomalyAlerts"
          :key="alert.rule + alert.userId + alert.detectedAt"
          class="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors"
        >
          <div class="flex items-start gap-4 flex-1 min-w-0">
            <!-- Severity Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <span
                v-if="alert.severity === 'HIGH'"
                class="text-base"
              >🔴</span>
              <span
                v-else-if="alert.severity === 'MEDIUM'"
                class="text-base"
              >🟡</span>
              <span
                v-else
                class="text-base"
              >🟢</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  :class="getSeverityBadge(alert.severity)"
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest flex-shrink-0"
                >
                  {{ alert.severity }}
                </span>
                <span
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md"
                >
                  {{ alert.rule.replace(/_/g, ' ') }}
                </span>
              </div>
              <p class="text-sm text-gray-800 font-medium mt-1">
                {{ alert.message }}
              </p>
              <div class="flex items-center gap-3 mt-1">
                <span
                  v-if="alert.userName"
                  class="text-xs text-gray-500 font-bold"
                >
                  👤 {{ alert.userName }}
                </span>
                <span
                  v-if="alert.userEmail"
                  class="text-xs text-gray-400"
                >{{ alert.userEmail }}</span>
                <span class="text-xs text-gray-400">
                  {{ formatDate(alert.detectedAt) }}
                </span>
              </div>
            </div>
          </div>
          <!-- Quick Action -->
          <div
            v-if="alert.userId"
            class="flex-shrink-0"
          >
            <NuxtLink
              :to="`/admin/users?search=${alert.userEmail || alert.userId}`"
              class="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 transition-colors whitespace-nowrap"
            >
              İncele →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Last Scanned -->
      <div
        v-if="anomalyLastScanned"
        class="px-6 py-3 bg-gray-50 border-t border-gray-100"
      >
        <p class="text-[10px] text-gray-400 font-bold">
          Son tarama: {{ formatDate(anomalyLastScanned) }} — 5 dakikada bir otomatik yenilenir
        </p>
      </div>
    </div>

    <!-- ─── Finansal Mutabakat (Reconciliation) ───────────────────────── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-tight">
            Finansal Mutabakat Analizi
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">
            Cüzdan bakiyeleri ile işlem geçmişlerinin çapraz kontrolü
            (ACID Audit)
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            :disabled="reconLoading"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
            @click="triggerReconciliation"
          >
            <ArrowPathIcon
              class="h-4 w-4"
              :class="{ 'animate-spin': reconLoading }"
            />
            Sistemi Denetle (Audit)
          </button>
        </div>
      </div>

      <!-- Recon Summary Stats -->
      <div
        v-if="reconResult"
        class="grid grid-cols-1 sm:grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-white"
      >
        <div class="p-6 text-center">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Denetlenen Birim
          </p>
          <p class="text-2xl font-black text-gray-900 mt-1">
            {{ formatNumber((reconResult.stats.totalAccounts || 0) + (reconResult.stats.totalVendors || 0))
            }}
          </p>
        </div>
        <div class="p-6 text-center">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Tespit Edilen Hata
          </p>
          <p
            class="text-2xl font-black mt-1"
            :class="reconResult.stats.issuesCount > 0 ? 'text-red-600' : 'text-green-600'"
          >
            {{ formatNumber(reconResult.stats.issuesCount) }}
          </p>
        </div>
        <div class="p-6 text-center">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Sistem Durumu
          </p>
          <div class="mt-2 flex justify-center">
            <span
              v-if="reconResult.success"
              class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              ✅ GÜVENLİ (STABLE)
            </span>
            <span
              v-else
              class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-widest"
            >
              ⚠️ RİSKLİ (DISCREPANCY)
            </span>
          </div>
        </div>
      </div>

      <!-- Discrepancy List -->
      <div
        v-if="reconResult && reconResult.discrepancies.length > 0"
        class="overflow-x-auto"
      >
        <table class="w-full text-left">
          <thead class="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th class="px-6 py-3">
                Hesap/Üye/Satıcı
              </th>
              <th class="px-6 py-3">
                Tür
              </th>
              <th class="px-6 py-3">
                Sorun
              </th>
              <th class="px-6 py-3">
                Beklenen (Tx)
              </th>
              <th class="px-6 py-3">
                Mevcut (Db)
              </th>
              <th class="px-6 py-3">
                Fark
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="d in reconResult.discrepancies"
              :key="d.accountId || d.vendorId"
              class="hover:bg-red-50/30 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-xs font-black text-gray-900 uppercase">{{ d.vendorName ||
                    d.userEmail || d.userId }}</span>
                  <span class="text-[9px] font-mono text-gray-400">{{ d.accountId || d.vendorId
                  }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest"
                >
                  {{ d.accountType || d.currency }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span
                    v-for="issue in d.issues"
                    :key="issue.type"
                    class="text-[10px] text-red-600 font-bold uppercase"
                  >
                    ❌ {{ issue.type.replace(/_/g, ' ') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-mono text-gray-500 text-right">
                <div class="flex flex-col">
                  <span
                    v-for="issue in d.issues"
                    :key="issue.type"
                  >{{ issue.expected }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-xs font-mono text-gray-900 font-bold text-right">
                <div class="flex flex-col">
                  <span
                    v-for="issue in d.issues"
                    :key="issue.type"
                  >{{ issue.actual }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex flex-col">
                  <span
                    v-for="issue in d.issues"
                    :key="issue.type"
                    class="text-xs font-black"
                    :class="Number(issue.diff) !== 0 ? 'text-red-600' : 'text-gray-400'"
                  >
                    {{ issue.diff }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-else-if="reconResult"
        class="px-6 py-12 text-center"
      >
        <div
          class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircleIcon class="h-6 w-6" />
        </div>
        <p class="text-sm font-black text-gray-900 uppercase tracking-tight">
          Mükemmel Uyum
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Tüm cüzdanlar ve vendor bakiyeleri işlem geçmişiyle %100
          örtüşüyor.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'admin'
})

const { $api } = useApi()

const loading = ref(false)
const selectedDays = ref(30)

const periods = [
    { label: '7G', value: 7 },
    { label: '30G', value: 30 },
    { label: '90G', value: 90 }
]

// Data
const ledgerData = ref({ daily: [], distribution: [] })
const recentEntries = ref([])

// --- Computed KPIs ---
const kpis = computed(() => {
    if (!ledgerData.value.daily?.length) return null
    const totalVolume = ledgerData.value.daily.reduce((sum, d) => sum + (d.totalTxVolume || 0), 0)
    const walletTxCount = ledgerData.value.daily.reduce((sum, d) => sum + (d.WALLET_TX || 0), 0)
    const orderEventCount = ledgerData.value.daily.reduce((sum, d) => sum + (d.ORDER_STATUS || 0), 0)
    const totalEvents = ledgerData.value.distribution.reduce((sum, d) => sum + (d.value || 0), 0)
    return { totalVolume, walletTxCount, orderEventCount, totalEvents }
})

// --- Chart Series ---
const dailyCategories = computed(() =>
    ledgerData.value.daily.map(d => {
        const dt = new Date(d.date)
        return `${dt.getDate()} ${dt.toLocaleString('tr-TR', { month: 'short' })}`
    })
)

const dailySeries = computed(() => [
    { name: 'Cüzdan TX', data: ledgerData.value.daily.map(d => d.WALLET_TX || 0) },
    { name: 'Sipariş Olayı', data: ledgerData.value.daily.map(d => d.ORDER_STATUS || 0) },
    { name: 'Diğer', data: ledgerData.value.daily.map(d => d.OTHER || 0) }
])

const distSeries = computed(() => ledgerData.value.distribution.map(d => d.value))
const distLabels = computed(() => ledgerData.value.distribution.map(d => d.name.replace(/_/g, ' ')))

const volumeSeries = computed(() => [
    { name: 'Finansal Hacim (TL)', data: ledgerData.value.daily.map(d => Math.round(d.totalTxVolume || 0)) }
])

// --- Chart Options ---
const dailyChartOptions = computed(() => ({
    chart: {
        type: 'area',
        fontFamily: 'inherit',
        toolbar: { show: false },
        zoom: { enabled: false },
        sparkline: { enabled: false }
    },
    colors: ['#6366f1', '#f59e0b', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] }
    },
    xaxis: {
        categories: dailyCategories.value,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '10px', fontWeight: 700, colors: '#9ca3af' } }
    },
    yaxis: {
        min: 0,
        labels: {
            formatter: val => Math.floor(val),
            style: { fontSize: '10px', colors: '#9ca3af' }
        }
    },
    legend: { position: 'top', horizontalAlign: 'right', fontSize: '11px', fontWeight: 700 },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    tooltip: { shared: true, intersect: false }
}))

const distChartOptions = computed(() => ({
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: distLabels.value,
    colors: ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316'],
    legend: { position: 'bottom', fontSize: '10px', fontWeight: 700 },
    plotOptions: {
        pie: {
            donut: {
                size: '68%',
                labels: {
                    show: true,
                    name: { show: true, fontSize: '11px', fontWeight: 700 },
                    value: { show: true, formatter: v => formatNumber(v), fontSize: '14px', fontWeight: 900 },
                    total: {
                        show: true,
                        label: 'Toplam',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#6b7280',
                        formatter: () => formatNumber(kpis.value?.totalEvents || 0)
                    }
                }
            }
        }
    },
    dataLabels: { enabled: false }
}))

const volumeChartOptions = computed(() => ({
    chart: {
        type: 'bar',
        fontFamily: 'inherit',
        toolbar: { show: false }
    },
    colors: ['#6366f1'],
    plotOptions: {
        bar: { borderRadius: 4, columnWidth: '60%' }
    },
    dataLabels: { enabled: false },
    xaxis: {
        categories: dailyCategories.value,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: '10px', fontWeight: 700, colors: '#9ca3af' } }
    },
    yaxis: {
        labels: {
            formatter: val => formatCurrencyShort(val),
            style: { fontSize: '10px', colors: '#9ca3af' }
        }
    },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    tooltip: {
        y: { formatter: val => formatCurrency(val) }
    }
}))

// --- Fetch ---
const fetchAll = async () => {
    loading.value = true
    try {
        const [ledgerRes, recentRes] = await Promise.all([
            $api(`/api/admin/analytics/ledger?days=${selectedDays.value}`),
            $api('/api/admin/wallet/transactions?page=1&limit=20')
        ])

        if (ledgerRes?.success) {
            ledgerData.value = ledgerRes.data
        }

        if (recentRes?.success) {
            recentEntries.value = recentRes.data || []
        }
    } catch (err) {
        console.error('Ledger dashboard fetch error:', err)
    } finally {
        loading.value = false
    }
}

const changePeriod = (days) => {
    selectedDays.value = days
    fetchAll()
}

// --- Formatters ---
const formatNumber = (val) => new Intl.NumberFormat('tr-TR').format(val || 0)

const formatCurrency = (val) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)

const formatCurrencyShort = (val) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₺`
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K ₺`
    return `${val} ₺`
}

const formatDate = (date) => new Date(date).toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
})

const getTypeBadge = (type) => {
    const map = {
        WALLET_TX: 'bg-indigo-100 text-indigo-700',
        ORDER_STATUS_CHANGED: 'bg-amber-100 text-amber-700',
        FINANCIAL_HOLD: 'bg-blue-100 text-blue-700',
        FINANCIAL_RELEASE: 'bg-green-100 text-green-700',
        FINANCIAL_TAX: 'bg-red-100 text-red-700',
        XP_EARNED: 'bg-purple-100 text-purple-700',
        XP_SPENT: 'bg-pink-100 text-pink-700'
    }
    return map[type] || 'bg-gray-100 text-gray-600'
}

// --- Anomaly Detection ---
const anomalyAlerts = ref([])
const anomalySummary = ref({ total: 0, high: 0, medium: 0, low: 0 })
const anomalyLoading = ref(false)
const anomalySeverityFilter = ref('')
const anomalyLastScanned = ref(null)
let anomalyTimer = null

const severityFilters = [
    { label: 'Tümü', value: '', activeClass: 'bg-gray-800 text-white' },
    { label: '🔴 High', value: 'HIGH', activeClass: 'bg-red-500 text-white' },
    { label: '🟡 Medium', value: 'MEDIUM', activeClass: 'bg-amber-400 text-white' },
    { label: '🟢 Low', value: 'LOW', activeClass: 'bg-green-500 text-white' },
]

const fetchAnomalies = async () => {
    anomalyLoading.value = true
    try {
        const params = new URLSearchParams({ window: '60' })
        if (anomalySeverityFilter.value) params.set('severity', anomalySeverityFilter.value)

        const res = await $api(`/api/admin/analytics/anomalies?${params.toString()}`)
        if (res?.success) {
            anomalyAlerts.value = res.data.alerts || []
            anomalySummary.value = res.data.summary || { total: 0, high: 0, medium: 0, low: 0 }
            anomalyLastScanned.value = res.data.scannedAt
        }
    } catch (err) {
        console.error('Anomaly fetch error:', err)
    } finally {
        anomalyLoading.value = false
    }
}

const getSeverityBadge = (severity) => {
    return {
        HIGH: 'bg-red-100 text-red-700',
        MEDIUM: 'bg-amber-100 text-amber-700',
        LOW: 'bg-green-100 text-green-700',
    }[severity] || 'bg-gray-100 text-gray-600'
}

// --- Reconciliation ---
const reconLoading = ref(false)
const reconResult = ref(null)

const triggerReconciliation = async () => {
    if (!confirm('Tüm sistemi denetlemek (Audit) sunucu yükünü artırabilir. Devam etmek istiyor musunuz?')) return

    reconLoading.value = true
    try {
        const res = await $api('/api/admin/wallet/reconcile', {
            method: 'POST',
            body: { autoSuspend: false }
        })
        if (res) {
            reconResult.value = res.data
            if (!res.success) {
                // Show floating alert or something if needed
                console.warn('Reconciliation issues found!', res.data)
            }
        }
    } catch (err) {
        console.error('Reconciliation error:', err)
    } finally {
        reconLoading.value = false
    }
}

onMounted(() => {
    fetchAll()
    fetchAnomalies()
    // Auto-refresh anomalies every 5 minutes
    anomalyTimer = setInterval(fetchAnomalies, 5 * 60 * 1000)
})

onUnmounted(() => {
    if (anomalyTimer) clearInterval(anomalyTimer)
})
</script>
