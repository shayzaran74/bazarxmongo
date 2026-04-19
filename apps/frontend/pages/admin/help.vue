<template>
  <div class="p-6 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-950 text-slate-200">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm"
    >
      <div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"
        >
          Yardım Merkezi Yönetimi
        </h1>
        <p class="text-slate-400 mt-1">
          Kategorileri ve yardım makalelerini buradan yönetebilirsiniz.
        </p>
      </div>
      <div class="flex gap-3">
        <button
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          @click="openCategoryModal"
        >
          <span>📁</span> Kategori Ekle
        </button>
        <button
          class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
          @click="openArticleModal()"
        >
          <span>➕</span> Yeni Makale
        </button>
      </div>
    </div>

    <!-- Stats & Filters -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <span class="text-slate-500 text-sm font-medium uppercase tracking-wider">Toplam Makale</span>
        <div class="text-3xl font-bold mt-1">
          {{ articles.length }}
        </div>
      </div>
      <div class="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <span class="text-slate-500 text-sm font-medium uppercase tracking-wider">Aktif Kategoriler</span>
        <div class="text-3xl font-bold mt-1">
          {{ categories.length }}
        </div>
      </div>
      <div class="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
        <span class="text-slate-500 text-sm font-medium uppercase tracking-wider">Toplam Okunma</span>
        <div class="text-3xl font-bold mt-1 text-green-400">
          {{ totalViews }}
        </div>
      </div>
    </div>

    <!-- Articles List -->
    <div class="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
      <div class="p-5 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
        <h2 class="font-semibold text-lg">
          Makaleler
        </h2>
        <div class="relative max-w-xs w-full">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Makale ara..."
            class="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          >
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-800/30 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4 font-medium">
                Başlık
              </th>
              <th class="px-6 py-4 font-medium">
                Kategori
              </th>
              <th class="px-6 py-4 font-medium">
                Durum
              </th>
              <th class="px-6 py-4 font-medium">
                İstatistik
              </th>
              <th class="px-6 py-4 font-medium">
                Son Güncelleme
              </th>
              <th class="px-6 py-4 font-medium text-right">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr
              v-for="article in filteredArticles"
              :key="article.id"
              class="hover:bg-slate-800/30 transition-colors group"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-slate-200">
                  {{ article.title }}
                </div>
                <div class="text-xs text-slate-500 font-mono">
                  {{ article.slug }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 bg-slate-800 rounded-md text-xs text-slate-300 border border-slate-700"
                >
                  {{ article.category?.name || 'Belirsiz' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getStatusClass(article.status)"
                  class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter"
                >
                  {{ article.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 text-sm text-slate-400">
                  <span title="Görüntülenme">👁️ {{ article.viewCount }}</span>
                  <span
                    title="Faydalı"
                    class="text-green-500/80"
                  >👍 {{ article.upvotes }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(article.updatedAt) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div
                  class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Düzenle"
                    @click="openArticleModal(article)"
                  >
                    ✏️
                  </button>
                  <button
                    class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    title="Sil"
                    @click="deleteArticle(article.id)"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredArticles.length === 0">
              <td
                colspan="6"
                class="px-6 py-12 text-center text-slate-500"
              >
                Makale bulunamadı.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Article Editor Modal -->
    <div
      v-if="isArticleModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        @click="closeArticleModal"
      />
      <div
        class="relative bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl flex flex-col"
      >
        <div
          class="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10"
        >
          <h3 class="text-xl font-bold">
            {{ editingArticle.id ? 'Makaleyi Düzenle' : 'Yeni Makale Oluştur' }}
          </h3>
          <button
            class="text-slate-400 hover:text-white text-2xl"
            @click="closeArticleModal"
          >
            &times;
          </button>
        </div>

        <div class="p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400 ml-1">Makale Başlığı</label>
              <input
                v-model="editingArticle.title"
                type="text"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400 ml-1">Kategori</label>
              <select
                v-model="editingArticle.categoryId"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">
                  Kategori Seçin
                </option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400 ml-1">Hedef Kitle</label>
              <select
                v-model="editingArticle.targetRole"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="ALL">
                  Herkes
                </option>
                <option value="BUYER">
                  Alıcılar
                </option>
                <option value="SELLER">
                  Satıcılar
                </option>
                <option value="BARTERER">
                  Takasçılar
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400 ml-1">Makale Durumu</label>
              <select
                v-model="editingArticle.status"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="DRAFT">
                  Taslak
                </option>
                <option value="PUBLISHED">
                  Yayınlandı
                </option>
                <option value="ARCHIVED">
                  Arşivlendi
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-400 ml-1">Sıralama</label>
              <input
                v-model.number="editingArticle.order"
                type="number"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
            </div>
            <div class="flex items-center gap-3 pt-8">
              <input
                id="isPopular"
                v-model="editingArticle.isPopular"
                type="checkbox"
                class="w-5 h-5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
              >
              <label
                for="isPopular"
                class="text-sm font-medium text-slate-300"
              >Popüler İçerik</label>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400 ml-1">Kısa Özet (Excerpt)</label>
            <textarea
              v-model="editingArticle.excerpt"
              rows="2"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-400 ml-1">Makale İçeriği</label>
            <RichEditor v-model="editingArticle.content" />
          </div>
        </div>

        <div class="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            class="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            @click="closeArticleModal"
          >
            İptal
          </button>
          <button
            class="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all"
            @click="saveArticle"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
    <!-- Category Modal -->
    <div
      v-if="isCategoryModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        @click="closeCategoryModal"
      />
      <div class="relative bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl p-6">
        <h3 class="text-xl font-bold mb-6">
          Yeni Kategori Ekle
        </h3>
        <div class="space-y-4">
          <div class="space-y-1">
            <label class="text-xs text-slate-500 font-medium ml-1">Kategori Adı</label>
            <input
              v-model="editingCategory.name"
              type="text"
              placeholder="Örn: Teknik Destek"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="space-y-1">
            <label class="text-xs text-slate-500 font-medium ml-1">Slug (Opsiyonel)</label>
            <input
              v-model="editingCategory.slug"
              type="text"
              placeholder="teknik-destek"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div class="space-y-1">
            <label class="text-xs text-slate-500 font-medium ml-1">Açıklama</label>
            <textarea
              v-model="editingCategory.description"
              rows="2"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div class="mt-8 flex justify-end gap-3">
          <button
            class="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            @click="closeCategoryModal"
          >
            Vazgeç
          </button>
          <button
            class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
            @click="saveCategory"
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

const { $api } = useApi()
const toast = useToast()
const articles = ref([])
const categories = ref([])
const searchQuery = ref('')
const isArticleModalOpen = ref(false)
const isCategoryModalOpen = ref(false)

const editingArticle = ref({
    title: '',
    categoryId: '',
    status: 'DRAFT',
    content: '',
    excerpt: '',
    isPopular: false,
    targetRole: 'ALL',
    order: 0,
    language: 'tr'
})

const editingCategory = ref({
    name: '',
    slug: '',
    description: '',
    language: 'tr',
    order: 0
})

const totalViews = computed(() => articles.value.reduce((sum, a) => sum + (a.viewCount || 0), 0))

const filteredArticles = computed(() => {
    if (!searchQuery.value) return articles.value
    const q = searchQuery.value.toLowerCase()
    return articles.value.filter(a => a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q))
})

watch(() => editingCategory.value.name, (newName) => {
    if (newName) {
        editingCategory.value.slug = newName
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
    }
})

const fetchAll = async () => {
    try {
        const [artRes, catRes] = await Promise.all([
            $api('/api/admin/help/articles'),
            $api('/api/admin/help/categories')
        ])
        articles.value = artRes.data
        categories.value = catRes.data
    } catch (e) {
        console.error('Fetch Error:', e)
        toast.error('Veriler yüklenirken hata oluştu')
    }
}

const openArticleModal = (article = null) => {
    if (article) {
        editingArticle.value = { ...article }
    } else {
        editingArticle.value = {
            title: '',
            categoryId: '',
            status: 'DRAFT',
            content: '',
            excerpt: '',
            isPopular: false,
            order: 0,
            language: 'tr',
            targetRole: 'ALL'
        }
    }
    isArticleModalOpen.value = true
}

const closeArticleModal = () => {
    isArticleModalOpen.value = false
}

const openCategoryModal = () => {
    editingCategory.value = {
        name: '',
        slug: '',
        description: '',
        language: 'tr',
        order: 0
    }
    isCategoryModalOpen.value = true
}

const closeCategoryModal = () => {
    isCategoryModalOpen.value = false
}

const saveCategory = async () => {
    try {
        if (!editingCategory.value.name) return
        await $api('/api/admin/help/categories', {
            method: 'POST',
            body: editingCategory.value
        })
        toast.success('Kategori oluşturuldu')
        closeCategoryModal()
        fetchAll()
    } catch (e) {
        console.error('Save Category Error:', e)
        toast.error('Kategori oluşturulamadı')
    }
}

const saveArticle = async () => {
    try {
        if (!editingArticle.value.title || !editingArticle.value.categoryId) {
            toast.warning('Başlık ve kategori zorunludur')
            return
        }

        if (editingArticle.value.id) {
            await $api(`/api/admin/help/articles/${editingArticle.value.id}`, {
                method: 'PUT',
                body: editingArticle.value
            })
            toast.success('Makale güncellendi')
        } else {
            await $api('/api/admin/help/articles', {
                method: 'POST',
                body: editingArticle.value
            })
            toast.success('Yeni makale oluşturuldu')
        }
        closeArticleModal()
        fetchAll()
    } catch (e) {
        console.error('Save Article Error:', e)
        toast.error('İşlem başarısız')
    }
}

const deleteArticle = async (id) => {
    if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return
    try {
        await $api(`/api/admin/help/articles/${id}`, {
            method: 'DELETE'
        })
        toast.success('Makale silindi')
        fetchAll()
    } catch (e) {
        console.error('Delete Article Error:', e)
        toast.error('Silme işlemi başarısız')
    }
}

const getStatusClass = (status) => {
    switch (status) {
        case 'PUBLISHED': return 'bg-green-500/20 text-green-400 border border-green-500/30'
        case 'DRAFT': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        case 'ARCHIVED': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
        default: return 'bg-slate-800 text-slate-400'
    }
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchAll)

definePageMeta({
    layout: 'admin', middleware: 'admin'
})
</script>

<style scoped>
/* Scrollbar Customization */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #0f172a;
}

::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: #475569;
}
</style>
