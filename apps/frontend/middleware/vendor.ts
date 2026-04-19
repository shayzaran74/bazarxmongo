export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // Initialize auth store if needed
    if (!authStore.user) {
        await authStore.init()
    }

    // If not authenticated, redirect to login
    if (!authStore.isAuthenticated) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    // Admins always have access to vendor pages for support/debugging
    if (authStore.isAdmin) {
        return true
    }

    // Check if they are a vendor and approved
    // vendorStatus is a getter in auth store that returns state.user.vendor.status (UPPERCASED)
    if (!authStore.isVendor || authStore.vendorStatus !== 'APPROVED') {
        // If not approved vendor (PENDING, REJECTED, or no vendor profile at all)
        // Redirect to onboarding page
        return navigateTo('/become-vendor')
    }

    return true
})
