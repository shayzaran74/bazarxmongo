<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Header with Action Buttons -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase">
          Admin Dashboard
        </h1>
        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
          Platform genel bakış ve finansal durum
        </p>
        <NuxtLink to="/admin/marketing/notifications" class="mt-4 inline-block bg-red-600 text-white px-6 py-3 font-black rounded-lg">
          BURAYA TIKLA: BİLDİRİM GÖNDERME SAYFASI
        </NuxtLink>
      </div>
      <div class="flex gap-3">
        <button 
          :disabled="loading" 
          class="inline-flex items-center px-4 py-2 border border-gray-200 rounded-xl shadow-sm text-xs font-black uppercase text-gray-700 bg-white hover:bg-gray-50 transition-all disabled:opacity-50"
          @click="refreshData"
        >
          <ArrowPathIcon :class="['h-4 w-4 mr-2', loading ? 'animate-spin' : '']" />
          YENİLE
        </button>
        <NuxtLink
          to="/"
          class="inline-flex items-center px-4 py-2 border border-gray-900 rounded-xl shadow-sm text-xs font-black uppercase text-white bg-gray-900 hover:bg-gray-800 transition-all"
        >
          <HomeIcon class="h-4 w-4 mr-2" />
          ANA SAYFA
        </NuxtLink>
      </div>
    </div>

    <!-- Online Kullanıcı İstatistikleri -->
    <div class="mb-8 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
      <AdminOnlineStatsWidget />
    </div>

    <!-- Main Stats Grid -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
      <AdminDashboardStatCard
        label="Toplam Ürün"
        :value="stats.products"
        icon="ShoppingBagIcon"
        color="primary"
      />
      <AdminDashboardStatCard
        label="Toplam Kategori"
        :value="stats.categories"
        icon="FolderIcon"
        color="green"
      />
      <AdminDashboardStatCard
        label="Açık Artırma"
        :value="stats.auctions"
        icon="CurrencyDollarIcon"
        color="purple"
      />
      <AdminDashboardStatCard
        label="Çekilişler"
        :value="stats.lotteries"
        icon="TicketIcon"
        color="pink"
      />
      <AdminDashboardStatCard
        label="Toplam Kullanıcı"
        :value="stats.users"
        icon="UsersIcon"
        color="blue"
      />
      <AdminDashboardStatCard
        label="Yönetilecek Sipariş"
        :value="stats.orders"
        icon="ShoppingCartIcon"
        color="yellow"
      />
      
      <!-- Special Action Cards -->
      <AdminDashboardActionCard 
        label="Onay Bekleyenler" 
        :value="stats.pendingProducts" 
        icon="ClockIcon" 
        color="orange" 
        link="/admin/products?status=PENDING" 
      />
      <AdminDashboardActionCard 
        label="Satıcı Ürünleri" 
        :value="stats.vendorProducts" 
        icon="BuildingStorefrontIcon" 
        color="indigo" 
        link="/admin/products?vendor=true" 
      />
    </div>

    <!-- Shortcuts -->
    <AdminDashboardShortcuts class="mb-10" />

    <!-- Financial Pool Overview -->
    <div class="mb-10">
      <h2 class="text-sm font-black text-gray-900 mb-6 uppercase tracking-widest flex items-center">
        <div class="w-1.5 h-6 bg-primary-600 mr-3 rounded-full" />
        Sistem Finansal Havuzları
      </h2>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AdminDashboardPoolCard
          title="Komisyon XP"
          :value="financialStats.totalCommissionXP"
          color="indigo"
          icon="SparklesIcon"
        />
        <AdminDashboardPoolCard
          title="Reklam XP"
          :value="financialStats.totalAdXP"
          color="purple"
          icon="MegaphoneIcon"
        />
        <AdminDashboardPoolCard
          title="Servis XP"
          :value="financialStats.totalServiceXP"
          color="blue"
          icon="TruckIcon"
        />
        <AdminDashboardPoolCard
          title="Barter Havuzu"
          :value="financialStats.totalBarterBalance"
          color="rose"
          icon="ArrowPathIcon"
        />
      </div>

      <!-- XP Economy Detail Summary -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
        <AdminDashboardXPSummary
          label="Kazanılan Toplam XP"
          :value="financialStats.totalXPEarned"
          color="indigo"
          type="BRÜT"
        />
        <AdminDashboardXPSummary
          label="Harcanan Reklam XP"
          :value="financialStats.totalAdXPSpent"
          color="purple"
          type="GİDER"
        />
        <AdminDashboardXPSummary
          label="Harcanan Servis XP"
          :value="financialStats.totalServiceXPSpent"
          color="blue"
          type="GİDER"
        />
      </div>
    </div>

    <!-- Recent Activity Section -->
    <AdminDashboardActivityList
      :activities="recentActivities"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import {
  ArrowPathIcon,
  HomeIcon,
                      
} from '@heroicons/vue/24/outline'

import { useAdminDashboard } from '~/composables/useAdminDashboard'

// Layout & Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// SEO
useHead({
  title: 'Admin Dashboard - BarterBorsa',
})

const { 
  stats, 
  financialStats, 
  recentActivities, 
  loading, 
  refreshData,
  fetchStats,
  fetchFinancialStats
} = useAdminDashboard()

onMounted(() => {
  Promise.all([
    fetchStats(),
    fetchFinancialStats()
  ])
})
</script>