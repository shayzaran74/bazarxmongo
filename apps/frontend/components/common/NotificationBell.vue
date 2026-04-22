<template>
  <div class="relative">
    <!-- Bell Button -->
    <button
      class="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
      @click="toggleDropdown"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Unread Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 animate-pulse"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="text-sm font-black text-gray-900 uppercase tracking-wide">
            Bildirimler
          </h3>
          <button
            v-if="unreadCount > 0"
            class="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest"
            @click="markAllAsRead"
          >
            TÜMÜNÜ OKU
          </button>
        </div>

        <!-- Notification List -->
        <div class="max-h-96 overflow-y-auto divide-y divide-gray-50">
          <div
            v-if="loading && notifications.length === 0"
            class="flex items-center justify-center py-12"
          >
            <div class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>

          <div
            v-else-if="notifications.length === 0"
            class="flex flex-col items-center justify-center py-12 gap-3"
          >
            <span class="text-3xl">🔔</span>
            <p class="text-sm font-bold text-gray-400">Bildirim bulunmuyor</p>
          </div>

          <button
            v-for="notif in notifications"
            :key="notif.id"
            class="w-full flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
            :class="!notif.isRead ? 'bg-primary-50/50' : ''"
            @click="handleNotifClick(notif)"
          >
            <!-- Dot -->
            <div class="mt-1.5 flex-shrink-0">
              <div
                class="w-2 h-2 rounded-full"
                :class="notif.isRead ? 'bg-gray-200' : 'bg-primary-500'"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-black text-gray-900 leading-snug">
                {{ notif.title }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                {{ notif.message }}
              </p>
              <p class="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-widest">
                {{ formatTime(notif.createdAt) }}
              </p>
            </div>
          </button>
        </div>

        <!-- Load More -->
        <div
          v-if="hasMore"
          class="border-t border-gray-100 p-3"
        >
          <button
            class="w-full text-center text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-widest transition-colors py-1"
            :disabled="loading"
            @click="loadMore"
          >
            {{ loading ? 'YÜKLENİYOR...' : 'DAHA FAZLA GÖSTER' }}
          </button>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-100 p-3">
          <NuxtLink
            to="/profile"
            class="block text-center text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors"
            @click="showDropdown = false"
          >
            TÜM BİLDİRİMLERİ GÖR
          </NuxtLink>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="showDropdown = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'
import type { Notification } from '~/stores/notification'

const {
  notifications, unreadCount, loading, hasMore,
  showDropdown,
  loadMore, markAsRead, markAllAsRead,
  toggleDropdown, formatTime,
} = useNotifications()

const handleNotifClick = (notif: Notification) => {
  markAsRead(notif.id)
  showDropdown.value = false
  if (notif.link) {
    navigateTo(notif.link)
  }
}
</script>
