export default defineNuxtRouteMiddleware((to, from) => {
    // Block direct navigation to /surplus from external/address bar
    // Only allow navigation from within the app (via ecosystem switcher)
    if (to.path.startsWith('/surplus')) {
        const authStore = useAuthStore()

        // If logged in but not a vendor, redirect to home with a prompt
        if (authStore.isLoggedIn && !authStore.isVendor) {
            return navigateTo('/') // The layout will handle showing the modal or toast if needed, or we can just block
        }

        // Allow if coming from within the app (internal navigation)
        if (from.path && from.path !== to.path && from.name) {
            return // Allow internal navigation
        }
        // Allow if referrer is from same origin (page refresh etc.)
        if (import.meta.client) {
            const referrer = document.referrer
            if (referrer && referrer.includes(window.location.host)) {
                return // Allow same-origin referrer
            }
        }
    }
})
