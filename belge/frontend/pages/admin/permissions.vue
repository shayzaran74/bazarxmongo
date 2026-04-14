<template>
  <div class="min-h-screen bg-gray-50">
    <div class="p-6 space-y-8">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            Yetki Matrisi ve Erişim Denetimi
          </h2>
          <p class="text-gray-500 mt-1">
            Sistemdeki yönetici rollerinin yetki seviyelerini ve son erişim
            aktivitelerini görün.
          </p>
        </div>
        <div class="flex gap-3">
          <div class="px-4 py-2 bg-rose-50 rounded-lg border border-rose-100 flex items-center gap-2">
            <ShieldCheckIcon class="w-5 h-5 text-rose-600" />
            <span class="text-sm font-semibold text-rose-700">Üst Düzey Yönetici Modu</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Permission Matrix -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-bold text-gray-900">
                Yetki Matrisi (RBAC Matrix)
              </h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Modül / Özellik
                    </th>
                    <th
                      class="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Üye (User)
                    </th>
                    <th
                      class="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Yönetici (Admin)
                    </th>
                    <th
                      class="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Süper Admin
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="permission in permissions"
                    :key="permission.id"
                    class="hover:bg-gray-50/50 transition-colors"
                  >
                    <td class="py-4 px-6">
                      <div class="flex items-center gap-3">
                        <div
                          class="p-2 bg-gray-100 rounded-lg group-hover:bg-white transition-colors"
                        >
                          <component
                            :is="permission.icon"
                            class="w-5 h-5 text-gray-600"
                          />
                        </div>
                        <div>
                          <div class="font-semibold text-gray-900">
                            {{ permission.name }}
                          </div>
                          <div class="text-xs text-gray-500">
                            {{ permission.description }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-center py-4 px-6">
                      <CheckCircleIcon
                        v-if="permission.user"
                        class="w-6 h-6 text-emerald-500 mx-auto"
                      />
                      <XCircleIcon
                        v-else
                        class="w-6 h-6 text-gray-300 mx-auto"
                      />
                    </td>
                    <td class="text-center py-4 px-6">
                      <CheckCircleIcon
                        v-if="permission.admin"
                        class="w-6 h-6 text-emerald-500 mx-auto"
                      />
                      <XCircleIcon
                        v-else
                        class="w-6 h-6 text-gray-300 mx-auto"
                      />
                    </td>
                    <td class="text-center py-4 px-6">
                      <div class="relative inline-block">
                        <CheckCircleIcon
                          v-if="permission.super"
                          class="w-6 h-6 text-rose-500 mx-auto"
                        />
                        <XCircleIcon
                          v-else
                          class="w-6 h-6 text-gray-300 mx-auto"
                        />
                        <div
                          v-if="permission.super"
                          class="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Role Summary & Access Audit -->
        <div class="space-y-6">
          <!-- Role Stats -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">
              Rol Dağılımı
            </h3>
            <div class="space-y-4">
              <div
                v-for="stat in roleStats"
                :key="stat.label"
                class="flex items-center justify-between p-3 rounded-xl bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="stat.colorClass"
                    class="w-2 h-2 rounded-full"
                  />
                  <span class="text-sm font-medium text-gray-700">{{ stat.label }}</span>
                </div>
                <span class="text-sm font-bold text-gray-900">{{ stat.count }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-4">
              Güvenlik Aksiyonları
            </h3>
            <div class="grid grid-cols-1 gap-2">
              <button
                class="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all group"
                @click="navigateTo('/admin/audit-logs')"
              >
                <div class="flex items-center gap-3 border-rose-500">
                  <ClipboardDocumentCheckIcon
                    class="w-5 h-5 text-gray-400 group-hover:text-rose-600"
                  />
                  <span class="text-sm font-medium text-gray-700 group-hover:text-rose-900">Denetim
                    Günlüklerini İncele</span>
                </div>
              </button>
              <button
                class="w-full text-left px-4 py-3 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group"
                @click="navigateTo('/admin/users')"
              >
                <div class="flex items-center gap-3 border-emerald-500">
                  <UsersIcon class="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  <span
                    class="text-sm font-medium text-gray-700 group-hover:text-emerald-900"
                  >Yönetici
                    Atamalarını Yönet</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Active Super Admins -->
          <div class="bg-rose-600 rounded-2xl p-6 shadow-lg text-white">
            <div class="flex items-center gap-3 mb-4">
              <KeyIcon class="w-6 h-6 text-rose-200" />
              <h3 class="text-lg font-bold">
                Kritik Uyarı
              </h3>
            </div>
            <p class="text-sm text-rose-50 leading-relaxed">
              Süper Admin yetkisi, veritabanına doğrudan erişim ve finansal işlemleri onaylama gücü verir.
              Bu rolü sadece en üst düzey personelle paylaşın.
            </p>
          </div>
        </div>
      </div>

      <!-- Security Events / Access Report -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">
            Son Erişim ve Güvenlik Olayları
          </h3>
          <span
            v-if="anomalies.length > 0"
            class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 animate-pulse"
          >
            {{ anomalies.length }} Olay
          </span>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="log in anomalies"
            :key="log.id"
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start gap-4">
              <div class="mt-1">
                <ExclamationTriangleIcon
                  v-if="log.action.includes('ANOMALY')"
                  class="w-5 h-5 text-rose-500"
                />
                <KeyIcon
                  v-else
                  class="w-5 h-5 text-indigo-500"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-bold text-gray-900 truncate">{{ log.action }}</span>
                  <span class="text-xs text-gray-400 whitespace-nowrap ml-2">{{ new
                    Date(log.createdAt).toLocaleString('tr-TR') }}</span>
                </div>
                <p class="text-xs text-gray-600 line-clamp-2">
                  Admin: {{ log.admin?.name || 'Sistem' }}
                </p>
                <p class="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-1 rounded">
                  IP: {{ log.ip }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-if="anomalies.length === 0"
            class="p-12 text-center text-gray-400"
          >
            <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon class="w-6 h-6 text-emerald-400" />
            </div>
            <p class="text-sm">
              Kritik güvenlik olayı tespit edilmedi.
            </p>
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs font-medium text-gray-400">
          Radyal Tarama Aktif: Watchtower Real-time
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ShieldCheckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShoppingBagIcon,
    UsersIcon,
    WalletIcon,
    Cog6ToothIcon,
        MegaphoneIcon,
    ClipboardDocumentCheckIcon,
    KeyIcon,
    InboxIcon,
    SparklesIcon,
    ArrowsRightLeftIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
    layout: 'admin',
    middleware: 'super-admin'
})

const { $api } = useApi()
const roleStats = ref([
    { label: 'Normal Üyeler', count: 0, colorClass: 'bg-emerald-400' },
    { label: 'Yöneticiler (Admin)', count: 0, colorClass: 'bg-indigo-400' },
    { label: 'Süper Adminler', count: 0, colorClass: 'bg-rose-500' }
])

const permissions = [
    { id: 1, name: 'Sipariş & Satış', description: 'Siparişleri görüntüleme ve temel statü güncellemeleri.', icon: InboxIcon, user: false, admin: true, super: true },
    { id: 2, name: 'Ürün Yönetimi', description: 'Katalog, stok ve fiyat güncellemeleri.', icon: ShoppingBagIcon, user: false, admin: true, super: true },
    { id: 3, name: 'Bülten & İçerik', description: 'Banner, duyuru ve kampanya mailleri.', icon: MegaphoneIcon, user: false, admin: true, super: true },
    { id: 4, name: 'Firma & İlan Onayları', description: 'Yeni satıcı ve ilan başvurularını değerlendirme.', icon: CheckCircleIcon, user: false, admin: true, super: true },
    { id: 5, name: 'Ekosistem Yönetimi', description: 'Watchtower, güven puanları ve ekosistem limitleri.', icon: SparklesIcon, user: false, admin: false, super: true },
    { id: 6, name: 'Finansal Denetim', description: 'Cüzdan mutabakatı ve ledger incelemesi.', icon: WalletIcon, user: false, admin: false, super: true },
    { id: 7, name: 'Hak Ediş Onayları', description: 'Satıcı ödemelerinin (payout) serbest bırakılması.', icon: ArrowsRightLeftIcon, user: false, admin: false, super: true },
    { id: 8, name: 'Sistem Ayarları', description: 'Global ayarlar, logolar ve MinIO arşivi.', icon: Cog6ToothIcon, user: false, admin: false, super: true },
    { id: 9, name: 'Denetim Kayıtları', description: 'Adminlerin yaptığı tüm işlemlerin (audit) takibi.', icon: ClipboardDocumentCheckIcon, user: false, admin: false, super: true },
    { id: 10, name: 'Kullanıcı Verileri', description: 'Adres ve profil bilgilerine sınırlı erişim.', icon: UsersIcon, user: true, admin: true, super: true },
]

const anomalies = ref([])

onMounted(async () => {
    try {
        const [statsRes, auditRes] = await Promise.all([
            $api('/api/admin/users/stats'),
            $api('/api/admin/logs/audit', { params: { limit: 10 } })
        ])

        if (statsRes.success) {
            roleStats.value[0].count = statsRes.data.userCount || 0
            roleStats.value[1].count = statsRes.data.adminCount || 0
            roleStats.value[2].count = statsRes.data.superAdminCount || 0
        }

        if (auditRes.success) {
            anomalies.value = auditRes.data.filter(l => l.action.startsWith('ANOMALY_') || l.action.includes('LOGIN'))
        }
    } catch (err) {
        console.error('Data fetch error:', err)
    }
})
</script>
