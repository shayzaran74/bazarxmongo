import { ref, computed } from 'vue'

const HTML_ESCAPES: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;', '/': '&#x2F;',
    '`': '&#x60;', '=': '&#x3D;'
}

export const escapeHtml = (str: string): string => {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/[&<>"'`=/]/g, char => HTML_ESCAPES[char])
}

export const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return ''
    const lower = url.toLowerCase().trim()
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) return ''
    return url
}

export const sanitizeFormData = <T extends Record<string, unknown>>(data: T): T => {
    if (!data || typeof data !== 'object') return data
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim()
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeFormData(value as Record<string, unknown>)
        } else {
            sanitized[key] = value
        }
    }
    return sanitized as T
}

export const formatCurrency = (amount: number | string, currency = 'TRY'): string => {
    const num = parseFloat(String(amount))
    if (isNaN(num)) return '0,00 ₺'
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency', currency,
        minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(num)
}

export const sanitizeGiftCardCode = (code: string): string => {
    if (!code || typeof code !== 'string') return ''
    return code.toUpperCase().replace(/[^A-Z0-9-]/g, '').substring(0, 20)
}

export const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255
}

export const formatPhoneNumber = (phone: string): string => {
    if (!phone || typeof phone !== 'string') return ''
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 10 && digits.startsWith('5'))
        return `0${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`
    return phone
}

// localStorage wrapper — şifreleme içermez; hassas veriler burada saklanmamalıdır
export const secureStorage = {
    set: (key: string, value: unknown): void => {
        try { localStorage.setItem(key, JSON.stringify(value)) }
        catch { /* localStorage erişimi reddedildi (örn: private mod) */ }
    },
    get: <T>(key: string, defaultValue: T | null = null): T | null => {
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) as T : defaultValue
        } catch { return defaultValue }
    },
    remove: (key: string): void => {
        try { localStorage.removeItem(key) }
        catch { /* localStorage erişimi reddedildi */ }
    }
}

export const useCsrfToken = () => {
    const generateToken = (): string => {
        const array = new Uint8Array(32)
        crypto.getRandomValues(array)
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
    }
    const getToken = (): string => {
        let token = sessionStorage.getItem('csrf_token')
        if (!token) { token = generateToken(); sessionStorage.setItem('csrf_token', token) }
        return token
    }
    return { getToken, generateToken }
}

export const useRateLimiter = () => {
    const requestCounts = ref<Record<string, { count: number; startTime: number }>>({})
    const blockedUntil = ref<Record<string, number>>({})

    const canMakeRequest = (endpoint: string, maxRequests = 5, windowMs = 60000): boolean => {
        const now = Date.now()
        if (blockedUntil.value[endpoint] && now < blockedUntil.value[endpoint]) return false
        if (!requestCounts.value[endpoint]) requestCounts.value[endpoint] = { count: 0, startTime: now }
        const record = requestCounts.value[endpoint]
        if (now - record.startTime > windowMs) { record.count = 0; record.startTime = now }
        if (record.count >= maxRequests) { blockedUntil.value[endpoint] = now + 60000; return false }
        record.count++
        return true
    }

    const getTimeUntilUnblock = (endpoint: string): number => {
        const blocked = blockedUntil.value[endpoint]
        return blocked ? Math.max(0, blocked - Date.now()) : 0
    }

    return { canMakeRequest, getTimeUntilUnblock }
}

export const useHoneypot = () => {
    const honeypotValue = ref('')
    const formLoadTime = ref(Date.now())
    const isBot = computed(() => !!honeypotValue.value || Date.now() - formLoadTime.value < 2000)
    const reset = () => { honeypotValue.value = ''; formLoadTime.value = Date.now() }
    return { honeypotValue, formLoadTime, isBot, reset }
}
