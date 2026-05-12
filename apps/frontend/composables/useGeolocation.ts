import { ref, computed } from 'vue'

interface UserLocation {
    latitude: number
    longitude: number
    city: string | null
    district: string | null
    accuracy: number
    timestamp: number
}

export const useGeolocation = () => {
    const location = ref<UserLocation | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const permissionDenied = ref(false)

    /**
     * Tarayıcı üzerinden kullanıcının konumunu al
     * SSR Safety: navigator sadece client'da erişilebilir
     */
    const getCurrentPosition = (): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            // SSR Safety: navigator sadece client'da
            if (!import.meta.client || !navigator.geolocation) {
                reject(new Error('Tarayıcınız konum servisini desteklemiyor'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => resolve(position),
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        permissionDenied.value = true
                        reject(new Error('Konum izni reddedildi'))
                    } else if (err.code === err.POSITION_UNAVAILABLE) {
                        reject(new Error('Konum bilgisi alınamadı'))
                    } else if (err.code === err.TIMEOUT) {
                        reject(new Error('Konum isteği zaman aşımına uğradı'))
                    } else {
                        reject(new Error('Bilinmeyen bir hata oluştu'))
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0 // Her zaman taze konum al
                }
            )
        })
    }

    /**
     * Koordinatlardan şehir/ilçe bilgisi al (Reverse Geocoding)
     */
    const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string | null; district: string | null }> => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=tr&addressdetails=1&zoom=10&t=${Date.now()}`,
                {
                    headers: {
                        'User-Agent': `TicariTakas/1.0 v${Date.now()}`
                    },
                    cache: 'no-store'
                }
            )

            if (!response.ok) {
                throw new Error('Geocoding servisine ulaşılamadı')
            }

            const data = await response.json()
            const address = data.address || {}

            // Province matching
            const rawCity = address.province || address.state || address.state_district || address.city || address.region || null
            const rawDistrict = address.county || address.district || address.suburb || address.town || null

            return { city: rawCity, district: rawDistrict }
        } catch (err) {
            console.error('Reverse geocoding error:', err)
            return { city: null, district: null }
        }
    }

    /**
     * Kullanıcının konumunu tespit et
     */
    const detectLocation = async (): Promise<UserLocation | null> => {
        loading.value = true
        error.value = null
        permissionDenied.value = false

        try {
            const position = await getCurrentPosition()
            const { latitude, longitude, accuracy } = position.coords

            // Şehir/ilçe bilgisini al
            const { city, district } = await reverseGeocode(latitude, longitude)

            const userLocation: UserLocation = {
                latitude,
                longitude,
                city,
                district,
                accuracy,
                timestamp: Date.now()
            }

            location.value = userLocation

            // Layout ile uyumlu olsun diye hem user_geolocation hem de detected_location'a kaydetmeyi düşünebiliriz
            // Ama şimdilik kendi key'inde tutalım. Ancak formatı uyumlu yapalım.
            // SSR Safety: localStorage sadece client'da
            if (import.meta.client) {
                localStorage.setItem('user_geolocation', JSON.stringify(userLocation))

                // Layout (default.vue) tarafından kullanılan key
                localStorage.setItem('detected_location', JSON.stringify({
                    city: city,
                    district: district,
                    timestamp: Date.now()
                }))
            }

            return userLocation
        } catch (err: unknown) {
            error.value = (err as Error).message || 'Konum alınamadı'
            return null
        } finally {
            loading.value = false
        }
    }

    /**
     * Kaydedilmiş konumu yükle
     */
    const loadSavedLocation = (): UserLocation | null => {
        // SSR Safety: localStorage sadece client'da
        if (!import.meta.client) return null;

        try {
            // Önce kendi key'ine bak
            const saved = localStorage.getItem('user_geolocation')
            if (saved) {
                const parsed = JSON.parse(saved) as UserLocation
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    location.value = parsed
                    return parsed
                }
            }

            // Eğer yoksa layout'un key'ine bak
            const layoutSaved = localStorage.getItem('detected_location')
            if (layoutSaved) {
                const parsed = JSON.parse(layoutSaved)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    const mapped: UserLocation = {
                        latitude: 0, longitude: 0, accuracy: 0,
                        city: parsed.city,
                        district: parsed.district,
                        timestamp: parsed.timestamp
                    }
                    location.value = mapped
                    return mapped
                }
            }
        } catch (err) {
            console.error('Load saved location error:', err)
        }
        return null
    }

    /**
     * Konumu temizle
     */
    const clearLocation = () => {
        location.value = null
        // SSR Safety: localStorage sadece client'da
        if (import.meta.client) {
            localStorage.removeItem('user_geolocation')
            localStorage.removeItem('detected_location')
        }
    }

    /**
     * Konum izni durumu
     * SSR Safety: navigator.permissions sadece client'da
     */
    const checkPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
        // SSR Safety: navigator sadece client'da
        if (!import.meta.client || !navigator.permissions) {
            return 'prompt'
        }

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' })
            return result.state as 'granted' | 'denied' | 'prompt'
        } catch {
            return 'prompt'
        }
    }

    const hasLocation = computed(() => !!location.value?.city)
    const displayLocation = computed(() => {
        if (!location.value) return 'Konum'
        if (location.value.district && location.value.city) {
            return `${location.value.district}, ${location.value.city}`
        }
        return location.value.city || 'Konum'
    })

    return {
        location,
        loading,
        error,
        permissionDenied,
        hasLocation,
        displayLocation,
        detectLocation,
        loadSavedLocation,
        clearLocation,
        checkPermission
    }
}
