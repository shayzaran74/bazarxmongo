import { ref, computed, onMounted, watch } from 'vue'

export const useAdminHelp = () => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const articles = ref<any[]>([])
  const categories = ref<any[]>([])
  const searchQuery = ref('')
  const loading = ref(false)
  const isArticleModalOpen = ref(false)
  const isCategoryModalOpen = ref(false)

  const editingArticle = ref({
    id: undefined,
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
    loading.value = true
    try {
      const [artRes, catRes]: [any, any] = await Promise.all([
        $api('/api/v1/admin/help/articles'),
        $api('/api/v1/admin/help/categories')
      ])
      articles.value = artRes.data || []
      categories.value = catRes.data || []
    } catch (e) {
      console.error('Fetch Error:', e)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      loading.value = false
    }
  }

  const openArticleModal = (article: any = null) => {
    if (article) {
      editingArticle.value = { ...article }
    } else {
      editingArticle.value = {
        id: undefined,
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
      await $api('/api/v1/admin/help/categories', {
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
        await $api(`/api/v1/admin/help/articles/${editingArticle.value.id}`, {
          method: 'PUT',
          body: editingArticle.value
        })
        toast.success('Makale güncellendi')
      } else {
        await $api('/api/v1/admin/help/articles', {
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

  const deleteArticle = async (id: string) => {
    if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return
    try {
      await $api(`/api/v1/admin/help/articles/${id}`, {
        method: 'DELETE'
      })
      toast.success('Makale silindi')
      fetchAll()
    } catch (e) {
      console.error('Delete Article Error:', e)
      toast.error('Silme işlemi başarısız')
    }
  }

  onMounted(fetchAll)

  return {
    articles, categories, searchQuery, loading, isArticleModalOpen, isCategoryModalOpen,
    editingArticle, editingCategory, totalViews, filteredArticles,
    fetchAll, openArticleModal, closeArticleModal, openCategoryModal, closeCategoryModal,
    saveCategory, saveArticle, deleteArticle
  }
}
