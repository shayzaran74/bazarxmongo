<template>
  <div class="space-y-6 font-sans italic">
    <!-- Global Search -->
    <div class="bg-slate-900/40 p-1 rounded-[1.5rem] border border-slate-800 focus-within:border-amber-600/50 transition-all duration-500">
      <div class="relative group">
        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-amber-500 transition-colors">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ENVANTERDE ARA..."
          class="w-full bg-transparent border-0 rounded-[1.2rem] pl-16 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-200 outline-none placeholder:text-slate-700"
          @input="debouncedSearch"
        >
      </div>
    </div>

    <!-- Collapsible Filters -->
    <div class="space-y-2">
      <!-- Categories -->
      <FilterSection
        title="KATEGORİ LABORATUVARI"
        :is-open="openSections.category"
        @toggle="toggleSection('category')"
      >
        <CategoryFilter
          v-model:search-query="categorySearch"
          :categories="filteredCategories"
          :active-category="localFilters.category"
          :expanded-categories="expandedCategories"
          :has-sub="(id) => getSubCategories(id).length > 0"
          :get-sub="getSubCategories"
          :is-expanded="(id) => expandedCategories.has(id)"
          @select="selectCategory"
          @toggle-expand="toggleCategory"
        />
      </FilterSection>

      <!-- Location -->
      <FilterSection
        title="LOJİSTİK KONUM"
        :is-open="openSections.location"
        @toggle="toggleSection('location')"
      >
        <LocationFilter
          v-model:search-query="citySearch"
          :cities="filteredCities"
          :active-location="localFilters.location"
          @select="selectLocation"
        />
      </FilterSection>

      <!-- Quantity Range -->
      <FilterSection
        title="MİKTAR SPEKTRUMU"
        :is-open="openSections.quantity"
        @toggle="toggleSection('quantity')"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[8px] font-black text-slate-600 tracking-widest uppercase ml-1">MİN</label>
              <input
                v-model.number="localFilters.minQuantity"
                type="number"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black text-slate-200 outline-none focus:border-amber-600/50"
              >
            </div>
            <div class="space-y-2">
              <label class="text-[8px] font-black text-slate-600 tracking-widest uppercase ml-1">MAKS</label>
              <input
                v-model.number="localFilters.maxQuantity"
                type="number"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black text-slate-200 outline-none focus:border-amber-600/50"
              >
            </div>
          </div>
          <button
            class="w-full py-3 bg-slate-800 hover:bg-amber-600 text-[10px] font-black uppercase tracking-widest text-slate-200 hover:text-white rounded-xl transition-all shadow-xl active:scale-95"
            @click="emitFilters"
          >
            FİLTREYİ UYGULA
          </button>
        </div>
      </FilterSection>

      <!-- Price Range -->
      <FilterSection
        title="BİRİM MALİYET"
        :is-open="openSections.price"
        @toggle="toggleSection('price')"
      >
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <input
              v-model.number="localFilters.minPrice"
              type="number"
              placeholder="MİN ₺"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black text-slate-200 outline-none focus:border-amber-600/50"
            >
            <input
              v-model.number="localFilters.maxPrice"
              type="number"
              placeholder="MAKS ₺"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[10px] font-black text-slate-200 outline-none focus:border-amber-600/50"
            >
          </div>
          <button
            class="w-full py-3 bg-slate-800 hover:bg-amber-600 text-[10px] font-black uppercase tracking-widest text-slate-200 hover:text-white rounded-xl transition-all shadow-xl active:scale-95"
            @click="emitFilters"
          >
            FİLTREYİ UYGULA
          </button>
        </div>
      </FilterSection>

      <!-- Status & Trade Mode -->
      <FilterSection
        title="İŞLEM DURUMU"
        :is-open="openSections.status"
        @toggle="toggleSection('status')"
      >
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="status in statusOptions"
            :key="status.value"
            :class="[
              'px-4 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border',
              localFilters.status === status.value
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/20'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            ]"
            @click="localFilters.status = status.value; emitFilters()"
          >
            {{ status.label }}
          </button>
        </div>
      </FilterSection>
      
      <FilterSection
        title="TAKAS PROTOKOLÜ"
        :is-open="openSections.tradeMode"
        @toggle="toggleSection('tradeMode')"
      >
        <div class="space-y-2">
          <button
            v-for="mode in tradeModeOptions"
            :key="mode.value"
            :class="[
              'w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border',
              localFilters.tradeMode === mode.value
                ? 'bg-slate-800 border-amber-600/50 text-amber-500'
                : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400'
            ]"
            @click="localFilters.tradeMode = mode.value; emitFilters()"
          >
            <div class="flex items-center justify-between">
              {{ mode.label }}
              <span v-if="localFilters.tradeMode === mode.value" class="text-amber-500">●</span>
            </div>
          </button>
        </div>
      </FilterSection>

      <!-- Toggle Flags -->
      <div class="pt-6 grid grid-cols-1 gap-3">
        <label
          v-for="flag in [
            { key: 'urgent', label: 'ACİL İLANLAR', icon: '⚡' },
            { key: 'bulkAvailable', label: 'TOPLU ALIM', icon: '📦' },
            { key: 'withImages', label: 'GÖRSEL KAYITLI', icon: '🖼️' }
          ]"
          :key="flag.key"
          class="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800/60 transition-all group"
        >
          <div class="flex items-center gap-4">
            <span class="text-lg opacity-40 group-hover:opacity-100 transition-opacity">{{ flag.icon }}</span>
            <span class="text-[10px] font-black text-slate-400 group-hover:text-amber-500 tracking-widest uppercase transition-colors">{{ flag.label }}</span>
          </div>
          <div class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="localFilters[flag.key]"
              type="checkbox"
              class="sr-only peer"
              @change="emitFilters"
            >
            <div class="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 peer-checked:after:bg-white shadow-inner" />
          </div>
        </label>
      </div>
    </div>

    <!-- Cleanup Engine -->
    <button
      v-if="hasActiveFilters"
      class="w-full py-5 bg-slate-950 border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] rounded-[1.5rem] hover:text-red-500 hover:border-red-500/30 transition-all shadow-2xl active:scale-95"
      @click="clearAllFilters"
    >
      PROTOKOLLERİ SIFIRLA
    </button>
  </div>
</template>

<script setup lang="ts">
import FilterSection from './filters/FilterSection.vue'
import CategoryFilter from './filters/CategoryFilter.vue'
import LocationFilter from './filters/LocationFilter.vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  cities: { type: Array, default: () => [] },
  specs: { type: Object, default: () => ({ materials: [], units: [], locations: [], wantedCategories: [], tradeModes: [] }) },
  currentFilters: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:filters', 'clear:filters'])

const {
  openSections, searchQuery, categorySearch, citySearch, expandedCategories, localFilters,
  statusOptions, tradeModeOptions, filteredCategories, filteredCities, hasActiveFilters,
  toggleSection, selectCategory, selectLocation, emitFilters, clearAllFilters,
  debouncedSearch, toggleCategory, getSubCategories
} = useSurplusFilters(props, emit)
</script>
