<template>
  <div class="p-8 max-w-5xl mx-auto">
    <!-- Header -->
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SparklesIcon class="h-8 w-8 text-indigo-600" />
          Hızlı Erişim Menüsü
        </h1>
        <p class="text-gray-600 mt-1">
          Ana sayfadaki yuvarlak hızlı erişim butonlarını yönetin.
        </p>
      </div>
      <div>
        <button
          class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-bold flex items-center shadow-lg shadow-indigo-200 disabled:opacity-50"
          :disabled="saving"
          @click="saveSettings"
        >
          <div
            v-if="saving"
            class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"
          />
          <CheckIcon
            v-else
            class="h-5 w-5 mr-2"
          />
          {{ saving ? 'Kaydediliyor...' : 'Tümünü Kaydet' }}
        </button>
      </div>
    </div>

    <!-- Info Alert -->
    <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
      <InformationCircleIcon class="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
      <div>
        <h3 class="text-sm font-bold text-indigo-900">
          Önemli Bilgi
        </h3>
        <p class="text-sm text-indigo-700 mt-1">
          Bu alan ana sayfada kullanıcılara hızlı yönlendirme sağlamak için kullanılır. En fazla 8 adet öğe eklemeniz
          göze hoş görünmesi açısından önerilir.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Top Section -->
      <div class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 class="text-lg font-bold text-gray-900">
          Menü Öğeleri
        </h2>
        <button
          class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors text-sm font-bold flex items-center shadow-sm"
          @click="addMenuItem"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Yeni Öğe Ekle
        </button>
      </div>

      <!-- Items List -->
      <div class="p-6 space-y-4">
        <div
          v-if="menuItems.length === 0"
          class="text-center py-10 text-gray-400"
        >
          <Squares2X2Icon class="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Henüz hiç hızlı erişim öğesi eklenmemiş.</p>
        </div>

        <!-- Draggable Wrapper could be added here, currently simple list -->
        <div
          v-for="(item, index) in menuItems"
          :key="index"
          class="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all relative group"
        >
          <div class="absolute top-4 right-4 flex space-x-2">
            <button
              :disabled="index === 0"
              class="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
              @click="moveUp(index)"
            >
              <ChevronUpIcon class="h-5 w-5" />
            </button>
            <button
              :disabled="index === menuItems.length - 1"
              class="p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
              @click="moveDown(index)"
            >
              <ChevronDownIcon class="h-5 w-5" />
            </button>
            <button
              class="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
              @click="removeMenuItem(index)"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-[85%]">
            <!-- Title -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Başlık</label>
              <input
                v-model="item.title"
                type="text"
                placeholder="Örn: Market"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
            </div>

            <!-- Path/URL -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yönlendirilecek
                Bağlantı</label>
              <input
                v-model="item.path"
                type="text"
                placeholder="/products?categorySlug=..."
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
            </div>

            <!-- Gradient Start Color -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gradient Başlangıç
                (Tailwind Sınıfı)</label>
              <input
                v-model="item.colorFrom"
                type="text"
                placeholder="from-orange-400"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              >
            </div>

            <!-- Gradient End Color -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gradient Bitiş
                (Tailwind Sınıfı)</label>
              <input
                v-model="item.colorTo"
                type="text"
                placeholder="to-amber-500"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              >
            </div>

            <!-- Text Hover Color -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yazı Hover Rengi
                (Sınıf)</label>
              <input
                v-model="item.hoverColor"
                type="text"
                placeholder="group-hover:text-amber-500"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              >
            </div>

            <!-- Shadow Color -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gölge Rengi
                (Sınıf)</label>
              <input
                v-model="item.shadowColor"
                type="text"
                placeholder="shadow-amber-200"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
              >
            </div>

            <!-- Icon Selector -->
            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İkon</label>
              <div class="flex items-center gap-4">
                <input
                  v-model="item.icon"
                  type="text"
                  placeholder="Heroicons adı (örn: ShoppingCartIcon)"
                  class="w-1/2 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm"
                >

                <div
                  class="flex items-center justify-center p-3 rounded-xl bg-gray-50 border border-gray-200 min-w-[3rem]"
                >
                  <component
                    :is="getIconComponent(item.icon)"
                    v-if="getIconComponent(item.icon)"
                    class="w-6 h-6 text-gray-700"
                  />
                  <span
                    v-else
                    class="text-xs text-gray-400"
                  >Bulunamadı</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Preview inside the card -->
          <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-400">Canlı Önizleme:</span>

            <div class="flex flex-col items-center gap-2 group cursor-default">
              <div
                :class="['w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg relative overflow-hidden bg-gradient-to-br', item.colorFrom, item.colorTo, item.shadowColor]"
              >
                <component
                  :is="getIconComponent(item.icon)"
                  v-if="getIconComponent(item.icon)"
                  class="w-8 h-8 opacity-90 transition-opacity"
                />
              </div>
              <span class="text-xs font-black text-slate-700 uppercase tracking-tight">{{ item.title || 'Başlık'
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as HeroIcons from '@heroicons/vue/24/outline'

// Destructure icons used directly in the template for ease of use
const {
  SparklesIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon,
  Squares2X2Icon,
  ChevronUpIcon,
  ChevronDownIcon
} = HeroIcons

definePageMeta({
  layout: 'admin',
  middleware: 'super-admin'
})

const { $api } = useApi()
const toast = useNuxtApp().$toast

const saving = ref(false)
const menuItems = ref([])

// Map to resolve string icon names to Heroicon components
const getIconComponent = (iconName) => {
  if (!iconName) return null
  return HeroIcons[iconName] || null
}

const loadSettings = async () => {
  try {
    const response = await $api('/api/admin/settings')
    if (response.success && response.data.quickAccessMenu) {
      try {
        menuItems.value = JSON.parse(response.data.quickAccessMenu)
      } catch (e) {
        // Parse error, fallback to defaults
        loadDefaultMenu()
      }
    } else {
      // First time initialization
      loadDefaultMenu()
    }
  } catch (error) {
    console.error('Fetch settings error:', error)
    loadDefaultMenu()
  }
}

const loadDefaultMenu = () => {
  menuItems.value = [
    {
      title: 'Market',
      path: '/products?categorySlug=supermarket-gida-ve-icecek',
      colorFrom: 'from-orange-400',
      colorTo: 'to-amber-500',
      hoverColor: 'group-hover:text-amber-500',
      shadowColor: 'shadow-orange-200',
      icon: 'ShoppingCartIcon'
    },
    {
      title: 'Yemek',
      path: '/products?categorySlug=restoran-kafe',
      colorFrom: 'from-rose-500',
      colorTo: 'to-red-600',
      hoverColor: 'group-hover:text-rose-600',
      shadowColor: 'shadow-rose-200',
      icon: 'FireIcon'
    },
    {
      title: 'Takas',
      path: '/barter',
      colorFrom: 'from-indigo-500',
      colorTo: 'to-violet-600',
      hoverColor: 'group-hover:text-indigo-600',
      shadowColor: 'shadow-indigo-200',
      icon: 'ArrowPathIcon'
    },
    {
      title: 'Artırma',
      path: '/auctions',
      colorFrom: 'from-fuchsia-500',
      colorTo: 'to-purple-600',
      hoverColor: 'group-hover:text-fuchsia-600',
      shadowColor: 'shadow-fuchsia-200',
      icon: 'BoltIcon'
    },
    {
      title: 'Toptan',
      path: '/vendors',
      colorFrom: 'from-emerald-500',
      colorTo: 'to-teal-600',
      hoverColor: 'group-hover:text-emerald-600',
      shadowColor: 'shadow-emerald-200',
      icon: 'UserGroupIcon'
    }
  ]
}

const addMenuItem = () => {
  menuItems.value.unshift({
    title: 'Yeni Öğe',
    path: '/',
    colorFrom: 'from-gray-400',
    colorTo: 'to-gray-500',
    hoverColor: 'group-hover:text-gray-600',
    shadowColor: 'shadow-gray-200',
    icon: 'SparklesIcon'
  })
}

const removeMenuItem = (index) => {
  menuItems.value.splice(index, 1)
}

const moveUp = (index) => {
  if (index > 0) {
    const item = menuItems.value[index]
    menuItems.value.splice(index, 1)
    menuItems.value.splice(index - 1, 0, item)
  }
}

const moveDown = (index) => {
  if (index < menuItems.value.length - 1) {
    const item = menuItems.value[index]
    menuItems.value.splice(index, 1)
    menuItems.value.splice(index + 1, 0, item)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const response = await $api('/api/admin/settings', {
      method: 'POST',
      body: {
        quickAccessMenu: JSON.stringify(menuItems.value)
      }
    })

    if (response.success) {
      toast.success('Hızlı erişim menüsü güncellendi!')
    }
  } catch (error) {
    console.error('Save settings error:', error)
    toast.error('Ayarlar kaydedilirken bir hata oluştu')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>
