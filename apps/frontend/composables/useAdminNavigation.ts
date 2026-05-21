import { computed } from 'vue'
import {
  HomeIcon, ShoppingBagIcon, BanknotesIcon, TagIcon, CubeIcon,
  ArrowsRightLeftIcon, GiftIcon, UsersIcon, StarIcon,
  CurrencyDollarIcon, TicketIcon, WalletIcon, Cog6ToothIcon, InboxIcon, UserGroupIcon,
  MegaphoneIcon, SparklesIcon, BuildingOfficeIcon,
  ChevronDownIcon, PhotoIcon, ChartBarIcon, ClipboardDocumentListIcon,
  CloudIcon, ChatBubbleLeftRightIcon, QuestionMarkCircleIcon,
  ClipboardDocumentCheckIcon, ShieldCheckIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'

export interface NavChild {
  label: string
  to: string
  icon?: any
}

export interface NavItem {
  label: string
  to?: string
  icon: any
  activePath?: string
  isOpen?: boolean
  children?: NavChild[]
}

export interface NavSection {
  title: string | null
  items: NavItem[]
}

export const useAdminNavigation = (isSuperAdmin: boolean) => {
  const navigation = computed<NavSection[]>(() => [
    {
      title: null,
      items: [
        { label: 'Ana Sayfa', to: '/admin', icon: HomeIcon }
      ]
    },
    {
      title: 'Satış Kanalları',
      items: [
        { label: 'Siparişler', to: '/admin/orders', activePath: '/admin/order', icon: InboxIcon },
        { label: 'Ürünler', to: '/admin/products', activePath: '/admin/product', icon: ShoppingBagIcon },
        { label: 'Kategoriler', to: '/admin/categories', activePath: '/admin/categor', icon: TagIcon },
        { label: 'Açık Artırmalar', to: '/admin/auctions', icon: CurrencyDollarIcon },
        { label: 'Çekilişler', to: '/admin/lotteries', icon: TicketIcon },
        { label: 'Birlikte Al', to: '/admin/group-buy', icon: UserGroupIcon }
      ]
    },
    {
      title: 'Ticari Takas (Sanayi)',
      items: [
        {
          label: 'Takas Merkezi',
          icon: BuildingOfficeIcon,
          isOpen: true,
          children: [
            { label: 'Firma Onayları', to: '/admin/company-approvals', icon: BuildingOfficeIcon },
            { label: 'İlan Onayları', to: '/admin/surplus-approvals', icon: SparklesIcon },
            { label: 'İstek Onayları', to: '/admin/wanted-items', icon: ClipboardDocumentListIcon },
            { label: 'Teklif Onayları', to: '/admin/offers', icon: ArrowsRightLeftIcon },
            { label: 'Takas Geçmişi', to: '/admin/trade-history', icon: ArrowsRightLeftIcon },
            { label: 'Barter Kategorileri', to: '/admin/barter-categories', icon: TagIcon },
            { label: 'Barter Yönetimi', to: '/admin/barter', icon: BanknotesIcon },
            { label: 'Akıllı Eşleştirme', to: '/admin/barter/matching', icon: SparklesIcon },
            { label: 'Talep Eşleştirme', to: '/admin/demand-matching', icon: UserGroupIcon },
            { label: '🔭 Watchtower', to: '/admin/chat-monitor', icon: ChatBubbleLeftRightIcon },
            { label: '🏢 Ekosistem', to: '/admin/ecosystems', icon: SparklesIcon }
          ]
        }
      ]
    },
    {
      title: 'Katalog & Operasyon',
      items: [
        { label: 'Marka Yönetimi', to: '/admin/brands', activePath: '/admin/brand', icon: TagIcon },
        { label: 'Envanter', to: '/admin/inventory', icon: CubeIcon },
        { label: 'Aktarımlar', to: '/admin/transfers', activePath: '/admin/transfer', icon: ArrowsRightLeftIcon },
        { label: 'Hediye Kartları', to: '/admin/gift-cards', activePath: '/admin/gift-card', icon: GiftIcon },
        { label: 'Kupon Yönetimi', to: '/admin/coupons', icon: TicketIcon },
        { label: 'Rozet (Badge)', to: '/admin/badge-rules', icon: SparklesIcon }
      ]
    },
    {
      title: 'Finans & CRM',
      items: [
        { label: 'Standart Analitik', to: '/admin/analytics', icon: ChartBarIcon },
        { label: 'Gelişmiş Analitik (OLAP)', to: '/admin/analytics/olap', icon: SparklesIcon },
        { label: 'Kullanıcılar', to: '/admin/users', activePath: '/admin/user', icon: UsersIcon },
        { label: 'Sadakat & Ödüller', to: '/admin/loyalty', icon: GiftIcon },
        { label: 'Kullanıcı Loyalty Tier', to: '/admin/user-loyalty', icon: SparklesIcon },
        { label: 'Satıcı Tier Atama', to: '/admin/vendor-tiers', icon: ChartBarIcon },
        { label: 'Cüzdan Onayları', to: '/admin/wallet', icon: WalletIcon },
        { label: 'Para Çekme Talepleri', to: '/admin/wallet?tab=withdrawal', icon: CurrencyDollarIcon },
        { label: 'Genel Mizan (Ledger)', to: '/admin/ledger-dashboard', icon: ChartBarIcon },
        { label: 'Satıcılar', to: '/admin/vendors', icon: ShoppingBagIcon },
        { label: 'Hak Edişler', to: '/admin/payouts', icon: CurrencyDollarIcon },
        { label: 'Yorumlar', to: '/admin/reviews', activePath: '/admin/review', icon: StarIcon },
        { label: 'Reklam Yönetimi', to: '/admin/advertising', icon: MegaphoneIcon }
      ]
    },
    {
      title: 'Sistem & İçerik',
      items: [
        {
          label: 'Ana Sayfa Ayarları',
          icon: Cog6ToothIcon,
          isOpen: true,
          children: [
            { label: 'Ticari Takas', to: '/admin/settings/anasayfaticaritakas' },
            { label: 'BazarX', to: '/admin/settings/anasayfabazarx' },
            { label: 'Barter Borsa', to: '/admin/settings/anasayfabarterborsa' },
            { label: 'BazarX Go', to: '/admin/settings/bazarx-go' },
            { label: 'Yan Reklamlar', to: '/admin/settings/side-ads' }
          ]
        },
        { label: 'Banner Yönetimi', to: '/admin/banners', icon: PhotoIcon },
        { label: 'İçerik Yönetimi', to: '/admin/content', icon: MegaphoneIcon },
        { label: 'Yardım Merkezi', to: '/admin/help', icon: QuestionMarkCircleIcon }
      ]
    },
    {
      title: 'BazarX-GO',
      items: [
        { label: 'Restoran Anlaşmaları', to: '/admin/go/restaurants', icon: BuildingOfficeIcon },
        { label: 'Kârlılık Dashboard',  to: '/admin/go/revenue',     icon: ChartBarIcon },
        { label: 'Rezervasyonlar',       to: '/admin/go/reservations', icon: ClipboardDocumentListIcon },
        { label: 'Push & Mail Kampanya',  to: '/admin/go/notifications', icon: MegaphoneIcon },
      ]
    },
    ...(isSuperAdmin ? [
      {
        title: 'Super Admin',
        items: [
          { label: 'Tier (Seviye) Yönetimi', to: '/admin/tier-management', icon: ChartBarIcon },
          { label: 'MinIO Arşivi', to: '/admin/minio-archive', icon: CloudIcon },
          { label: 'Denetim (Audit)', to: '/admin/audit-logs', icon: ClipboardDocumentCheckIcon },
          { label: 'Yetki Matrisi (RBAC)', to: '/admin/permissions', icon: ShieldCheckIcon },
          { label: 'MinIO Console ↗', to: 'http://localhost:9001', icon: ArrowTopRightOnSquareIcon }
        ]
      }
    ] : [])
  ])

  const routeTitles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/payouts': 'Hak Ediş Yönetimi',
    '/admin/tier-management': 'Satıcı Seviye (Tier) Yönetimi',
    '/admin/vendor-tiers':    'Satıcı Tier Atama',
    '/admin/user-loyalty':    'Kullanıcı Loyalty Tier Yönetimi',
    '/admin/ledger-dashboard': '📒 Genel Mizan — Ledger Dashboard',
    '/admin/marketing': 'Pazarlama Analitiği',
    '/admin/advertising': 'Reklam Yönetimi'
  }

  const getPageTitle = (path: string): string => {
    if (routeTitles[path]) return routeTitles[path]
    const segments = path.split('/').filter(Boolean)
    if (segments.length > 1) {
      const last = segments[segments.length - 1]
      return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ')
    }
    return 'Admin Paneli'
  }

  return { navigation, getPageTitle, ChevronDownIcon }
}
