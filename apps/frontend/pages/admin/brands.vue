<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
              <ShieldCheckIcon class="h-7 w-7" />
            </div>
            Marka & IP Yönetimi
          </h1>
          <p class="text-gray-600 mt-1">
            Marka başvurularını inceleyin, onaylayın ve fikri mülkiyet ihlallerini yönetin.
          </p>
        </div>
        <div class="flex gap-4">
          <button
            class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            @click="openCreateModal"
          >
            <PlusIcon class="h-5 w-5" />
            Yeni Marka Ekle
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <ClockIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">
                Bekleyen
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ brandStats.PENDING }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-green-50 text-green-600 rounded-xl">
              <CheckBadgeIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">
                Onaylı
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ brandStats.APPROVED }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-red-50 text-red-600 rounded-xl">
              <XCircleIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">
                Reddedilen
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ brandStats.REJECTED }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ExclamationTriangleIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">
                İhlaller
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ brandStats.VIOLATIONS }}
              </p>
            </div>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FireIcon class="h-6 w-6" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase">
                Popüler
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ brandStats.POPULAR }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div class="flex border-b border-gray-100">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              currentTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
            class="flex-1 py-4 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2"
            @click="currentTab = tab.id"
          >
            <component
              :is="tab.icon"
              class="h-5 w-5"
            />
            {{ tab.label }}
            <span
              v-if="tab.count > 0"
              class="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full ml-1"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>

      <!-- Shared Search and Filters -->
      <div
        v-if="currentTab === 'all' || currentTab === 'pending'"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden"
      >
        <div
          class="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100"
        >
          <div class="relative w-full md:flex-1">
            <input
              v-model="searchQuery"
              type="text"
              class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Marka adı, slug, tescil no veya satıcı adı ile ara..."
              @input="handleSearch"
            >
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div
            v-if="currentTab === 'all'"
            class="flex gap-2 flex-shrink-0"
          >
            <button
              v-for="s in statusFilters"
              :key="s.value"
              :class="[currentStatus === s.value ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50']"
              class="px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              @click="currentStatus = s.value"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Alphabetical Filter -->
        <div
          v-if="currentTab === 'all'"
          class="px-6 py-3 flex flex-wrap gap-1.5 bg-white border-b border-gray-100"
        >
          <button
            :class="[!selectedLetter ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100']"
            class="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all uppercase"
            @click="selectedLetter = ''"
          >
            HEPSİ
          </button>
          <button
            v-for="letter in alphabet"
            :key="letter"
            :class="[selectedLetter === letter ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100']"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all uppercase"
            @click="selectedLetter = letter"
          >
            {{ letter }}
          </button>
        </div>

        <div
          v-if="loading"
          class="flex justify-center items-center h-64"
        >
          <ArrowPathIcon class="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      </div>

      <!-- Pending Applications Tab -->
      <div
        v-if="currentTab === 'pending' && !loading"
        class="space-y-4"
      >
        <div
          v-if="brands.length === 0"
          class="bg-white rounded-2xl p-12 text-center border border-gray-100"
        >
          <CheckCircleIcon class="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p class="text-gray-500 font-medium">
            Bekleyen başvuru yok!
          </p>
        </div>

        <div
          v-for="brand in brands"
          :key="brand.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-100 overflow-hidden text-2xl"
                >
                  <img
                    v-if="brand.image"
                    :src="resolveImageUrl(brand.image)"
                    class="w-full h-full object-contain"
                  >
                  <span v-else>{{ brand.icon || '🏷️' }}</span>
                </div>
                <div>
                  <h3 class="font-bold text-lg text-gray-900">
                    {{ brand.name }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ brand.Vendor?.businessName || 'Sistem' }}
                  </p>
                  <div class="flex gap-2 mt-2">
                    <span
                      :class="getApplicationTypeBadge(brand.applicationType)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold"
                    >
                      {{ getApplicationTypeLabel(brand.applicationType) }}
                    </span>
                    <span
                      v-if="brand.trademarkNumber"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700"
                    >
                      {{ brand.trademarkNumber }}
                    </span>
                    <span
                      :class="getStatusBadgeClass(brand)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold border"
                    >
                      {{ getStatusLabel(brand) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                  @click="openReviewModal(brand)"
                >
                  <EyeIcon class="h-4 w-4" />
                  İncele
                </button>
              </div>
            </div>

            <!-- Quick Document Preview -->
            <div class="mt-4 flex gap-3 flex-wrap">
              <a
                v-if="brand.documentUrl"
                :href="resolveImageUrl(brand.documentUrl)"
                target="_blank"
                class="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all"
              >
                <DocumentTextIcon class="h-4 w-4" />
                Tescil Belgesi
              </a>
              <a
                v-if="brand.invoiceChainUrl"
                :href="resolveImageUrl(brand.invoiceChainUrl)"
                target="_blank"
                class="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl hover:bg-amber-100 transition-all"
              >
                <QueueListIcon class="h-4 w-4" />
                Fatura Silsilesi
              </a>
              <a
                v-if="brand.authorizationUrl"
                :href="resolveImageUrl(brand.authorizationUrl)"
                target="_blank"
                class="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-2 rounded-xl hover:bg-purple-100 transition-all"
              >
                <ShieldCheckIcon class="h-4 w-4" />
                Yetki Belgesi
              </a>
            </div>
          </div>
        </div>

        <!-- Pagination for Pending -->
        <div
          v-if="totalPages > 1"
          class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-2xl mt-4"
        >
          <div class="text-xs text-gray-500">
            Toplam <b>{{ totalItems }}</b> başvurudan <b>{{ (currentPage - 1) * 50 + 1 }} - {{ Math.min(currentPage *
              50, totalItems) }}</b> arası gösteriliyor
          </div>
          <div class="flex gap-2">
            <button
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-all"
              @click="currentPage--"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="p in visiblePages"
                :key="p"
                :class="[currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300']"
                class="w-10 h-10 rounded-lg border text-sm font-bold transition-all"
                @click="currentPage = p"
              >
                {{ p }}
              </button>
            </div>
            <button
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-all"
              @click="currentPage++"
            >
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- All Brands Tab (Table View) -->
      <div
        v-if="currentTab === 'all' && !loading"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Marka
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Başvuran
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tür
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="brand in brands"
              :key="brand.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 text-lg"
                  >
                    <img
                      v-if="brand.image"
                      :src="resolveImageUrl(brand.image)"
                      class="w-full h-full object-contain"
                    >
                    <span v-else>{{ brand.icon || '🏷️' }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">
                      {{ brand.name }}
                    </p>
                    <p class="text-[10px] text-gray-400 font-mono">
                      {{ brand.id.slice(0, 12) }}...
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p
                  v-if="brand.Vendor"
                  class="text-sm font-medium text-gray-600"
                >
                  {{ brand.Vendor.businessName }}
                </p>
                <p
                  v-else
                  class="text-xs text-gray-400"
                >
                  Sistem
                </p>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getApplicationTypeBadge(brand.applicationType)"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold"
                >
                  {{ getApplicationTypeLabel(brand.applicationType) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span
                    :class="getStatusBadgeClass(brand)"
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border w-fit"
                  >
                    {{ getStatusLabel(brand) }}
                  </span>
                  <span
                    v-if="brand.isPopular"
                    class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 w-fit"
                  >
                    🔥 Popüler
                  </span>
                  <span
                    v-if="brand._count?.violations > 0"
                    class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-100 text-red-700 border border-red-200 w-fit mt-1"
                  >
                    ⚠️ {{ brand._count.violations }} İHLAL
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end space-x-2">
                  <button
                    v-if="brand.status === 'PENDING'"
                    class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                    @click="openReviewModal(brand)"
                  >
                    İncele
                  </button>
                  <button
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    @click="editBrand(brand)"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <button
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    @click="deleteBrand(brand.id)"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div
          v-if="brands.length === 0"
          class="text-center py-12"
        >
          <p class="text-gray-500">
            Marka bulunamadı.
          </p>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50"
        >
          <div class="text-xs text-gray-500">
            Toplam <b>{{ totalItems }}</b> markadan <b>{{ (currentPage - 1) * 50 + 1 }} - {{ Math.min(currentPage * 50,
                                                                                                      totalItems) }}</b> arası gösteriliyor
          </div>
          <div class="flex gap-2">
            <button
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-all"
              @click="currentPage--"
            >
              <ChevronLeftIcon class="h-5 w-5" />
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="p in visiblePages"
                :key="p"
                :class="[currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300']"
                class="w-10 h-10 rounded-lg border text-sm font-bold transition-all"
                @click="currentPage = p"
              >
                {{ p }}
              </button>
            </div>
            <button
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 transition-all"
              @click="currentPage++"
            >
              <ChevronRightIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Violations Tab -->
      <div
        v-if="currentTab === 'violations'"
        class="space-y-4"
      >
        <div
          v-if="violationsLoading"
          class="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100"
        >
          <ArrowPathIcon class="h-10 w-10 text-blue-600 animate-spin" />
        </div>

        <div
          v-else-if="violations.length === 0"
          class="bg-white rounded-2xl p-12 text-center border border-gray-100"
        >
          <CheckCircleIcon class="h-16 w-16 text-green-400 mx-auto mb-4" />
          <p class="text-gray-500 font-medium">
            Bekleyen ihlal bildirimi bulunamadı.
          </p>
        </div>

        <div
          v-for="violation in violations"
          v-else
          :key="violation.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="p-4 bg-red-50 text-red-600 rounded-2xl">
                  <ShieldExclamationIcon class="h-8 w-8" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-bold text-lg text-gray-900">
                      {{ violation.Brand?.name }}
                    </h3>
                    <span
                      :class="getSeverityBadgeClass(violation.severity)"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase"
                    >
                      {{ getSeverityLabel(violation.severity) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                    <InformationCircleIcon class="h-4 w-4" />
                    {{ violation.violationType }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Bildiren: {{ violation.reporterType }} ({{
                      formatDate(violation.createdAt) }})
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                  @click="openViolationModal(violation)"
                >
                  <EyeIcon class="h-4 w-4" />
                  İncele
                </button>
                <button
                  v-if="violation.status === 'PENDING'"
                  class="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                  @click="resolveViolationQuickly(violation)"
                >
                  <CheckIcon class="h-4 w-4" />
                  Çözüldü
                </button>
              </div>
            </div>

            <div
              v-if="violation.description"
              class="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ violation.description }}
              </p>
            </div>

            <div
              v-if="violation.evidenceUrls?.length"
              class="mt-4 flex gap-2 overflow-x-auto pb-2"
            >
              <div
                v-for="(url, idx) in violation.evidenceUrls"
                :key="idx"
                class="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 cursor-pointer"
              >
                <img
                  :src="resolveImageUrl(url)"
                  class="w-full h-full object-cover"
                  @click="openImage(url)"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side-by-Side Review Modal -->
    <Teleport to="body">
      <div
        v-if="showReviewModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-gray-50"
          >
            <div>
              <h2 class="text-xl font-bold text-gray-900">
                Marka Başvurusu İnceleme
              </h2>
              <p class="text-sm text-gray-500">
                {{ selectedBrand?.name }} - {{ selectedBrand?.Vendor?.businessName }}
              </p>
            </div>
            <button
              class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all"
              @click="showReviewModal = false"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Modal Body - Side by Side -->
          <div class="flex-1 overflow-hidden flex">
            <!-- Left: Document Preview -->
            <div class="w-1/2 border-r border-gray-100 overflow-y-auto p-6 bg-gray-50">
              <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <DocumentTextIcon class="h-5 w-5 text-blue-600" />
                Yüklenen Belgeler
              </h3>

              <div class="space-y-4">
                <!-- Tescil Belgesi -->
                <div
                  v-if="selectedBrand?.documentUrl"
                  class="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div class="px-4 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                    <span class="font-bold text-sm text-blue-800">Marka Tescil Belgesi</span>
                    <a
                      :href="resolveImageUrl(selectedBrand.documentUrl)"
                      target="_blank"
                      class="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                      Yeni Sekmede Aç
                    </a>
                  </div>
                  <div class="p-4">
                    <div
                      v-if="isImageUrl(selectedBrand.documentUrl)"
                      class="w-full h-64 bg-gray-100 rounded-xl overflow-hidden"
                    >
                      <img
                        :src="resolveImageUrl(selectedBrand.documentUrl)"
                        class="w-full h-full object-contain"
                      >
                    </div>
                    <div
                      v-else
                      class="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                      <div class="text-center">
                        <DocumentTextIcon class="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p class="text-sm text-gray-500">
                          PDF Belgesi
                        </p>
                        <a
                          :href="resolveImageUrl(selectedBrand.documentUrl)"
                          target="_blank"
                          class="text-blue-600 text-sm font-bold hover:underline"
                        >Görüntüle</a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fatura Silsilesi -->
                <div
                  v-if="selectedBrand?.invoiceChainUrl"
                  class="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div class="px-4 py-3 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                    <span class="font-bold text-sm text-amber-800">Fatura Silsilesi</span>
                    <a
                      :href="resolveImageUrl(selectedBrand.invoiceChainUrl)"
                      target="_blank"
                      class="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                      Yeni Sekmede Aç
                    </a>
                  </div>
                  <div class="p-4">
                    <div
                      v-if="isImageUrl(selectedBrand.invoiceChainUrl)"
                      class="w-full h-64 bg-gray-100 rounded-xl overflow-hidden"
                    >
                      <img
                        :src="resolveImageUrl(selectedBrand.invoiceChainUrl)"
                        class="w-full h-full object-contain"
                      >
                    </div>
                    <div
                      v-else
                      class="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                      <div class="text-center">
                        <QueueListIcon class="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p class="text-sm text-gray-500">
                          PDF Belgesi
                        </p>
                        <a
                          :href="resolveImageUrl(selectedBrand.invoiceChainUrl)"
                          target="_blank"
                          class="text-amber-600 text-sm font-bold hover:underline"
                        >Görüntüle</a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Yetki Belgesi -->
                <div
                  v-if="selectedBrand?.authorizationUrl"
                  class="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div class="px-4 py-3 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                    <span class="font-bold text-sm text-purple-800">Yetkili Satıcı Belgesi</span>
                    <a
                      :href="resolveImageUrl(selectedBrand.authorizationUrl)"
                      target="_blank"
                      class="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                    >
                      <ArrowTopRightOnSquareIcon class="h-4 w-4" />
                      Yeni Sekmede Aç
                    </a>
                  </div>
                  <div class="p-4">
                    <div
                      v-if="isImageUrl(selectedBrand.authorizationUrl)"
                      class="w-full h-64 bg-gray-100 rounded-xl overflow-hidden"
                    >
                      <img
                        :src="resolveImageUrl(selectedBrand.authorizationUrl)"
                        class="w-full h-full object-contain"
                      >
                    </div>
                    <div
                      v-else
                      class="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center"
                    >
                      <div class="text-center">
                        <ShieldCheckIcon class="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p class="text-sm text-gray-500">
                          PDF Belgesi
                        </p>
                        <a
                          :href="resolveImageUrl(selectedBrand.authorizationUrl)"
                          target="_blank"
                          class="text-purple-600 text-sm font-bold hover:underline"
                        >Görüntüle</a>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Documents -->
                <div
                  v-if="!selectedBrand?.documentUrl && !selectedBrand?.invoiceChainUrl && !selectedBrand?.authorizationUrl"
                  class="bg-white rounded-2xl border border-gray-200 p-8 text-center"
                >
                  <ExclamationTriangleIcon class="h-12 w-12 text-amber-400 mx-auto mb-3" />
                  <p class="text-gray-500 font-medium">
                    Belge yüklenmemiş
                  </p>
                </div>
              </div>
            </div>

            <!-- Right: Review Actions -->
            <div class="w-1/2 overflow-y-auto p-6">
              <!-- Brand Info -->
              <div class="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 class="font-bold text-gray-700 mb-4">
                  Başvuru Bilgileri
                </h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500 text-xs uppercase font-bold mb-1">
                      Marka Adı
                    </p>
                    <p class="font-bold text-gray-900">
                      {{ selectedBrand?.name }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-xs uppercase font-bold mb-1">
                      Başvuru Türü
                    </p>
                    <span
                      :class="getApplicationTypeBadge(selectedBrand?.applicationType)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold"
                    >
                      {{ getApplicationTypeLabel(selectedBrand?.applicationType) }}
                    </span>
                  </div>
                  <div v-if="selectedBrand?.trademarkNumber">
                    <p class="text-gray-500 text-xs uppercase font-bold mb-1">
                      Tescil No
                    </p>
                    <p class="font-bold text-blue-600">
                      {{ selectedBrand?.trademarkNumber }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500 text-xs uppercase font-bold mb-1">
                      Başvuru Tarihi
                    </p>
                    <p class="font-medium text-gray-700">
                      {{ formatDate(selectedBrand?.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick Actions for Rejection -->
              <div class="mb-6">
                <h3 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
                  Hızlı Red Şablonları
                </h3>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="template in rejectionTemplates"
                    :key="template.id"
                    :class="['p-3 rounded-xl border text-left transition-all text-xs', selectedTemplate === template.id ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50 text-gray-600']"
                    @click="selectRejectionTemplate(template)"
                  >
                    <p class="font-bold">
                      {{ template.label }}
                    </p>
                  </button>
                </div>
              </div>

              <!-- Custom Rejection Reason -->
              <div class="mb-6">
                <label class="block text-sm font-bold text-gray-700 mb-2">Red Nedeni / İnceleme Notu</label>
                <textarea
                  v-model="rejectionReason"
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Başvuru neden reddedildi veya ek not ekleyin..."
                />
              </div>

              <!-- Popular Toggle -->
              <div class="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <p class="font-bold text-amber-800">
                    Popüler Marka
                  </p>
                  <p class="text-xs text-amber-600">
                    Ana sayfada öne çıkar
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    v-model="isPopularToggle"
                    type="checkbox"
                    class="sr-only peer"
                  >
                  <div
                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"
                  />
                </label>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button
                  :disabled="submitting"
                  class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  @click="approveBrandApplication(selectedBrand.id)"
                >
                  <CheckIcon class="h-5 w-5" />
                  Onayla
                </button>
                <button
                  :disabled="submitting"
                  class="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  @click="requestAdditionalDocs(selectedBrand.id)"
                >
                  <DocumentPlusIcon class="h-5 w-5" />
                  Ek Belge İste
                </button>
                <button
                  :disabled="submitting || (!rejectionReason && !selectedTemplate)"
                  class="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  @click="rejectBrandApplication(selectedBrand.id)"
                >
                  <XMarkIcon class="h-5 w-5" />
                  Reddet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Marka Form Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
          <div
            class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-gray-50"
          >
            <h2 class="text-xl font-bold text-gray-900">
              {{ isEditing ? 'Markayı Düzenle' : 'Yeni Marka Ekle' }}
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="closeModal"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form
            class="p-6 space-y-4"
            @submit.prevent="saveBrand"
          >
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-bold text-gray-700 mb-1">Marka Adı</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Örn: Apple"
                  @input="generateSlug"
                >
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Slug</label>
                <input
                  v-model="formData.slug"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 outline-none"
                  placeholder="apple"
                >
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Sıralama</label>
                <input
                  v-model.number="formData.order"
                  type="number"
                  class="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none"
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">Logo</label>
                <div class="flex gap-2">
                  <input
                    v-model="formData.image"
                    type="text"
                    class="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none"
                    placeholder="https://example.com/logo.png"
                  >
                  <label
                    class="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 p-2 rounded-xl shadow-sm transition-all flex items-center justify-center"
                  >
                    <CloudArrowUpIcon class="h-5 w-5 text-blue-600" />
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="e => handleFileUpload(e)"
                    >
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1">İkon (Emoji)</label>
                <input
                  v-model="formData.icon"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none"
                  placeholder="🍎"
                >
              </div>
            </div>

            <div
              v-if="formData.image"
              class="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4"
            >
              <img
                :src="formData.image"
                class="w-16 h-16 object-contain rounded-lg bg-white p-1"
              >
              <div>
                <p class="text-xs font-bold text-gray-900">
                  Logo Önizlemesi
                </p>
                <p class="text-[10px] text-gray-500 truncate max-w-[200px]">
                  {{ formData.image }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="flex-1 flex items-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                <input
                  id="isPopular"
                  v-model="formData.isPopular"
                  type="checkbox"
                  class="w-5 h-5 text-amber-600 rounded-lg cursor-pointer"
                >
                <label
                  for="isPopular"
                  class="ml-3 text-sm font-bold text-amber-900 cursor-pointer"
                >Popüler
                  İşaretle</label>
              </div>
              <div class="flex-1">
                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Marka Durumu</label>
                <select
                  v-model="formData.status"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="APPROVED">
                    Onaylı
                  </option>
                  <option value="PENDING">
                    Beklemede
                  </option>
                  <option value="REJECTED">
                    Reddedildi
                  </option>
                </select>
              </div>
            </div>

            <div class="pt-4 flex gap-3">
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg"
              >
                {{ saving ? 'Kaydediliyor...' : (isEditing ? 'Güncelle' : 'Kaydet') }}
              </button>
              <button
                type="button"
                class="px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                @click="closeModal"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Violation Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showViolationModal"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 class="text-xl font-bold text-gray-900">
              İhlal Bildirimi Detayı
            </h2>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="showViolationModal = false"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            <div class="flex items-center gap-4">
              <div class="p-4 bg-red-50 text-red-600 rounded-2xl">
                <ShieldExclamationIcon class="h-10 w-10" />
              </div>
              <div>
                <h3 class="font-bold text-xl text-gray-900">
                  {{ selectedViolation?.Brand?.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ selectedViolation?.violationType }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">
                  Severity
                </p>
                <select
                  v-model="violationSeverity"
                  class="w-full bg-transparent border-none p-0 font-bold text-gray-900 focus:ring-0"
                >
                  <option value="LOW">
                    Düşük
                  </option>
                  <option value="MEDIUM">
                    Orta
                  </option>
                  <option value="HIGH">
                    Yüksek
                  </option>
                  <option value="CRITICAL">
                    Kritik
                  </option>
                </select>
              </div>
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase font-bold mb-1">
                  Durum
                </p>
                <select
                  v-model="violationStatus"
                  class="w-full bg-transparent border-none p-0 font-bold text-gray-900 focus:ring-0"
                >
                  <option value="PENDING">
                    Beklemede
                  </option>
                  <option value="RESOLVED">
                    Çözüldü
                  </option>
                  <option value="REJECTED">
                    Reddedildi
                  </option>
                </select>
              </div>
            </div>

            <div v-if="selectedViolation?.description">
              <p class="text-sm font-bold text-gray-700 mb-2">
                Açıklama
              </p>
              <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-700">
                {{ selectedViolation.description }}
              </div>
            </div>

            <div>
              <p class="text-sm font-bold text-gray-700 mb-2">
                İşlem Notları
              </p>
              <textarea
                v-model="violationNotes"
                rows="4"
                class="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                placeholder="Bu ihlal hakkında yapılan işlemler..."
              />
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button
              class="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-white transition-all"
              @click="showViolationModal = false"
            >
              Kapat
            </button>
            <button
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              @click="updateViolation"
            >
              Güncelle / Çözüldü
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
  QueueListIcon,
  ArrowTopRightOnSquareIcon,
  DocumentPlusIcon,
  FireIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline'

const { resolveImageUrl } = useAppImage()
const { $api } = useApi()

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const brands = ref([])
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const showReviewModal = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const currentStatus = ref('')
const currentTab = ref('pending')
const selectedBrand = ref(null)
const rejectionReason = ref('')
const selectedTemplate = ref('')
const isPopularToggle = ref(false)

const searchQuery = ref('')
const selectedLetter = ref('')
const currentPage = ref(1)
const alphabet = ['A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z', '#']
const totalPages = ref(1)
const totalItems = ref(0)
const searchTimeout = ref(null)

const violations = ref([])
const violationsLoading = ref(false)
const showViolationModal = ref(false)
const selectedViolation = ref(null)
const violationNotes = ref('')
const violationStatus = ref('PENDING')
const violationSeverity = ref('MEDIUM')

const brandStats = ref({
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0,
  POPULAR: 0,
  VIOLATIONS: 0
})

const tabs = computed(() => [
  { id: 'pending', label: 'Bekleyen Başvurular', icon: ClockIcon, count: brandStats.value.PENDING },
  { id: 'all', label: 'Tüm Markalar', icon: ShieldCheckIcon, count: 0 },
  { id: 'violations', label: 'İhlal Bildirimleri', icon: ExclamationTriangleIcon, count: brandStats.value.VIOLATIONS || 0 }
])

const statusFilters = [
  { label: 'Tümü', value: '' },
  { label: 'Bekleyenler', value: 'PENDING' },
  { label: 'Onaylılar', value: 'APPROVED' },
  { label: 'Reddedilenler', value: 'REJECTED' }
]

const rejectionTemplates = [
  { id: 'ILLEGIBLE_DOC', label: 'Okunaksız Belge' },
  { id: 'MISSING_CHAIN', label: 'Eksik Fatura Silsilesi' },
  { id: 'MISSING_SIGNATURE', label: 'Marka Sahibi İmzası Eksik' },
  { id: 'EXPIRED_CERT', label: 'Tescil Belgesi Süresi Dolmuş' },
  { id: 'INVALID_CLASS', label: 'Marka Sınıfı Uyumsuz' },
  { id: 'OTHER', label: 'Diğer' }
]

const formData = ref({
  name: '',
  slug: '',
  icon: '',
  image: '',
  isPopular: false,
  order: 0,
  status: 'APPROVED'
})



const visiblePages = computed(() => {
  const pages = []
  let start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  if (end - start < 4) start = Math.max(1, end - 4)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const handleSearch = () => {
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1
    fetchBrands()
  }, 500)
}

const fetchBrands = async () => {
  loading.value = true
  try {
    const response = await $api('/api/admin/brands', {
      params: {
        status: currentStatus.value,
        q: searchQuery.value,
        letter: selectedLetter.value,
        page: currentPage.value,
        limit: 50
      }
    })
    if (response.success) {
      brands.value = response.data || []
      totalPages.value = response.meta?.totalPages || 1
      totalItems.value = response.meta?.total || 0
      if (response.stats) {
        brandStats.value = response.stats
      }
    }
  } catch (err) {
    console.error('Brands fetch error:', err)
  } finally {
    loading.value = false
  }
}

watch(currentTab, (newTab) => {
  currentPage.value = 1
  searchQuery.value = '' // Reset search when switching tabs for better UX
  if (newTab === 'pending') {
    currentStatus.value = 'PENDING'
  } else if (newTab === 'all') {
    currentStatus.value = ''
  } else if (newTab === 'violations') {
    fetchViolations()
  }
})

watch([currentStatus, currentPage, selectedLetter], () => {
  if (currentTab.value !== 'violations') {
    fetchBrands()
  }
})

const openReviewModal = (brand) => {
  selectedBrand.value = brand
  rejectionReason.value = ''
  selectedTemplate.value = ''
  isPopularToggle.value = brand.isPopular || false
  showReviewModal.value = true
}

const selectRejectionTemplate = (template) => {
  selectedTemplate.value = template.id
  rejectionReason.value = template.label
}

const isImageUrl = (url) => {
  if (!url) return false
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}

const approveBrandApplication = async (id) => {
  submitting.value = true
  try {
    const response = await $api(`/api/admin/brands/${id}/approve`, {
      method: 'PATCH',
      body: {
        isPopular: isPopularToggle.value,
        reviewNotes: rejectionReason.value
      }
    })
    if (response.success) {
      useNuxtApp().$toast.success('Marka onaylandı')
      showReviewModal.value = false
      fetchBrands()
    }
  } catch (err) {
    useNuxtApp().$toast.error('İşlem sırasında hata oluştu')
  } finally {
    submitting.value = false
  }
}

const requestAdditionalDocs = async (id) => {
  submitting.value = true
  try {
    const response = await $api(`/api/admin/brands/${id}/request-docs`, {
      method: 'PATCH',
      body: { notes: rejectionReason.value }
    })
    if (response.success) {
      useNuxtApp().$toast.success('Ek belge talebi gönderildi')
      showReviewModal.value = false
      fetchBrands()
    }
  } catch (err) {
    useNuxtApp().$toast.error('İşlem sırasında hata oluştu')
  } finally {
    submitting.value = false
  }
}

const rejectBrandApplication = async (id) => {
  if (!rejectionReason.value && !selectedTemplate.value) return
  submitting.value = true
  try {
    const response = await $api(`/api/admin/brands/${id}/reject`, {
      method: 'PATCH',
      body: {
        rejectionReason: rejectionReason.value,
        rejectionTemplate: selectedTemplate.value
      }
    })
    if (response.success) {
      useNuxtApp().$toast.success('Başvuru reddedildi')
      showReviewModal.value = false
      fetchBrands()
    }
  } catch (err) {
    useNuxtApp().$toast.error('İşlem sırasında hata oluştu')
  } finally {
    submitting.value = false
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Frontend validation
  const validation = validateImage(file)
  if (!validation.isValid) {
    toast.error(validation.error)
    return
  }

  const data = new FormData()
  data.append('file', file)

  try {
    useNuxtApp().$toast.info('Görsel yükleniyor...')
    const response = await $api('/api/upload?type=logo', {
      method: 'POST',
      body: data
    })

    if (response.success) {
      formData.value.image = response.url
      useNuxtApp().$toast.success('Logo başarıyla yüklendi')
    }
  } catch (error) {
    console.error('Upload error:', error)
    useNuxtApp().$toast.error('Yükleme sırasında hata oluştu')
  }
}

const generateSlug = () => {
  formData.value.slug = formData.value.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const openCreateModal = () => {
  isEditing.value = false
  currentId.value = null
  formData.value = { name: '', slug: '', icon: '', image: '', isPopular: false, order: 0, status: 'APPROVED' }
  showModal.value = true
}

const editBrand = (brand) => {
  isEditing.value = true
  currentId.value = brand.id
  formData.value = { ...brand }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveBrand = async () => {
  saving.value = true
  try {
    const response = await $api(url, {
      method,
      body: formData.value
    })

    if (response.success) {
      useNuxtApp().$toast.success('Marka başarıyla kaydedildi')
      closeModal()
      fetchBrands()
    }
  } catch (err) {
    console.error('Brand save error:', err)
    useNuxtApp().$toast.error('Kaydedilirken bir hata oluştu')
  } finally {
    saving.value = false
  }
}

const deleteBrand = async (id) => {
  if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return
  try {
    const response = await $api(`/api/admin/brands/${id}`, {
      method: 'DELETE'
    })
    if (response.success) {
      useNuxtApp().$toast.success('Marka silindi')
      fetchBrands()
    }
  } catch (err) {
    console.error('Brand delete error:', err)
    useNuxtApp().$toast.error('Silinirken bir hata oluştu')
  }
}

const getStatusBadgeClass = (brand) => {
  if (brand.status === 'PENDING' && brand.additionalDocsRequestedAt) {
    return 'bg-orange-50 text-orange-700 border-orange-200'
  }

  switch (brand.status) {
    case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200'
    case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
    case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getStatusLabel = (brand) => {
  if (brand.status === 'PENDING' && brand.additionalDocsRequestedAt) {
    return 'Belge Talep Edildi'
  }

  switch (brand.status) {
    case 'APPROVED': return 'Onaylı'
    case 'REJECTED': return 'Reddedilmiş'
    case 'PENDING': return 'Beklemede'
    default: return brand.status || 'Bilinmiyor'
  }
}

const getApplicationTypeBadge = (type) => {
  switch (type) {
    case 'OWNER': return 'bg-blue-100 text-blue-700'
    case 'AUTHORIZED_SELLER': return 'bg-purple-100 text-purple-700'
    case 'DISTRIBUTOR': return 'bg-indigo-100 text-indigo-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getApplicationTypeLabel = (type) => {
  switch (type) {
    case 'OWNER': return 'Marka Sahibi'
    case 'AUTHORIZED_SELLER': return 'Yetkili Satıcı'
    case 'DISTRIBUTOR': return 'Distribütör'
    default: return 'Belirtilmemiş'
  }
}

const fetchViolations = async () => {
  violationsLoading.value = true
  try {
    const response = await $api('/api/admin/brands/violations')
    if (response.success) {
      violations.value = response.data || []
    }
  } catch (err) {
    console.error('Violations fetch error:', err)
  } finally {
    violationsLoading.value = false
  }
}

const openViolationModal = (violation) => {
  selectedViolation.value = violation
  violationNotes.value = violation.adminNotes || ''
  violationStatus.value = violation.status
  violationSeverity.value = violation.severity || 'MEDIUM'
  showViolationModal.value = true
}

const updateViolation = async () => {
  if (!selectedViolation.value) return
  submitting.value = true
  try {
    const response = await $api(`/api/admin/brands/violations/${selectedViolation.value.id}`, {
      method: 'PATCH',
      body: {
        status: violationStatus.value,
        adminNotes: violationNotes.value,
        severity: violationSeverity.value
      }
    })
    if (response.success) {
      useNuxtApp().$toast.success('İhlal kaydı güncellendi')
      showViolationModal.value = false
      fetchViolations()
      fetchBrands() // Update stats
    }
  } catch (err) {
    useNuxtApp().$toast.error('İşlem sırasında hata oluştu')
  } finally {
    submitting.value = false
  }
}

const resolveViolationQuickly = async (violation) => {
  try {
    const response = await $api(`/api/admin/brands/violations/${violation.id}`, {
      method: 'PATCH',
      body: {
        status: 'RESOLVED',
        adminNotes: 'Hızlı çözüm ile onaylandı.'
      }
    })
    if (response.success) {
      useNuxtApp().$toast.success('İhlal çözüldü')
      fetchViolations()
      fetchBrands() // Update stats
    }
  } catch (err) {
    useNuxtApp().$toast.error('İşlem sırasında hata oluştu')
  }
}

const getSeverityBadgeClass = (severity) => {
  switch (severity) {
    case 'LOW': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

const getSeverityLabel = (severity) => {
  switch (severity) {
    case 'LOW': return 'Düşük'
    case 'MEDIUM': return 'Orta'
    case 'HIGH': return 'Yüksek'
    case 'CRITICAL': return 'Kritik'
    default: return severity || 'Belirsiz'
  }
}

const openImage = (url) => {
  window.open(resolveImageUrl(url), '_blank')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(fetchBrands)
</script>

<style scoped>
.spinner {
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
