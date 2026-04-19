<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            İçerik Yönetimi
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            Kampanya duyuruları, politikalar ve dinamik içerikleri yönetin
          </p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-6">
        <nav class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="[
              'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
            @click="activeTab = tab.key"
          >
            <component
              :is="tab.icon"
              class="w-5 h-5 inline-block mr-2"
            />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- ANNOUNCEMENTS TAB -->
      <div
        v-if="activeTab === 'announcements'"
        class="space-y-6"
      >
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900">
            Kampanya Duyuruları
          </h2>
          <button
            class="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2"
            @click="openAnnouncementModal()"
          >
            <PlusIcon class="w-5 h-5" />
            Yeni Duyuru
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Başlık
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Tür
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Hedef Sayfa
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Tarih Aralığı
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Durum
                </th>
                <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in announcements"
                :key="item.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <span class="font-medium text-gray-900">{{ item.title }}</span>
                </td>
                <td class="py-3 px-4">
                  <span
                    :class="getTypeClass(item.type)"
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {{ getTypeName(item.type) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-gray-600">
                  {{ item.targetPage || 'Tümü' }}
                </td>
                <td class="py-3 px-4 text-gray-600 text-sm">
                  {{ formatDate(item.startDate) }}
                  <span v-if="item.endDate"> - {{ formatDate(item.endDate) }}</span>
                </td>
                <td class="py-3 px-4">
                  <span
                    :class="item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {{ item.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    class="text-orange-600 hover:text-orange-700 mr-3"
                    @click="openAnnouncementModal(item)"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button
                    class="text-red-600 hover:text-red-700"
                    @click="deleteAnnouncement(item.id)"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="announcements.length === 0">
                <td
                  colspan="6"
                  class="py-12 text-center text-gray-500"
                >
                  Henüz duyuru eklenmemiş
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- POLICIES TAB -->
      <div
        v-if="activeTab === 'policies'"
        class="space-y-6"
      >
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900">
            Politika ve Sözleşmeler
          </h2>
          <button
            class="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2"
            @click="openPolicyModal()"
          >
            <PlusIcon class="w-5 h-5" />
            Yeni Politika
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="policy in policies"
            :key="policy.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DocumentTextIcon class="w-5 h-5 text-blue-600" />
              </div>
              <span
                :class="policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                class="px-2.5 py-1 rounded-full text-xs font-medium"
              >
                {{ policy.isActive ? 'Yayında' : 'Taslak' }}
              </span>
            </div>
            <h3 class="font-bold text-gray-900 mb-1">
              {{ policy.title }}
            </h3>
            <p class="text-sm text-gray-500 mb-3">
              Tür: {{ getPolicyTypeName(policy.type) }} | v{{ policy.version }}
            </p>
            <div class="flex gap-2">
              <button
                class="flex-1 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
                @click="openPolicyModal(policy)"
              >
                Düzenle
              </button>
              <button
                class="py-2 px-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                @click="deletePolicy(policy.id)"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- DYNAMIC CONTENT TAB -->
      <div
        v-if="activeTab === 'contents'"
        class="space-y-6"
      >
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold text-gray-900">
            Dinamik İçerikler
          </h2>
          <button
            class="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 flex items-center gap-2"
            @click="openContentModal()"
          >
            <PlusIcon class="w-5 h-5" />
            Yeni İçerik
          </button>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Anahtar
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Başlık
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Kategori
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Tür
                </th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Durum
                </th>
                <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in contents"
                :key="item.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700">{{ item.key }}</code>
                </td>
                <td class="py-3 px-4 font-medium text-gray-900">
                  {{ item.title }}
                </td>
                <td class="py-3 px-4 text-gray-600">
                  {{ item.category || '-' }}
                </td>
                <td class="py-3 px-4 text-gray-600">
                  {{ item.contentType }}
                </td>
                <td class="py-3 px-4">
                  <span
                    :class="item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                  >
                    {{ item.isActive ? 'Aktif' : 'Pasif' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    class="text-orange-600 hover:text-orange-700 mr-3"
                    @click="openContentModal(item)"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button
                    class="text-red-600 hover:text-red-700"
                    @click="deleteContent(item.id)"
                  >
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </td>
              </tr>
              <tr v-if="contents.length === 0">
                <td
                  colspan="6"
                  class="py-12 text-center text-gray-500"
                >
                  Henüz içerik eklenmemiş
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Announcement Modal -->
    <Teleport to="body">
      <div
        v-if="showAnnouncementModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru' }}
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
              <input
                v-model="announcementForm.title"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
              <textarea
                v-model="announcementForm.content"
                rows="4"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                <select
                  v-model="announcementForm.type"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="info">
                    Bilgilendirme
                  </option>
                  <option value="warning">
                    Uyarı
                  </option>
                  <option value="success">
                    Başarı
                  </option>
                  <option value="promo">
                    Promosyon
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hedef Sayfa</label>
                <select
                  v-model="announcementForm.targetPage"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="all">
                    Tüm Sayfalar
                  </option>
                  <option value="homepage">
                    Ana Sayfa
                  </option>
                  <option value="checkout">
                    Ödeme
                  </option>
                  <option value="cart">
                    Sepet
                  </option>
                  <option value="help">
                    Yardım
                  </option>
                  <option value="vendor_app">
                    Satıcı Başvurusu
                  </option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
                <input
                  v-model="announcementForm.startDate"
                  type="datetime-local"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bitiş (Opsiyonel)</label>
                <input
                  v-model="announcementForm.endDate"
                  type="datetime-local"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dosya Yükle (PDF/Görsel)</label>
                <div class="flex gap-2">
                  <input
                    ref="fileInput"
                    type="file"
                    class="hidden"
                    accept=".pdf,image/*"
                    @change="handleFileUpload"
                  >
                  <button
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2"
                    @click="$refs.fileInput.click()"
                  >
                    <CloudArrowUpIcon class="w-4 h-4 text-gray-500" />
                    {{ uploading ? 'Yükleniyor...' : 'Dosya Seç' }}
                  </button>
                  <button
                    v-if="announcementForm.linkUrl"
                    class="px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                    @click="announcementForm.linkUrl = ''; announcementForm.linkText = ''"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bağlantı Metni / Dosya Adı</label>
                <input
                  v-model="announcementForm.linkText"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="Örn: Rehberi İndir"
                >
              </div>
            </div>
            <div
              v-if="announcementForm.linkUrl"
              class="text-xs text-blue-600 truncate border-t pt-2"
            >
              Bağlantı: {{ announcementForm.linkUrl }}
            </div>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input
                  v-model="announcementForm.isActive"
                  type="checkbox"
                  class="rounded border-gray-300 text-orange-500"
                >
                <span class="text-sm text-gray-700">Aktif</span>
              </label>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                <input
                  v-model.number="announcementForm.priority"
                  type="number"
                  class="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                >
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              @click="showAnnouncementModal = false"
            >
              İptal
            </button>
            <button
              class="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              @click="saveAnnouncement"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Policy Modal -->
    <Teleport to="body">
      <div
        v-if="showPolicyModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingPolicy ? 'Politika Düzenle' : 'Yeni Politika' }}
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  v-model="policyForm.title"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                  v-model="policyForm.slug"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="gizlilik-politikasi"
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tür</label>
                <select
                  v-model="policyForm.type"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="privacy">
                    Gizlilik Politikası
                  </option>
                  <option value="terms">
                    Kullanım Koşulları
                  </option>
                  <option value="return">
                    İade Politikası
                  </option>
                  <option value="shipping">
                    Kargo Politikası
                  </option>
                  <option value="cookies">
                    Çerez Politikası
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Versiyon</label>
                <input
                  v-model="policyForm.version"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="1.0"
                >
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
              <textarea
                v-model="policyForm.content"
                rows="12"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="policyForm.isActive"
                type="checkbox"
                class="rounded border-gray-300 text-orange-500"
              >
              <span class="text-sm text-gray-700">Yayında</span>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              @click="showPolicyModal = false"
            >
              İptal
            </button>
            <button
              class="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              @click="savePolicy"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Content Modal -->
    <Teleport to="body">
      <div
        v-if="showContentModal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">
              {{ editingContent ? 'İçerik Düzenle' : 'Yeni İçerik' }}
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Anahtar (Benzersiz)</label>
                <input
                  v-model="contentForm.key"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  placeholder="about-us-hero"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  v-model="contentForm.title"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  v-model="contentForm.category"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">
                    Seçiniz
                  </option>
                  <option value="help">
                    Yardım
                  </option>
                  <option value="faq">
                    SSS
                  </option>
                  <option value="about">
                    Hakkımızda
                  </option>
                  <option value="contact">
                    İletişim
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">İçerik Türü</label>
                <select
                  v-model="contentForm.contentType"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="text">
                    Düz Metin
                  </option>
                  <option value="html">
                    HTML
                  </option>
                  <option value="markdown">
                    Markdown
                  </option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
              <textarea
                v-model="contentForm.content"
                rows="10"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="contentForm.isActive"
                type="checkbox"
                class="rounded border-gray-300 text-orange-500"
              >
              <span class="text-sm text-gray-700">Aktif</span>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              class="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              @click="showContentModal = false"
            >
              İptal
            </button>
            <button
              class="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
              @click="saveContent"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  MegaphoneIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'admin', middleware: 'admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast
const activeTab = ref('announcements')
const uploading = ref(false)

const tabs = [
  { key: 'announcements', label: 'Kampanya Duyuruları', icon: MegaphoneIcon },
  { key: 'policies', label: 'Politikalar', icon: DocumentTextIcon },
  { key: 'contents', label: 'Dinamik İçerikler', icon: PuzzlePieceIcon }
]

// Data
const announcements = ref([])
const policies = ref([])
const contents = ref([])

// Modals
const showAnnouncementModal = ref(false)
const showPolicyModal = ref(false)
const showContentModal = ref(false)

const editingAnnouncement = ref(null)
const editingPolicy = ref(null)
const editingContent = ref(null)

// Forms
const announcementForm = ref({
  title: '',
  content: '',
  type: 'info',
  targetPage: 'all',
  startDate: '',
  endDate: '',
  linkUrl: '',
  linkText: '',
  isActive: true,
  priority: 0
})

const policyForm = ref({
  title: '',
  slug: '',
  content: '',
  type: 'privacy',
  version: '1.0',
  isActive: true
})

const contentForm = ref({
  key: '',
  title: '',
  content: '',
  contentType: 'text',
  category: '',
  isActive: true
})

// Fetch data
const fetchAnnouncements = async () => {
  try {
    const data = await $api('/api/dynamic/admin/announcements')
    if (data?.success) announcements.value = data.data
  } catch (e) { console.error(e) }
}

const fetchPolicies = async () => {
  try {
    const data = await $api('/api/dynamic/admin/policies')
    if (data?.success) policies.value = data.data
  } catch (e) { console.error(e) }
}

const fetchContents = async () => {
  try {
    const data = await $api('/api/dynamic/admin/contents')
    if (data?.success) contents.value = data.data
  } catch (e) { console.error(e) }
}

onMounted(() => {
  fetchAnnouncements()
  fetchPolicies()
  fetchContents()
})

// Modal handlers
const openAnnouncementModal = (item = null) => {
  editingAnnouncement.value = item
  if (item) {
    announcementForm.value = { ...item }
    if (item.startDate) announcementForm.value.startDate = new Date(item.startDate).toISOString().slice(0, 16)
    if (item.endDate) announcementForm.value.endDate = new Date(item.endDate).toISOString().slice(0, 16)
  } else {
    announcementForm.value = { title: '', content: '', type: 'info', targetPage: 'all', startDate: '', endDate: '', linkUrl: '', linkText: '', isActive: true, priority: 0 }
  }
  showAnnouncementModal.value = true
}

const openPolicyModal = (item = null) => {
  editingPolicy.value = item
  policyForm.value = item ? { ...item } : { title: '', slug: '', content: '', type: 'privacy', version: '1.0', isActive: true }
  showPolicyModal.value = true
}

const openContentModal = (item = null) => {
  editingContent.value = item
  contentForm.value = item ? { ...item } : { key: '', title: '', content: '', contentType: 'text', category: '', isActive: true }
  showContentModal.value = true
}

// Save handlers
const saveAnnouncement = async () => {
  try {
    const method = editingAnnouncement.value ? 'PUT' : 'POST'
    const url = editingAnnouncement.value
      ? `/api/dynamic/admin/announcements/${editingAnnouncement.value.id}`
      : '/api/dynamic/admin/announcements'

    await $api(url, {
      method,
      body: announcementForm.value
    })
    showAnnouncementModal.value = false
    fetchAnnouncements()
  } catch (e) {
    console.error(e)
    alert('Hata oluştu!')
  }
}

const savePolicy = async () => {
  try {
    const method = editingPolicy.value ? 'PUT' : 'POST'
    const url = editingPolicy.value
      ? `/api/dynamic/admin/policies/${editingPolicy.value.id}`
      : '/api/dynamic/admin/policies'

    await $api(url, {
      method,
      body: policyForm.value
    })
    showPolicyModal.value = false
    fetchPolicies()
  } catch (e) {
    console.error(e)
    alert('Hata oluştu!')
  }
}

const saveContent = async () => {
  try {
    const method = editingContent.value ? 'PUT' : 'POST'
    const url = editingContent.value
      ? `/api/dynamic/admin/contents/${editingContent.value.id}`
      : '/api/dynamic/admin/contents'

    await $api(url, {
      method,
      body: contentForm.value
    })
    showContentModal.value = false
    fetchContents()
  } catch (e) {
    console.error(e)
    alert('Hata oluştu!')
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $api('/api/dynamic/admin/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      announcementForm.value.linkUrl = response.url
      if (!announcementForm.value.linkText) {
        announcementForm.value.linkText = file.name
      }
      toast.success('Dosya yüklendi!')
    }
  } catch (e) {
    console.error(e)
    toast.error('Dosya yüklenirken hata oluştu!')
  } finally {
    uploading.value = false
  }
}

// Delete handlers
const deleteAnnouncement = async (id) => {
  if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return
  try {
    await $api(`/api/dynamic/admin/announcements/${id}`, {
      method: 'DELETE'
    })
    fetchAnnouncements()
  } catch (e) { console.error(e) }
}

const deletePolicy = async (id) => {
  if (!confirm('Bu politikayı silmek istediğinize emin misiniz?')) return
  try {
    await $api(`/api/dynamic/admin/policies/${id}`, {
      method: 'DELETE'
    })
    fetchPolicies()
  } catch (e) { console.error(e) }
}

const deleteContent = async (id) => {
  if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return
  try {
    await $api(`/api/dynamic/admin/contents/${id}`, {
      method: 'DELETE'
    })
    fetchContents()
  } catch (e) { console.error(e) }
}

// Helpers
const getTypeClass = (type) => ({
  'info': 'bg-blue-100 text-blue-700',
  'warning': 'bg-yellow-100 text-yellow-700',
  'success': 'bg-green-100 text-green-700',
  'promo': 'bg-purple-100 text-purple-700'
}[type] || 'bg-gray-100 text-gray-700')

const getTypeName = (type) => ({
  'info': 'Bilgilendirme',
  'warning': 'Uyarı',
  'success': 'Başarı',
  'promo': 'Promosyon'
}[type] || type)

const getPolicyTypeName = (type) => ({
  'privacy': 'Gizlilik',
  'terms': 'Kullanım Koşulları',
  'return': 'İade',
  'shipping': 'Kargo',
  'cookies': 'Çerez'
}[type] || type)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR')
}
</script>
