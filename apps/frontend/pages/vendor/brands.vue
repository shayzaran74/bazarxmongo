<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Info Banners -->
    <div
      v-if="pendingCount > 0"
      class="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl flex items-center gap-3"
    >
      <div class="p-2 bg-amber-100 rounded-xl">
        <ClockIcon class="h-5 w-5 text-amber-600" />
      </div>
      <p class="text-sm text-amber-800 font-medium">
        <span class="font-bold">{{ pendingCount }} bekleyen başvurunuz</span> inceleme sürecindedir. Ortalama
        inceleme süresi 2-3 iş günüdür.
      </p>
    </div>

    <div
      v-if="docRequestCount > 0"
      class="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl flex items-center gap-3"
    >
      <div class="p-2 bg-orange-100 rounded-xl">
        <ExclamationCircleIcon class="h-5 w-5 text-orange-600" />
      </div>
      <p class="text-sm text-orange-800 font-medium">
        <span class="font-bold">{{ docRequestCount }} başvurunuz için ek belge talep edildi.</span> Lütfen detayları
        inceleyip eksik belgeleri yükleyiniz.
      </p>
    </div>

    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Marka ve Fikri Mülkiyet Yönetimi
        </h1>
        <p class="text-gray-500 mt-1">
          Marka başvurularınızı yönetin, yetkili satıcı olun veya yeni marka tescili yapın.
        </p>
      </div>
      <button
        class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
        @click="openWizard"
      >
        <PlusIcon class="h-5 w-5" />
        Yeni Marka Başvurusu
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 rounded-xl">
            <CheckBadgeIcon class="h-6 w-6" />
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Onaylı Markalar
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ approvedCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 text-amber-600 rounded-xl">
            <ClockIcon class="h-6 w-6" />
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Bekleyen
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ pendingCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-600 rounded-xl">
            <ExclamationCircleIcon class="h-6 w-6" />
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Belge Bekleyen
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ docRequestCount }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 rounded-xl">
            <XCircleIcon class="h-6 w-6" />
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Reddedilen
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ rejectedCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Applications Table with Timeline -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 class="font-bold text-gray-800">
          Başvurularım
        </h2>
        <div class="flex gap-2">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            :class="[currentFilter === filter.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']"
            class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
            @click="currentFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <th class="px-6 py-4">
                Marka
              </th>
              <th class="px-6 py-4">
                Başvuru Türü
              </th>
              <th class="px-6 py-4">
                Durum Takibi
              </th>
              <th class="px-6 py-4">
                Belgeler
              </th>
              <th class="px-6 py-4 text-right">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="brand in filteredBrands"
              :key="brand.id"
              class="hover:bg-gray-50/50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-100 overflow-hidden"
                  >
                    <img
                      v-if="brand.icon || brand.image"
                      :src="resolveImageUrl(brand.icon || brand.image)"
                      class="w-full h-full object-contain"
                    >
                    <BookmarkSquareIcon
                      v-else
                      class="text-gray-400 h-6 w-6"
                    />
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">
                      {{ brand.name }}
                    </p>
                    <p
                      v-if="brand.trademarkNumber"
                      class="text-[10px] text-blue-600 font-mono flex items-center gap-1"
                    >
                      <ShieldCheckIcon class="h-3 w-3" />
                      {{ brand.trademarkNumber }}
                    </p>
                    <p
                      v-else
                      class="text-[10px] text-gray-400 font-mono"
                    >
                      {{ brand.id.slice(0, 12) }}...
                    </p>
                  </div>
                </div>
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
                <!-- Timeline -->
                <div class="flex items-center gap-1">
                  <div class="relative flex items-center">
                    <div :class="['w-3 h-3 rounded-full', brand.submittedAt ? 'bg-green-500' : 'bg-gray-300']" />
                    <div :class="['w-8 h-0.5', brand.reviewStartedAt ? 'bg-green-500' : 'bg-gray-200']" />
                  </div>
                  <div class="relative flex items-center">
                    <div
                      :class="['w-3 h-3 rounded-full', brand.reviewStartedAt ? 'bg-blue-500' : (brand.additionalDocsRequestedAt ? 'bg-orange-500' : 'bg-gray-300')]"
                    />
                    <div
                      :class="['w-8 h-0.5', brand.status === 'APPROVED' || brand.status === 'REJECTED' ? (brand.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-200']"
                    />
                  </div>
                  <div class="relative">
                    <div
                      :class="['w-3 h-3 rounded-full', brand.status === 'APPROVED' ? 'bg-green-500' : brand.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-300']"
                    />
                  </div>
                </div>
                <div class="flex gap-3 mt-1.5 text-[9px] text-gray-500">
                  <span>Başvuru</span>
                  <span>İnceleme</span>
                  <span>{{ brand.status === 'REJECTED' ? 'Red' : 'Onay' }}</span>
                </div>

                <div
                  v-if="brand.additionalDocsRequestedAt && brand.status === 'PENDING'"
                  class="mt-2"
                >
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block bg-orange-50 text-orange-600 border-orange-200"
                  >
                    Belge Talep Edildi
                  </span>
                  <p
                    v-if="brand.reviewNotes"
                    class="text-[10px] text-orange-600 mt-1 max-w-[200px] italic"
                  >
                    "{{ brand.reviewNotes }}"
                  </p>
                </div>
                <div v-else>
                  <span
                    :class="getStatusBadgeClass(brand.status)"
                    class="mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block"
                  >
                    {{ getStatusLabel(brand.status) }}
                  </span>
                  <p
                    v-if="brand.status === 'REJECTED'"
                    class="text-[10px] text-red-500 mt-1 max-w-[200px]"
                  >
                    {{ getRejectionLabel(brand.rejectionTemplate) || brand.rejectionReason }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1.5">
                  <a
                    v-if="brand.documentUrl"
                    :href="resolveImageUrl(brand.documentUrl)"
                    target="_blank"
                    class="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-[10px] bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 w-fit transition-all hover:shadow-sm"
                  >
                    <DocumentTextIcon class="h-3.5 w-3.5" />
                    Tescil Belgesi
                  </a>
                  <a
                    v-if="brand.invoiceChainUrl"
                    :href="resolveImageUrl(brand.invoiceChainUrl)"
                    target="_blank"
                    class="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-medium text-[10px] bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100 w-fit transition-all hover:shadow-sm"
                  >
                    <QueueListIcon class="h-3.5 w-3.5" />
                    Fatura Silsilesi
                  </a>
                  <a
                    v-if="brand.authorizationUrl"
                    :href="resolveImageUrl(brand.authorizationUrl)"
                    target="_blank"
                    class="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium text-[10px] bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100 w-fit transition-all hover:shadow-sm"
                  >
                    <ShieldCheckIcon class="h-3.5 w-3.5" />
                    Yetki Belgesi
                  </a>
                  <span
                    v-if="!brand.documentUrl && !brand.invoiceChainUrl && !brand.authorizationUrl"
                    class="text-gray-400 text-xs italic"
                  >Belge yok</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button
                    v-if="brand.status === 'PENDING'"
                    class="text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all"
                    @click="withdrawApplication(brand.id)"
                  >
                    <TrashIcon class="h-4 w-4" />
                    Geri Çek
                  </button>
                  <button
                    v-if="brand.status === 'PENDING' && brand.additionalDocsRequestedAt"
                    class="text-orange-600 hover:text-orange-700 text-xs font-bold flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-all border border-orange-200"
                    @click="editBrand(brand)"
                  >
                    <ArrowPathIcon class="h-4 w-4" />
                    Eksikleri Tamamla
                  </button>
                  <button
                    v-if="brand.status === 'REJECTED'"
                    class="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all"
                    @click="reapplyBrand(brand)"
                  >
                    <ArrowPathIcon class="h-4 w-4" />
                    Yeniden Başvur
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredBrands.length === 0">
              <td
                colspan="5"
                class="px-6 py-16 text-center"
              >
                <div class="flex flex-col items-center gap-3">
                  <div class="p-4 bg-gray-100 rounded-2xl">
                    <BookmarkSquareIcon class="h-10 w-10 text-gray-400" />
                  </div>
                  <p class="text-gray-500 font-medium">
                    Hiç marka başvurunuz bulunmuyor.
                  </p>
                  <button
                    class="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1"
                    @click="openWizard"
                  >
                    <PlusIcon class="h-4 w-4" />
                    İlk başvurunuzu yapın
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Application Wizard Modal -->
    <Teleport to="body">
      <div
        v-if="showWizard"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
          @click="showWizard = false"
        />
        <div
          class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          <!-- Modal Header with Steps -->
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-gray-900">
                Marka Başvuru Sihirbazı
              </h3>
              <button
                class="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-all"
                @click="showWizard = false"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <!-- Step Indicator -->
            <div class="flex items-center justify-between">
              <div
                v-for="(step, index) in wizardSteps"
                :key="step.id"
                class="flex-1 flex items-center last:flex-initial"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all',
                      currentStep === step.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
                      currentStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    ]"
                  >
                    <CheckIcon
                      v-if="currentStep > step.id"
                      class="h-5 w-5"
                    />
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div class="hidden sm:block">
                    <p :class="['text-sm font-bold', currentStep === step.id ? 'text-blue-600' : 'text-gray-500']">
                      {{ step.title }}
                    </p>
                    <p class="text-[10px] text-gray-400">
                      {{ step.subtitle }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="index < wizardSteps.length - 1"
                  :class="['flex-1 h-1 mx-4 rounded-full', currentStep > step.id ? 'bg-green-500' : 'bg-gray-200']"
                />
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto flex-1">
            <!-- Step 1: Application Type -->
            <div
              v-if="currentStep === 1"
              class="space-y-6"
            >
              <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex gap-3">
                <InformationCircleIcon class="text-blue-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div class="text-sm text-blue-700">
                  <p class="font-bold mb-1">
                    Başvuru türünü seçin
                  </p>
                  <p>Seçiminize göre yüklemeniz gereken belgeler belirlenecektir.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  v-for="type in applicationTypes"
                  :key="type.id"
                  :class="[
                    'p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg group',
                    form.applicationType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  ]"
                  @click="form.applicationType = type.id; currentStep = 2"
                >
                  <div
                    :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all', form.applicationType === type.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600']"
                  >
                    <component
                      :is="type.icon"
                      class="h-7 w-7"
                    />
                  </div>
                  <h4 class="font-bold text-gray-900 mb-1">
                    {{ type.label }}
                  </h4>
                  <p class="text-xs text-gray-500">
                    {{ type.description }}
                  </p>
                  <div class="mt-3 flex flex-wrap gap-1">
                    <span
                      v-for="doc in type.requiredDocs"
                      :key="doc"
                      class="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {{ doc }}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Brand Information -->
            <div
              v-if="currentStep === 2"
              class="space-y-6"
            >
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <label class="block text-sm font-bold text-gray-700">Marka Adı *</label>
                  <div class="relative group">
                    <QuestionMarkCircleIcon
                      class="h-4 w-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors"
                    />
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl"
                    >
                      Türk Patent ve Marka Kurumu'nda (TÜRKPATENT) tescilli olan veya başvuru yapacağınız markanın tam
                      adı.
                      <div
                        class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                      />
                    </div>
                  </div>
                </div>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Örn: Apple, Samsung, Nike"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
              </div>

              <div
                v-if="form.applicationType === 'OWNER'"
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <label class="block text-sm font-bold text-gray-700">Tescil Numarası</label>
                    <div class="relative group">
                      <QuestionMarkCircleIcon
                        class="h-4 w-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors"
                      />
                      <div
                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl"
                      >
                        Türk Patent ve Marka Kurumu tarafından verilen 7 veya 9 haneli tescil numarasıdır. Belgenizin
                        üst
                        kısmında yer alır.
                        <div
                          class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    v-model="form.trademarkNumber"
                    type="text"
                    placeholder="Örn: 2024/12345"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Tescil Tarihi</label>
                  <input
                    v-model="form.trademarkDate"
                    type="date"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Marka Logosu (Opsiyonel)</label>
                <div class="flex items-center gap-4">
                  <input
                    ref="logoInput"
                    type="file"
                    class="hidden"
                    accept="image/*"
                    @change="handleLogoUpload"
                  >
                  <div
                    class="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative group hover:border-blue-400 transition-all cursor-pointer"
                    @click="logoInput?.click()"
                  >
                    <img
                      v-if="form.logo"
                      :src="resolveImageUrl(form.logo)"
                      class="w-full h-full object-contain"
                    >
                    <PhotoIcon
                      v-else
                      class="text-gray-400 h-8 w-8 group-hover:text-blue-500 transition-colors"
                    />
                    <div
                      v-if="logoUploading"
                      class="absolute inset-0 bg-white/90 flex items-center justify-center rounded-2xl"
                    >
                      <ArrowPathIcon class="h-6 w-6 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <button
                      type="button"
                      :disabled="logoUploading"
                      class="px-4 py-2 text-sm font-bold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
                      @click="logoInput?.click()"
                    >
                      {{ form.logo ? 'Logoyu Değiştir' : 'Logo Yükle' }}
                    </button>
                    <p class="text-xs text-gray-400 mt-2">
                      PNG, JPG veya WEBP. Maks 2MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Document Upload -->
            <div
              v-if="currentStep === 3"
              class="space-y-6"
            >
              <!-- Dynamic Document Requirements based on Application Type -->
              <div
                class="p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-2xl flex gap-3"
              >
                <DocumentCheckIcon class="text-purple-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div class="text-sm text-purple-700">
                  <p class="font-bold mb-1">
                    {{ getApplicationTypeLabel(form.applicationType) }} için Gerekli Belgeler
                  </p>
                  <p>Aşağıdaki belgeleri eksiksiz yüklemeniz gerekmektedir.</p>
                </div>
              </div>

              <!-- Trademark Certificate (for OWNER) -->
              <div
                v-if="form.applicationType === 'OWNER'"
                class="space-y-2"
              >
                <div class="flex items-center gap-2">
                  <label class="block text-sm font-bold text-gray-700">Marka Tescil Belgesi *</label>
                  <div class="relative group">
                    <QuestionMarkCircleIcon
                      class="h-4 w-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors"
                    />
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl"
                    >
                      <div
                        class="w-full h-32 bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-3xl"
                      >
                        📜
                      </div>
                      TÜRKPATENT tarafından verilen resmi marka tescil belgesidir. PDF veya görsel formatında
                      yükleyebilirsiniz.
                      <div
                        class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                      />
                    </div>
                  </div>
                </div>
                <input
                  ref="documentInput"
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="(e) => handleDocumentUpload(e, 'documentUrl')"
                >
                <div
                  class="p-6 border-2 border-dashed rounded-2xl bg-gray-50 text-center hover:border-blue-400 transition-all cursor-pointer group relative"
                  :class="form.documentUrl ? 'border-green-400 bg-green-50' : 'border-gray-300'"
                  @click="documentInput?.click()"
                >
                  <div
                    v-if="docUploading.documentUrl"
                    class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl"
                  >
                    <ArrowPathIcon class="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div
                    class="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  >
                    <DocumentCheckIcon
                      v-if="form.documentUrl"
                      class="text-green-600 h-7 w-7"
                    />
                    <CloudArrowUpIcon
                      v-else
                      class="text-blue-600 h-7 w-7"
                    />
                  </div>
                  <h4 class="font-bold text-gray-900 text-sm">
                    {{ form.documentUrl ? 'Belge Yüklendi ✓' : 'Tescil Belgesi Yükle' }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">
                    PDF, JPG veya PNG formatında
                  </p>
                </div>
              </div>

              <!-- Invoice Chain (for AUTHORIZED_SELLER or DISTRIBUTOR) -->
              <div
                v-if="form.applicationType === 'AUTHORIZED_SELLER' || form.applicationType === 'DISTRIBUTOR'"
                class="space-y-2"
              >
                <div class="flex items-center gap-2">
                  <label class="block text-sm font-bold text-gray-700">Fatura Silsilesi *</label>
                  <div class="relative group">
                    <QuestionMarkCircleIcon
                      class="h-4 w-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors"
                    />
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl"
                    >
                      <p class="font-bold mb-2">
                        Fatura silsilesi nasıl olmalı?
                      </p>
                      <div class="space-y-1.5">
                        <p>• Marka sahibi → Distribütör</p>
                        <p>• Distribütör → Toptancı (varsa)</p>
                        <p>• Toptancı/Distribütör → Size</p>
                      </div>
                      <p class="mt-2 text-gray-300">
                        Tüm ara satış faturalarını sırasıyla tek PDF'te birleştirin.
                      </p>
                      <div
                        class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                      />
                    </div>
                  </div>
                </div>
                <input
                  ref="invoiceInput"
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="(e) => handleDocumentUpload(e, 'invoiceChainUrl')"
                >
                <div
                  class="p-6 border-2 border-dashed rounded-2xl bg-gray-50 text-center hover:border-amber-400 transition-all cursor-pointer group relative"
                  :class="form.invoiceChainUrl ? 'border-green-400 bg-green-50' : 'border-gray-300'"
                  @click="invoiceInput?.click()"
                >
                  <div
                    v-if="docUploading.invoiceChainUrl"
                    class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl"
                  >
                    <ArrowPathIcon class="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div
                    class="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  >
                    <QueueListIcon
                      v-if="form.invoiceChainUrl"
                      class="text-green-600 h-7 w-7"
                    />
                    <QueueListIcon
                      v-else
                      class="text-amber-600 h-7 w-7"
                    />
                  </div>
                  <h4 class="font-bold text-gray-900 text-sm">
                    {{ form.invoiceChainUrl ? 'Fatura Silsilesi Yüklendi ✓' :
                      'Fatura Silsilesi Yükle' }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">
                    Marka sahibinden size kadar tüm faturalar
                  </p>
                </div>
              </div>

              <!-- Authorization Letter -->
              <div
                v-if="form.applicationType === 'AUTHORIZED_SELLER'"
                class="space-y-2"
              >
                <div class="flex items-center gap-2">
                  <label class="block text-sm font-bold text-gray-700">Yetkili Satıcı Belgesi *</label>
                  <div class="relative group">
                    <QuestionMarkCircleIcon
                      class="h-4 w-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors"
                    />
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl"
                    >
                      Marka sahibi tarafından antetli kağıda yazılmış, ıslak imzalı veya e-imzalı yetkilendirme
                      yazısıdır. Firma kaşesi bulunmalıdır.
                      <div
                        class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                      />
                    </div>
                  </div>
                </div>
                <input
                  ref="authInput"
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="(e) => handleDocumentUpload(e, 'authorizationUrl')"
                >
                <div
                  class="p-6 border-2 border-dashed rounded-2xl bg-gray-50 text-center hover:border-purple-400 transition-all cursor-pointer group relative"
                  :class="form.authorizationUrl ? 'border-green-400 bg-green-50' : 'border-gray-300'"
                  @click="authInput?.click()"
                >
                  <div
                    v-if="docUploading.authorizationUrl"
                    class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl"
                  >
                    <ArrowPathIcon class="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div
                    class="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  >
                    <ShieldCheckIcon
                      v-if="form.authorizationUrl"
                      class="text-green-600 h-7 w-7"
                    />
                    <ShieldCheckIcon
                      v-else
                      class="text-purple-600 h-7 w-7"
                    />
                  </div>
                  <h4 class="font-bold text-gray-900 text-sm">
                    {{ form.authorizationUrl ? 'Yetki Belgesi Yüklendi ✓' :
                      'Yetki Belgesi Yükle' }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">
                    Antetli kağıt, imza ve kaşeli
                  </p>
                </div>
              </div>

              <!-- Distributor Agreement -->
              <div
                v-if="form.applicationType === 'DISTRIBUTOR'"
                class="space-y-2"
              >
                <div class="flex items-center gap-2">
                  <label class="block text-sm font-bold text-gray-700">Distribütör Anlaşması *</label>
                  <div class="relative group">
                    <QuestionMarkCircleIcon
                      class="h-4 w-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors"
                    />
                    <div
                      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-4 bg-gray-900 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl"
                    >
                      Marka distribütörü olduğunuzu gösteren resmi distribütörlük sözleşmesidir.
                      <div
                        class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"
                      />
                    </div>
                  </div>
                </div>
                <input
                  ref="distributorInput"
                  type="file"
                  class="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="(e) => handleDocumentUpload(e, 'distributorAgreementUrl')"
                >
                <div
                  class="p-6 border-2 border-dashed rounded-2xl bg-gray-50 text-center hover:border-indigo-400 transition-all cursor-pointer group relative"
                  :class="form.distributorAgreementUrl ? 'border-green-400 bg-green-50' : 'border-gray-300'"
                  @click="distributorInput?.click()"
                >
                  <div
                    v-if="docUploading.distributorAgreementUrl"
                    class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl"
                  >
                    <ArrowPathIcon class="h-8 w-8 text-blue-600 animate-spin" />
                  </div>
                  <div
                    class="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
                  >
                    <DocumentTextIcon
                      v-if="form.distributorAgreementUrl"
                      class="text-green-600 h-7 w-7"
                    />
                    <DocumentTextIcon
                      v-else
                      class="text-indigo-600 h-7 w-7"
                    />
                  </div>
                  <h4 class="font-bold text-gray-900 text-sm">
                    {{ form.distributorAgreementUrl ? 'Anlaşma Yüklendi ✓' :
                      'Anlaşma Yükle' }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">
                    İmzalı sözleşme nüshası
                  </p>
                </div>
              </div>

              <!-- Warning Box -->
              <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex gap-3">
                <ExclamationTriangleIcon class="text-amber-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div class="text-sm text-amber-800">
                  <p class="font-bold mb-1">
                    Önemli Bildirim
                  </p>
                  <p>
                    Eksik veya hatalı belge yüklenmesi durumunda başvurunuz reddedilebilir. Lütfen belgelerin okunaklı
                    olduğundan emin olun.
                  </p>
                </div>
              </div>
            </div>

            <!-- Step 4: Review & Submit -->
            <div
              v-if="currentStep === 4"
              class="space-y-6"
            >
              <div class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl">
                <h4 class="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircleIcon class="h-5 w-5" />
                  Başvuru Özeti
                </h4>
                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-green-100">
                    <span class="text-sm text-gray-600">Marka Adı</span>
                    <span class="font-bold text-gray-900">{{ form.name }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-green-100">
                    <span class="text-sm text-gray-600">Başvuru Türü</span>
                    <span class="font-bold text-gray-900">{{ getApplicationTypeLabel(form.applicationType) }}</span>
                  </div>
                  <div
                    v-if="form.trademarkNumber"
                    class="flex justify-between py-2 border-b border-green-100"
                  >
                    <span class="text-sm text-gray-600">Tescil No</span>
                    <span class="font-bold text-gray-900">{{ form.trademarkNumber }}</span>
                  </div>
                  <div class="flex justify-between py-2">
                    <span class="text-sm text-gray-600">Yüklenen Belgeler</span>
                    <span class="font-bold text-gray-900">{{ getUploadedDocCount() }} belge</span>
                  </div>
                </div>
              </div>

              <div class="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                <input
                  id="acceptTerms"
                  v-model="form.acceptTerms"
                  type="checkbox"
                  class="w-5 h-5 text-blue-600 rounded mt-0.5 cursor-pointer"
                >
                <label
                  for="acceptTerms"
                  class="text-sm text-blue-800 cursor-pointer"
                >
                  <span class="font-bold">Fikri Mülkiyet Koşullarını</span> okudum ve kabul ediyorum. Yüklediğim
                  belgelerin doğru ve geçerli olduğunu, aksi halde yasal sorumluluk altına gireceğimi beyan ederim.
                </label>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <button
              v-if="currentStep > 1"
              class="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2"
              @click="currentStep--"
            >
              <ArrowLeftIcon class="h-4 w-4" />
              Geri
            </button>
            <div v-else />

            <div class="flex gap-3">
              <button
                class="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all"
                @click="showWizard = false"
              >
                İptal
              </button>

              <button
                v-if="currentStep < 4"
                :disabled="!canProceed"
                class="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                @click="nextStep"
              >
                Sonraki
                <ArrowRightIcon class="h-4 w-4" />
              </button>

              <button
                v-else
                :disabled="submitting || !form.acceptTerms || !form.name || getUploadedDocCount() === 0"
                class="px-8 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                @click="submitApplication"
              >
                <ArrowPathIcon
                  v-if="submitting"
                  class="animate-spin h-5 w-5"
                />
                <CheckIcon
                  v-else
                  class="h-5 w-5"
                />
                {{ submitting ? 'Gönderiliyor...' : 'Başvuruyu Tamamla' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  CheckBadgeIcon,
  ClockIcon,
  XCircleIcon,
  BookmarkSquareIcon,
  TrashIcon,
  XMarkIcon,
  InformationCircleIcon,
  PhotoIcon,
  DocumentCheckIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TruckIcon,
  DocumentTextIcon,
  QueueListIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

interface Brand {
  id: string;
  name: string;
  status: string;
  icon?: string;
  image?: string;
  applicationType: string;
  trademarkNumber?: string;
  trademarkDate?: string;
  submittedAt?: string;
  reviewStartedAt?: string;
  additionalDocsRequestedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectionTemplate?: string;
  documentUrl?: string;
  invoiceChainUrl?: string;
  authorizationUrl?: string;
  distributorAgreementUrl?: string;
  acceptTerms?: boolean;
}

const { resolveImageUrl } = useAppImage()

const brands = ref<Brand[]>([])
const showWizard = ref<boolean>(false)
const currentStep = ref<number>(1)
const currentFilter = ref<string>('')
const submitting = ref<boolean>(false)
const logoUploading = ref<boolean>(false)
const editingBrandId = ref<string | null>(null)

const docUploading = ref<{ [key: string]: boolean }>({
  documentUrl: false,
  invoiceChainUrl: false,
  authorizationUrl: false,
  distributorAgreementUrl: false
})

const logoInput = ref<HTMLInputElement | null>(null)
const documentInput = ref<HTMLInputElement | null>(null)
const invoiceInput = ref<HTMLInputElement | null>(null)
const authInput = ref<HTMLInputElement | null>(null)
const distributorInput = ref<HTMLInputElement | null>(null)

const statusFilters = [
  { label: 'Tümü', value: '' },
  { label: 'Bekleyen', value: 'PENDING' },
  { label: 'Onaylı', value: 'APPROVED' },
  { label: 'Reddedilen', value: 'REJECTED' }
]

const wizardSteps = [
  { id: 1, title: 'Başvuru Türü', subtitle: 'Seçin' },
  { id: 2, title: 'Marka Bilgileri', subtitle: 'Doldurun' },
  { id: 3, title: 'Belge Yükleme', subtitle: 'Ekleyin' },
  { id: 4, title: 'Onay', subtitle: 'Tamamlayın' }
]

const applicationTypes = [
  {
    id: 'OWNER',
    label: 'Marka Sahibi',
    description: 'Markanın tescilli sahibiyim',
    icon: BuildingOfficeIcon,
    requiredDocs: ['Tescil Belgesi']
  },
  {
    id: 'AUTHORIZED_SELLER',
    label: 'Yetkili Satıcı',
    description: 'Marka tarafından yetkilendirildim',
    icon: UserGroupIcon,
    requiredDocs: ['Yetki Belgesi', 'Fatura Silsilesi']
  },
  {
    id: 'DISTRIBUTOR',
    label: 'Distribütör',
    description: 'Resmi distribütörüm',
    icon: TruckIcon,
    requiredDocs: ['Fatura Silsilesi', 'Distribütör Anlaşması']
  }
]

const form = reactive({
  name: '',
  logo: '',
  applicationType: '',
  trademarkNumber: '',
  trademarkDate: '',
  documentUrl: '',
  invoiceChainUrl: '',
  authorizationUrl: '',
  distributorAgreementUrl: '',
  acceptTerms: false,
  categoryIds: [] as string[]
})

const rejectionTemplates: Record<string, string> = {
  ILLEGIBLE_DOC: 'Belge okunaklı değil',
  MISSING_CHAIN: 'Eksik fatura silsilesi',
  MISSING_SIGNATURE: 'Marka sahibi imzası eksik',
  EXPIRED_CERT: 'Tescil belgesi süresi dolmuş',
  INVALID_CLASS: 'Marka sınıfı uyumsuz',
  OTHER: 'Diğer'
}

const fetchBrands = async () => {
  try {
    const { $api } = useApi()
    const res = await $api<Brand[]>('/api/vendor-brands')
    if (res.success && res.data) {
      brands.value = res.data
    }
  } catch (error) {
    console.error('Fetch brands error:', error)
  }
}

const filteredBrands = computed(() => {
  if (!currentFilter.value) return brands.value
  return brands.value.filter(b => b.status === currentFilter.value)
})

const docRequestCount = computed(() => {
  return brands.value.filter(b => b.additionalDocsRequestedAt && b.status === 'PENDING').length
})

const approvedCount = computed(() => brands.value.filter(b => b.status === 'APPROVED').length)
const pendingCount = computed(() => brands.value.filter(b => b.status === 'PENDING' && !b.additionalDocsRequestedAt).length)
const rejectedCount = computed(() => brands.value.filter(b => b.status === 'REJECTED').length)

const openWizard = () => {
  resetForm()
  currentStep.value = 1
  showWizard.value = true
}

const resetForm = () => {
  editingBrandId.value = null
  form.name = ''
  form.logo = ''
  form.applicationType = ''
  form.trademarkNumber = ''
  form.trademarkDate = ''
  form.documentUrl = ''
  form.invoiceChainUrl = ''
  form.authorizationUrl = ''
  form.distributorAgreementUrl = ''
  form.acceptTerms = false
}

const canProceed = computed(() => {
  if (currentStep.value === 1) return !!form.applicationType
  if (currentStep.value === 2) return !!form.name
  if (currentStep.value === 3) {
    if (form.applicationType === 'OWNER') return !!form.documentUrl
    if (form.applicationType === 'AUTHORIZED_SELLER') return !!form.invoiceChainUrl && !!form.authorizationUrl
    if (form.applicationType === 'DISTRIBUTOR') return !!form.invoiceChainUrl && (!!form.distributorAgreementUrl || !!form.authorizationUrl)
    return false
  }
  return true
})

const nextStep = () => {
  if (canProceed.value && currentStep.value < 4) {
    currentStep.value++
  }
}

const getUploadedDocCount = () => {
  let count = 0
  if (form.documentUrl) count++
  if (form.invoiceChainUrl) count++
  if (form.authorizationUrl) count++
  if (form.distributorAgreementUrl) count++
  return count
}

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  logoUploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { $api } = useApi()
    const res = await $api<{ url: string }>('/api/vendor-brands/upload-logo', {
      method: 'POST',
      body: formData
    })

    if (res.success && res.data?.url) {
      form.logo = res.data.url
    }
  } catch (err: unknown) {
    const error = err as { data?: { error?: string }; message?: string };
    alert('Logo yüklenirken hata oluştu: ' + (error.data?.error || error.message || 'Bilinmeyen hata'))
  } finally {
    logoUploading.value = false
    target.value = ''
  }
}

const handleDocumentUpload = async (event: Event, fieldName: string) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  if (!fileExt || !allowedExtensions.includes(fileExt)) {
    alert('Sadece PDF, JPG veya PNG formatında belgeler kabul edilmektedir.')
    target.value = ''
    return
  }

  docUploading.value[fieldName] = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const { $api } = useApi()
    const res = await $api<{ url: string }>('/api/vendor-brands/upload-document', {
      method: 'POST',
      body: formData
    })
    
    if (res.success && res.data?.url) {
      (form as any)[fieldName] = res.data.url
    }
  } catch (err: unknown) {
    const error = err as { data?: { error?: string }; message?: string };
    alert(error.data?.error || error.message || 'Belge yüklenirken bir hata oluştu')
  } finally {
    docUploading.value[fieldName] = false
    target.value = ''
  }
}

const submitApplication = async () => {
  submitting.value = true
  try {
    const url = editingBrandId.value
      ? `/api/vendor-brands/${editingBrandId.value}`
      : '/api/vendor-brands/apply'

    const method = editingBrandId.value ? 'PUT' : 'POST'

    const { $api } = useApi()
    const res = await $api(url, {
      method,
      body: {
        name: form.name,
        logo: form.logo,
        applicationType: form.applicationType,
        trademarkNumber: form.trademarkNumber,
        trademarkDate: form.trademarkDate || null,
        documentUrl: form.documentUrl,
        invoiceChainUrl: form.invoiceChainUrl,
        authorizationUrl: form.authorizationUrl,
        distributorAgreementUrl: form.distributorAgreementUrl
      }
    })

    if (res.success) {
      showWizard.value = false
      fetchBrands()
      const msg = editingBrandId.value
        ? 'Marka başvurunuz güncellendi ve tekrar incelemeye alındı.'
        : 'Marka başvurunuz başarıyla oluşturuldu. İncelenmek üzere sıraya alındı.'
      alert(msg)
      resetForm()
    }
  } catch (error: any) {
    alert('İşlem sırasında bir hata oluştu: ' + (error.data?.error || error.message))
  } finally {
    submitting.value = false
  }
}

const editBrand = (brand: Brand) => {
  editingBrandId.value = brand.id
  form.name = brand.name
  form.logo = brand.icon || brand.image || ''
  form.applicationType = brand.applicationType || 'OWNER'
  form.trademarkNumber = brand.trademarkNumber || ''
  form.trademarkDate = brand.trademarkDate ? new Date(brand.trademarkDate).toISOString().split('T')[0] : ''
  form.documentUrl = brand.documentUrl || ''
  form.invoiceChainUrl = brand.invoiceChainUrl || ''
  form.authorizationUrl = brand.authorizationUrl || ''
  form.distributorAgreementUrl = brand.distributorAgreementUrl || ''

  // Auto-accept terms when editing
  form.acceptTerms = brand.acceptTerms !== undefined ? brand.acceptTerms : true

  currentStep.value = 1
  showWizard.value = true
}

const withdrawApplication = async (id: string) => {
  if (!confirm('Başvuruyu geri çekmek istediğinize emin misiniz?')) return

  try {
    const { $api } = useApi()
    const res = await $api(`/api/vendor-brands/${id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      fetchBrands()
    }
  } catch (error) {
    alert('İşlem sırasında bir hata oluştu')
  }
}

const reapplyBrand = (brand: Brand) => {
  form.name = brand.name
  form.logo = brand.icon || brand.image || ''
  form.applicationType = brand.applicationType || 'OWNER'
  currentStep.value = 1
  showWizard.value = true
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200'
    case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-amber-50 text-amber-700 border-amber-200'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'Onaylandı'
    case 'REJECTED': return 'Reddedildi'
    default: return 'İnceleme Bekliyor'
  }
}

const getApplicationTypeBadge = (type: string) => {
  switch (type) {
    case 'OWNER': return 'bg-blue-100 text-blue-700'
    case 'AUTHORIZED_SELLER': return 'bg-purple-100 text-purple-700'
    case 'DISTRIBUTOR': return 'bg-indigo-100 text-indigo-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getApplicationTypeLabel = (type: string) => {
  switch (type) {
    case 'OWNER': return 'Marka Sahibi'
    case 'AUTHORIZED_SELLER': return 'Yetkili Satıcı'
    case 'DISTRIBUTOR': return 'Distribütör'
    default: return 'Belirtilmemiş'
  }
}

const getRejectionLabel = (template?: string) => {
  if (!template) return null;
  return rejectionTemplates[template] || null
}

onMounted(() => {
  fetchBrands()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
