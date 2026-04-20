// apps/frontend/pages/vendor/advertising/composables/useGeoSelector.ts
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import { iller } from '~/assets/css/data/component/iller'

export function useGeoSelector() {
    const allCityNames = Object.keys(iller).sort((a, b) => a.localeCompare(b, 'tr'))
    
    const selectedCities = ref<string[]>([])
    const selectedDistricts = ref<string[]>([])
    
    const isCityDropdownOpen = ref(false)
    const isDistrictDropdownOpen = ref(false)
    
    const citySearch = ref('')
    const districtSearch = ref('')
    
    const cityDropdownRef = ref<HTMLElement | null>(null)
    const districtDropdownRef = ref<HTMLElement | null>(null)

    const filteredCities = computed(() => {
        if (!citySearch.value) return allCityNames
        const q = citySearch.value.toLowerCase()
        return allCityNames.filter(c => c.toLowerCase().includes(q))
    })

    const getFilteredDistricts = (city: string) => {
        const districts = (iller as any)[city] || []
        if (!districtSearch.value) return districts
        const q = districtSearch.value.toLowerCase()
        return districts.filter((d: string) => d.toLowerCase().includes(q))
    }

    const toggleCity = (city: string) => {
        const idx = selectedCities.value.indexOf(city)
        if (idx === -1) {
            selectedCities.value.push(city)
        } else {
            selectedCities.value.splice(idx, 1)
            // Remove related districts
            selectedDistricts.value = selectedDistricts.value.filter(d => !d.endsWith('(' + city + ')'))
        }
    }

    const removeCity = (city: string) => toggleCity(city)

    const toggleDistrict = (districtLabel: string) => {
        const idx = selectedDistricts.value.indexOf(districtLabel)
        if (idx === -1) selectedDistricts.value.push(districtLabel)
        else selectedDistricts.value.splice(idx, 1)
    }

    const removeDistrict = (d: string) => {
        selectedDistricts.value = selectedDistricts.value.filter(x => x !== d)
    }

    const handleClickOutside = (e: MouseEvent) => {
        if (cityDropdownRef.value && !cityDropdownRef.value.contains(e.target as Node)) isCityDropdownOpen.value = false
        if (districtDropdownRef.value && !districtDropdownRef.value.contains(e.target as Node)) isDistrictDropdownOpen.value = false
    }

    const reset = () => {
        selectedCities.value = []
        selectedDistricts.value = []
        citySearch.value = ''
        districtSearch.value = ''
    }

    onMounted(() => { document.addEventListener('click', handleClickOutside) })
    onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })

    return {
        selectedCities,
        selectedDistricts,
        isCityDropdownOpen,
        isDistrictDropdownOpen,
        citySearch,
        districtSearch,
        cityDropdownRef,
        districtDropdownRef,
        filteredCities,
        getFilteredDistricts,
        toggleCity,
        removeCity,
        toggleDistrict,
        removeDistrict,
        reset
    }
}
