<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
      @click="$emit('close')"
    />
    <div class="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up">
      <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic flex items-center">
            <SparklesIcon class="h-6 w-6 mr-2 text-primary-600" />
            {{ props.item ? 'İLANİ DÜZENLE' : 'YENİ FAZLA MAL İLANI' }}
          </h2>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            Takas etmek
            istediğiniz ürünü premium detaylarla listeleyin
          </p>
        </div>
        <button
          class="p-3 bg-white hover:bg-gray-100 rounded-2xl transition-all shadow-sm"
          @click="$emit('close')"
        >
          <XMarkIcon class="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div class="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-10">
        <!-- Temel Bilgiler Section -->
        <div class="space-y-6">
          <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
            <span class="w-8 h-px bg-primary-600 mr-3" />
            Temel Bilgiler
          </h3>

          <div class="space-y-2">
            <label class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">İLAN
              BAŞLIĞI *</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
              placeholder="Örn: 500 KG Polipropilen Granül"
              required
            >
          </div>

          <!-- Cascading Categories -->
          <div class="space-y-4">
            <label
              class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1"
            >KATEGORİ
              (KADEMELİ SEÇİM) *</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                v-model="selectedMainCategory"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                @change="handleMainCategoryChange"
              >
                <option value="">
                  Ana Kategori Seçin
                </option>
                <option
                  v-for="cat in mainCategories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>

              <select
                v-if="subCategories1.length > 0"
                v-model="selectedSubCategory1"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                @change="handleSubCategory1Change"
              >
                <option value="">
                  Alt Kategori Seçin
                </option>
                <option
                  v-for="cat in subCategories1"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div
              v-if="selectedSubCategory1 && subCategories2.length > 0"
              class="mt-4"
            >
              <select
                v-model="selectedSubCategory2"
                class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                @change="handleSubCategory2Change"
              >
                <option value="">
                  Detay Kategori Seçin
                </option>
                <option
                  v-for="cat in subCategories2"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label
                class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1"
              >MİKTAR
                *</label>
              <div class="relative group">
                <input
                  v-model.number="formData.quantity"
                  type="number"
                  class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-primary-500/10 transition-all"
                  placeholder="0"
                >
                <select
                  v-model="formData.unit"
                  class="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-100 rounded-xl text-[10px] font-black px-3 py-1.5 uppercase tracking-widest focus:ring-0 shadow-sm"
                >
                  <option
                    v-for="u in units"
                    :key="u"
                    :value="u"
                  >
                    {{ u }}
                  </option>
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label
                class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1"
              >TAHMİNİ
                BİRİM FİYAT (₺)</label>
              <div class="relative">
                <input
                  v-model.number="formData.unitPrice"
                  type="number"
                  step="0.01"
                  class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-primary-500/10 transition-all"
                  placeholder="0.00"
                >
                <span
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase tracking-widest"
                >TL</span>
              </div>
            </div>
          </div>

          <!-- Price Advisor Widget -->
          <div
            v-if="priceAdvisorData || priceAdvisorLoading"
            class="animate-in fade-in slide-in-from-top-2"
          >
            <div class="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-4 relative overflow-hidden">
              <div
                v-if="priceAdvisorLoading"
                class="flex items-center space-x-3 text-indigo-600"
              >
                <ArrowPathIcon class="h-4 w-4 animate-spin" />
                <span class="text-[10px] font-black uppercase tracking-widest">Piyasa Fiyatları Analiz
                  Ediliyor...</span>
              </div>
              <div
                v-else-if="priceAdvisorData"
                class="space-y-3"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs">📊</span>
                    <span
                      class="text-[10px] font-black text-indigo-600 uppercase tracking-widest"
                    >Piyasa
                      Endeksi ({{ priceAdvisorData.source }})</span>
                  </div>
                  <span class="text-[9px] font-bold text-gray-400">ORT: {{
                    formatCurrency(priceAdvisorData.marketAvg) }}</span>
                </div>

                <div
                  v-if="priceAdvisorData.comparison"
                  :class="{
                    'bg-white text-green-600 border-green-100': priceAdvisorData.comparison.level === 'GOOD',
                    'bg-white text-gray-600 border-gray-100': priceAdvisorData.comparison.level === 'NORMAL',
                    'bg-white text-amber-600 border-amber-100': priceAdvisorData.comparison.level === 'HIGH',
                    'bg-white text-red-600 border-red-100': priceAdvisorData.comparison.level === 'CRITICAL'
                  }"
                  class="p-3 rounded-xl border text-[11px] font-bold flex items-start space-x-2"
                >
                  <ExclamationTriangleIcon
                    v-if="['HIGH', 'CRITICAL'].includes(priceAdvisorData.comparison.level)"
                    class="h-4 w-4 shrink-0"
                  />
                  <SparklesIcon
                    v-else
                    class="h-4 w-4 shrink-0"
                  />
                  <span>{{ priceAdvisorData.comparison.message }}</span>
                </div>
              </div>

              <!-- Background Decoration -->
              <div class="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                <MagnifyingGlassIcon class="h-24 w-24 text-indigo-900" />
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label
              class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1"
            >AÇIKLAMA</label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full bg-gray-50 border-gray-200 rounded-[2rem] px-6 py-5 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
              placeholder="Ürün durumu, özellikleri ve takas şartları hakkında bilgi verin..."
            />
          </div>
        </div>

        <!-- Media Section -->
        <div class="space-y-6">
          <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
            <span class="w-8 h-px bg-primary-600 mr-3" />
            Görseller ve Medya
          </h3>

          <div class="space-y-4">
            <!-- Drag & Drop Upload Area -->
            <div
              class="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 text-center hover:border-primary-400 hover:bg-primary-50/10 transition-all group cursor-pointer"
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                multiple
                accept="image/*"
                @change="handleFileUpload"
              >
              <div
                class="bg-gray-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm"
              >
                <ArrowUpTrayIcon class="h-8 w-8 text-gray-400 group-hover:text-primary-600" />
              </div>
              <p class="text-[11px] font-black text-gray-700 uppercase tracking-[0.2em]">
                RESİMLERİ SÜRÜKLE
                VEYA SEÇ
              </p>
              <p class="text-[10px] text-gray-400 font-bold mt-2">
                MAKSİMUM 5 GÖRSEL, HER BİRİ 5MB
              </p>
            </div>

            <!-- Image URL Support -->
            <div class="flex gap-3">
              <input
                v-model="newImageUrl"
                type="text"
                class="flex-1 bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                placeholder="Görsel URL'si ekleyin (Opsiyonel)"
                @keyup.enter="addImage"
              >
              <button
                type="button"
                class="bg-gray-900 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg"
                @click="addImage"
              >
                EKLE
              </button>
            </div>

            <!-- Image Preview Grid -->
            <div
              v-if="formData.images?.length > 0"
              class="grid grid-cols-2 sm:grid-cols-5 gap-4"
            >
              <div
                v-for="(img, idx) in formData.images"
                :key="idx"
                class="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:scale-105"
              >
                <img
                  :src="resolveImageUrl(img)"
                  class="w-full h-full object-cover"
                >

                <!-- Tool Overlay -->
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2"
                >
                  <button
                    class="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                    @click="removeImage(idx)"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                  <button
                    v-if="idx !== 0"
                    class="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg"
                    @click="setAsMain(idx)"
                  >
                    <CheckCircleIcon class="h-4 w-4" />
                  </button>
                </div>

                <!-- Main Badge -->
                <div
                  v-if="idx === 0"
                  class="absolute top-2 left-2 bg-primary-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest"
                >
                  ANA GÖRSEL
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Wanted Categories & Trade Modes -->
        <div class="space-y-3">
          <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
            <span class="w-8 h-px bg-primary-600 mr-3" />
            Takas Tercihleri
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div class="space-y-3">
              <label
                class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1"
              >ARANAN
                KATEGORİLER</label>


              <div class="space-y-3">
                <!-- Main Category Select -->
                <select
                  v-model="wantedMainCat"
                  class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                  @change="handleWantedMainChange"
                >
                  <option value="">
                    Ana Kategori Seçin
                  </option>
                  <option
                    v-for="cat in wantedMainCategories"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{
                      cat.name }}
                  </option>
                </select>

                <!-- Sub Category 1 Select -->
                <div
                  v-if="wantedSub1List.length > 0"
                  class="animate-in fade-in slide-in-from-top-2"
                >
                  <select
                    v-model="wantedSub1"
                    class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                    @change="handleWantedSub1Change"
                  >
                    <option value="">
                      Alt Kategori Seçin
                    </option>
                    <option
                      v-for="cat in wantedSub1List"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name
                      }}
                    </option>
                  </select>
                </div>

                <!-- Sub Category 2 Select -->
                <div
                  v-if="wantedSub1 && wantedSub2List.length > 0"
                  class="animate-in fade-in slide-in-from-top-2"
                >
                  <select
                    v-model="wantedSub2"
                    class="w-full bg-gray-50 border-gray-200 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all"
                  >
                    <option value="">
                      Detay Kategori Seçin
                    </option>
                    <option
                      v-for="cat in wantedSub2List"
                      :key="cat.id"
                      :value="cat.id"
                    >
                      {{ cat.name
                      }}
                    </option>
                  </select>
                </div>

                <!-- Add Button (Correctly Positioned) -->
                <button
                  type="button"
                  class="w-full bg-gray-900 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center"
                  @click="addWantedCategory"
                >
                  <PlusIcon class="h-4 w-4 mr-2" /> KATEGORİYİ EKLE
                </button>
              </div>


              <!-- Selected Wanted Categories Tags -->
              <div
                v-if="formData.wantedCategories?.length > 0"
                class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100"
              >
                <div
                  v-for="(cat, idx) in formData.wantedCategories"
                  :key="idx"
                  class="group flex items-center bg-primary-50 text-primary-700 px-4 py-2 rounded-xl border border-primary-100 hover:bg-primary-100 transition-all"
                >
                  <span class="text-[10px] font-black uppercase tracking-widest">{{ cat }}</span>
                  <button
                    type="button"
                    class="ml-2 text-primary-300 group-hover:text-primary-600 transition-colors"
                    @click="removeWantedCategory(idx)"
                  >
                    <XMarkIcon class="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-20">
              <label
                class="block text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1"
              >TAKAS
                ŞEKİLLERİ</label>
              <div class="flex flex-col gap-3">
                <label
                  v-for="mode in tradeModeOptions"
                  :key="mode.value"
                  class="flex items-center space-x-4 bg-gray-50 px-5 py-4 rounded-2xl cursor-pointer transition-all border-2 group"
                  :class="formData.tradeModes.includes(mode.value) ? 'border-primary-600 bg-white shadow-lg' : 'border-transparent hover:bg-white hover:shadow-md'"
                >
                  <div class="relative flex items-center justify-center">
                    <input
                      v-model="formData.tradeModes"
                      type="checkbox"
                      :value="mode.value"
                      class="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-600 transition-all"
                    >
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black uppercase leading-none tracking-wider">{{
                      mode.label }}</span>
                    <span
                      class="text-[8px] font-bold text-gray-400 mt-1.5 uppercase tracking-tighter"
                    >{{
                      mode.desc }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Technical Specifications -->
        <div class="space-y-6">
          <h3 class="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center">
            <span class="w-8 h-px bg-primary-600 mr-3" />
            Ürün Teknik Özellikleri
          </h3>

          <div class="space-y-4">
            <div
              v-if="surplusAttributes.length > 0"
              class="p-6 bg-primary-50/30 rounded-[2rem] border border-primary-100 mb-6"
            >
              <h4
                class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-4 flex items-center"
              >
                <span class="w-4 h-px bg-primary-600 mr-2" />
                KATEGORİ ÖZELLİKLERİ
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="attr in surplusAttributes"
                  :key="attr.id"
                  class="space-y-1.5"
                >
                  <label
                    class="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1"
                  >
                    {{ attr.label }}
                    <span
                      v-if="attr.isRequired"
                      class="text-red-500"
                    >*</span>
                    <span
                      v-if="attr.unit"
                      class="text-[9px] lowercase font-bold text-gray-400"
                    >({{
                      attr.unit }})</span>
                  </label>

                  <template v-if="attr.type === 'select'">
                    <select
                      v-model="formData.technicalSpecs[attr.name]"
                      class="w-full bg-white border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                      :required="attr.isRequired"
                    >
                      <option value="">
                        Seçin
                      </option>
                      <option
                        v-for="opt in attr.options"
                        :key="opt"
                        :value="opt"
                      >
                        {{ opt }}
                      </option>
                    </select>
                  </template>

                  <template v-else-if="attr.type === 'multiselect'">
                    <div
                      class="flex flex-wrap gap-1.5 p-3 bg-white border border-gray-100 rounded-xl min-h-[42px] shadow-sm"
                    >
                      <label
                        v-for="opt in attr.options"
                        :key="opt"
                        class="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded-lg text-[10px] cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <input
                          v-model="formData.technicalSpecs[attr.name]"
                          type="checkbox"
                          :value="opt"
                          class="rounded-md text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                        >
                        <span class="font-bold text-gray-600">{{ opt }}</span>
                      </label>
                    </div>
                  </template>

                  <template v-else-if="attr.type === 'checkbox'">
                    <div class="flex items-center h-full pt-1">
                      <label
                        class="relative inline-flex items-center cursor-pointer scale-90 origin-left"
                      >
                        <input
                          v-model="formData.technicalSpecs[attr.name]"
                          type="checkbox"
                          class="sr-only peer"
                        >
                        <div
                          class="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"
                        />
                        <span
                          class="ml-3 text-[10px] font-black text-gray-600 uppercase tracking-widest"
                        >{{
                          formData.technicalSpecs[attr.name] ? 'Evet' : 'Hayır' }}</span>
                      </label>
                    </div>
                  </template>

                  <template v-else>
                    <input
                      v-model="formData.technicalSpecs[attr.name]"
                      :type="attr.type === 'number' ? 'number' : 'text'"
                      :placeholder="attr.placeholder || ''"
                      :required="attr.isRequired"
                      class="w-full bg-white border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                    >
                  </template>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between ml-1">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                DİNAMİK ÖZELLİK
                EKLEME
              </p>
              <button
                type="button"
                class="group flex items-center text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest"
                @click="addSpec"
              >
                <PlusIcon class="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                YENİ ÖZELLİK
              </button>
            </div>
            <div class="space-y-3">
              <TransitionGroup name="list">
                <div
                  v-for="(spec, idx) in technicalSpecsList"
                  :key="idx"
                  class="flex gap-3 animate-in slide-in-from-left-2 duration-200"
                >
                  <input
                    v-model="spec.key"
                    type="text"
                    placeholder="Özellik (Örn: Sertlik)"
                    class="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                  >
                  <input
                    v-model="spec.value"
                    type="text"
                    placeholder="Değer (Örn: 70 Shore)"
                    class="flex-1 bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-xs font-bold focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                  >
                  <button
                    type="button"
                    class="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                    @click="removeSpec(idx)"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="pt-6">
          <button
            :disabled="loading"
            class="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] py-6 text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-primary-600/30 active:scale-95 disabled:opacity-50 disabled:scale-100 overflow-hidden relative group"
            @click="submitItem"
          >
            <span
              v-if="loading"
              class="flex items-center justify-center"
            >
              <svg
                class="animate-spin h-5 w-5 mr-3 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              KAYDEDİLİYOR...
            </span>
            <span
              v-else
              class="flex items-center justify-center"
            >
              <CheckCircleIcon class="h-5 w-5 mr-2" />
              {{ props.item ? 'DEĞİŞİKLİKLERİ KAYDET' : 'İLANİ ONAYA GÖNDER' }}
            </span>
            <div
              class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from '#imports'
import { useApi, useNuxtApp } from '#imports'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'
import ArrowUpTrayIcon from '@heroicons/vue/24/outline/ArrowUpTrayIcon'
import PlusIcon from '@heroicons/vue/24/outline/PlusIcon'
import TrashIcon from '@heroicons/vue/24/outline/TrashIcon'
import CheckCircleIcon from '@heroicons/vue/24/outline/CheckCircleIcon'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import ArrowPathIcon from '@heroicons/vue/24/outline/ArrowPathIcon'
import ExclamationTriangleIcon from '@heroicons/vue/24/outline/ExclamationTriangleIcon'
import MagnifyingGlassIcon from '@heroicons/vue/24/outline/MagnifyingGlassIcon'

const props = defineProps({
    item: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'success'])
const { $api } = useApi()
const loading = ref(false)
const newImageUrl = ref('')

const formData = ref({
    companyId: '',
    title: '',
    description: '',
    category: '',
    materialType: '', // used for second level
    quantity: 0,
    unit: 'KG',
    unitPrice: 0,
    images: [],
    location: '',
    wantedCategories: [],
    tradeModes: ['barter'],
    technicalSpecs: {}
})

// Price Advisor State
const priceAdvisorData = ref(null)
const priceAdvisorLoading = ref(false)
let advisorTimer = null

const checkMarketPrice = () => {
    if (!formData.value.title || formData.value.title.length < 3) {
        priceAdvisorData.value = null
        return
    }

    if (advisorTimer) clearTimeout(advisorTimer)
    advisorTimer = setTimeout(async () => {
        priceAdvisorLoading.value = true
        try {
            const response = await $api('/api/price-advisor/check', {
                query: {
                    title: formData.value.title,
                    price: formData.value.unitPrice
                }
            })
            if (response.success) {
                priceAdvisorData.value = response
            }
        } catch (error) {
            console.error('Price advisor error:', error);
            priceAdvisorData.value = null;
        } finally {
            priceAdvisorLoading.value = false
        }
    }, 1500)
}


const categories = ref([])
const mainCategories = ref([])
const subCategories1 = ref([])
const subCategories2 = ref([])
const selectedMainCategory = ref('')
const selectedSubCategory1 = ref('')
const selectedSubCategory2 = ref('')
const surplusAttributes = ref([])
const surplusCategories_list = ref([])

// Surplus Categories (for Wanted Categories picker)
const surplusCategories = ref([])
const wantedMainCategories = computed(() => {
    return surplusCategories.value.filter(c => !c.parentId)
})

// Wanted Categories Filtering
const wantedMainCat = ref('')
const wantedSub1 = ref('')
const wantedSub2 = ref('')
const wantedSub1List = ref([])
const wantedSub2List = ref([])

const handleWantedMainChange = () => {
    wantedSub1.value = ''
    wantedSub2.value = ''
    wantedSub1List.value = surplusCategories.value.filter(c => c.parentId === wantedMainCat.value)
    wantedSub2List.value = []
}

const handleWantedSub1Change = () => {
    wantedSub2.value = ''
    wantedSub2List.value = surplusCategories.value.filter(c => c.parentId === wantedSub1.value)
}

const addWantedCategory = () => {
    const selectedId = wantedSub2.value || wantedSub1.value || wantedMainCat.value
    if (!selectedId) return

    const cat = surplusCategories.value.find(c => c.id === selectedId)
    if (cat && !formData.value.wantedCategories.includes(cat.name.toUpperCase())) {
        formData.value.wantedCategories.push(cat.name.toUpperCase())
        // Reset selectors
        wantedMainCat.value = ''
        wantedSub1.value = ''
        wantedSub2.value = ''
        wantedSub1List.value = []
        wantedSub2List.value = []
    }
}

const removeWantedCategory = (idx) => {
    formData.value.wantedCategories.splice(idx, 1)
}

const units = ['KG', 'ADET', 'METRE', 'TON', 'PAKET', 'PALET']

watch(() => [formData.value.title, formData.value.unitPrice], () => {
    checkMarketPrice()
})

const tradeModeOptions = [
    { value: 'barter', label: 'Sadece Takas', desc: 'Sadece ürün karşılığı takas kabul edilir.' },
    { value: 'cash', label: 'Sadece Satış', desc: 'Ürün sadece nakit ödeme ile satılır.' },
    { value: 'mixed', label: 'Karma Takas', desc: 'Ürün + Nakit farkı şeklinde takas kabul edilir.' }
]

const technicalSpecsList = ref([
    { key: '', value: '' }
])

const addSpec = () => {
    technicalSpecsList.value.push({ key: '', value: '' })
}

const removeSpec = (idx) => {
    technicalSpecsList.value.splice(idx, 1)
}

const handleMainCategoryChange = () => {
    selectedSubCategory1.value = ''
    selectedSubCategory2.value = ''
    subCategories1.value = surplusCategories.value.filter(c => c.parentId === selectedMainCategory.value)
    subCategories2.value = []
    updateFormDataCategories()
    fetchSurplusAttributes(selectedMainCategory.value)
}

const handleSubCategory1Change = () => {
    selectedSubCategory2.value = ''
    subCategories2.value = surplusCategories.value.filter(c => c.parentId === selectedSubCategory1.value)
    updateFormDataCategories()
    fetchSurplusAttributes(selectedSubCategory1.value || selectedMainCategory.value)
}

const handleSubCategory2Change = () => {
    updateFormDataCategories()
    fetchSurplusAttributes(selectedSubCategory2.value || selectedSubCategory1.value || selectedMainCategory.value)
}

const updateFormDataCategories = () => {
    const main = mainCategories.value.find(c => c.id === selectedMainCategory.value)
    const sub1 = subCategories1.value.find(c => c.id === selectedSubCategory1.value)
    const sub2 = subCategories2.value.find(c => c.id === selectedSubCategory2.value)

    formData.value.category = main ? main.name : ''
    // Combine sub-categories for materialType or just use the deepest selected one
    if (sub2) {
        formData.value.materialType = sub2.name
    } else if (sub1) {
        formData.value.materialType = sub1.name
    } else {
        formData.value.materialType = ''
    }
}

// Image Selection & Management
const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    await processFiles(files)
}

const handleDrop = async (event) => {
    const files = Array.from(event.dataTransfer.files)
    await processFiles(files)
}

const processFiles = async (files) => {
    const limit = 5 - (formData.value.images?.length || 0)
    const filesToUpload = files.slice(0, limit)

    for (const file of filesToUpload) {
        if (file.size > 5 * 1024 * 1024) {
            useNuxtApp().$toast.error(`${file.name} (5MB'dan büyük)`)
            continue
        }

        const data = new FormData()
        data.append('image', file)

        const categoryName = formData.value.materialType || formData.value.category || 'surplus'

        try {
            const response = await $api(`/api/upload?type=product&category=${encodeURIComponent(categoryName)}`, {
                method: 'POST',
                body: data
            })
            if (response.success) {
                formData.value.images.push(response.url)
            }
        } catch (error) {
            console.error('Upload failed:', error)
        }
    }
}

const setAsMain = (idx) => {
    const img = formData.value.images.splice(idx, 1)[0]
    formData.value.images.unshift(img)
}

const addImage = () => {
    if (newImageUrl.value.trim()) {
        if (formData.value.images.length >= 5) {
            useNuxtApp().$toast.error('Maksimum 5 görsel eklenebilir')
            return
        }
        formData.value.images.push(newImageUrl.value.trim())
        newImageUrl.value = ''
    }
}

const removeImage = (idx) => {
    formData.value.images.splice(idx, 1)
}

const fetchSurplusAttributes = async (categoryId) => {
    if (!categoryId) {
        surplusAttributes.value = []
        return
    }
    try {
        const response = await $api(`/api/surplus/categories/${categoryId}/attributes`)
        if (response.success) {
            surplusAttributes.value = response.data

            // Initialize technicalSpecs if they don't exist
            surplusAttributes.value.forEach(attr => {
                if (formData.value.technicalSpecs[attr.name] === undefined) {
                    if (attr.type === 'checkbox') formData.value.technicalSpecs[attr.name] = false
                    else if (attr.type === 'number') formData.value.technicalSpecs[attr.name] = null
                    else if (attr.type === 'multiselect') formData.value.technicalSpecs[attr.name] = []
                    else formData.value.technicalSpecs[attr.name] = ''
                }
            })
        }
    } catch (error) {
        console.error('Surplus özellikleri yüklenirken hata:', error)
    }
}

const fetchCategoriesData = async () => {
    try {
        // Fetch standard hierarchical categories
        const response = await $api('/api/categories', {
            query: { all: true }
        })
        if (response.success) {
            categories.value = response.data
            // mainCategories.value = categories.value.filter(c => !c.parentId) // We will use surplusCategories for item too
        }

        // Fetch surplus-specific categories
        const surplusResponse = await $api('/api/surplus/categories', {
            query: { all: true }
        })
        if (surplusResponse.success) {
            surplusCategories.value = surplusResponse.data
            mainCategories.value = surplusCategories.value.filter(c => !c.parentId) // Item's own categories are surplus categories
            surplusCategories_list.value = surplusResponse.data.filter(c => c.isActive).map(c => c.name)
        }
    } catch (error) {
        console.error('Fetch categories error:', error)
        surplusCategories_list.value = ['METAL', 'PLASTİK', 'ELEKTRONİK'] // Fallback
    }
}

const fetchMyCompany = async () => {
    try {
        const response = await $api('/api/companies/me')
        if (response.success && response.company) {
            formData.value.companyId = response.company.id
            formData.value.location = `${response.company.city} / ${response.company.district}`
        }
    } catch (error) {
        console.error('Fetch company error:', error)
    }
}

const submitItem = async () => {
    if (!formData.value.title || !formData.value.companyId || !formData.value.category) {
        useNuxtApp().$toast.error('Lütfen zorunlu alanları (Başlık, Kategori) doldurun')
        return
    }

    loading.value = true
    const specs = {}
    technicalSpecsList.value.forEach(s => {
        if (s.key.trim()) specs[s.key.trim()] = s.value.trim()
    })
    formData.value.technicalSpecs = specs

    try {
        const url = props.item ? `/api/surplus/${props.item.id}` : '/api/surplus'
        const method = props.item ? 'PATCH' : 'POST'

        const response = await $api(url, {
            method: method,
            body: formData.value
        })
        if (response.success) {
            useNuxtApp().$toast.success(props.item ? 'İlan güncellendi!' : 'İlanınız onaya gönderildi!')
            emit('success')
            emit('close')
        }
    } catch (error) {
        console.error('Create surplus item error:', error)
        useNuxtApp().$toast.error('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
        loading.value = false
    }
}

// Initialize form data if editing
const initializeData = async () => {
    await fetchCategoriesData()

    if (props.item) {
        formData.value = {
            companyId: props.item.companyId,
            title: props.item.title,
            description: props.item.description,
            category: props.item.category,
            materialType: props.item.materialType,
            quantity: props.item.quantity,
            unit: props.item.unit,
            unitPrice: props.item.unitPrice,
            images: [...(props.item.images || [])],
            location: props.item.location,
            wantedCategories: [...(props.item.wantedCategories || [])],
            tradeModes: [...(props.item.tradeModes || ['barter'])],
            technicalSpecs: props.item.technicalSpecs || {}
        }

        technicalSpecsList.value = Object.entries(formData.value.technicalSpecs).map(([key, value]) => ({ key, value }))
        if (technicalSpecsList.value.length === 0) technicalSpecsList.value = [{ key: '', value: '' }]

        // Reverse map categories to level refs
        const main = mainCategories.value.find(c => c.name === formData.value.category)
        if (main) {
            selectedMainCategory.value = main.id
            subCategories1.value = categories.value.filter(c => c.parentId === main.id)

            // Try to match materialType to sub1 or sub2
            const sub1 = subCategories1.value.find(c => c.name === formData.value.materialType)
            if (sub1) {
                selectedSubCategory1.value = sub1.id
                subCategories2.value = categories.value.filter(c => c.parentId === sub1.id)
            } else {
                // Check if it's in sub2
                for (const s1 of subCategories1.value) {
                    const possibleSub2s = categories.value.filter(c => c.parentId === s1.id)
                    const sub2 = possibleSub2s.find(c => c.name === formData.value.materialType)
                    if (sub2) {
                        selectedSubCategory1.value = s1.id
                        subCategories2.value = possibleSub2s
                        selectedSubCategory2.value = sub2.id
                        break
                    }
                }
            }
        }
    } else {
        await fetchMyCompany()
    }
}

onMounted(() => {
    initializeData()
})
</script>

<style scoped>
.animate-scale-up {
    animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scale-up {
    from {
        transform: scale(0.95);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #F9FAFB;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #E5E7EB;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #D1D5DB;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}
</style>
