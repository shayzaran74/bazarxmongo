<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
          📝 İçerik <span class="text-indigo-600">Yönetimi</span>
        </h1>
        <p class="text-gray-500 mt-1 font-medium italic opacity-70">Platform genelindeki duyuruları, yasal metinleri ve dinamik içerikleri yönetin.</p>
      </div>
      <button class="p-4 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all group" @click="fetchAll">
        <ArrowPathIcon class="h-6 w-6 text-indigo-600 group-hover:rotate-180 transition-all duration-500" />
      </button>
    </div>

    <!-- Tab Control -->
    <div class="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit mb-8">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
        :class="activeTab === tab.key ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Content Sections -->
    <div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ContentAnnouncements
        v-if="activeTab === 'announcements'"
        v-model:show-modal="showAnnouncementModal"
        :announcements="announcements"
        :form="announcementForm"
        :is-editing="!!editingAnnouncement"
        :uploading="uploading"
        @save="saveAnnouncement"
        @delete="deleteAnnouncement"
        @file-upload="handleFileUpload"
        @open-modal="openAnnouncementModal"
      />

      <ContentPolicies
        v-if="activeTab === 'policies'"
        v-model:show-modal="showPolicyModal"
        :policies="policies"
        :form="policyForm"
        :is-editing="!!editingPolicy"
        @save="savePolicy"
        @delete="deletePolicy"
        @open-modal="openPolicyModal"
      />

      <ContentDynamic
        v-if="activeTab === 'contents'"
        v-model:show-modal="showContentModal"
        :contents="contents"
        :form="contentForm"
        :is-editing="!!editingContent"
        @save="saveContent"
        @delete="deleteContent"
        @open-modal="openContentModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon, MegaphoneIcon, DocumentTextIcon, PuzzlePieceIcon } from '@heroicons/vue/24/outline'
import { useAdminContent } from '~/composables/useAdminContent'

// Modüler Bileşenler
import ContentAnnouncements from '~/components/admin/content/ContentAnnouncements.vue'
import ContentPolicies from '~/components/admin/content/ContentPolicies.vue'
import ContentDynamic from '~/components/admin/content/ContentDynamic.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'İçerik Yönetimi - BazarX Admin' })

const {
  activeTab, announcements, policies, contents, uploading,
  showAnnouncementModal, showPolicyModal, showContentModal,
  editingAnnouncement, editingPolicy, editingContent,
  announcementForm, policyForm, contentForm,
  fetchAll, handleFileUpload, saveAnnouncement, savePolicy, saveContent,
  deleteAnnouncement, deletePolicy, deleteContent,
  openAnnouncementModal, openPolicyModal, openContentModal
} = useAdminContent()

const tabs = [
  { key: 'announcements', label: 'Duyurular', icon: MegaphoneIcon },
  { key: 'policies', label: 'Politikalar', icon: DocumentTextIcon },
  { key: 'contents', label: 'Dinamik İçerik', icon: PuzzlePieceIcon }
]

onMounted(fetchAll)
</script>
