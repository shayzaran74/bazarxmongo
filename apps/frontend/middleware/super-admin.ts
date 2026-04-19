export default defineNuxtRouteMiddleware(async (to) => {
    const authStore = useAuthStore()

    // Ensure user data is loaded
    if (!authStore.user) {
        await authStore.init()
    }

    // Check if authenticated
    if (!authStore.isAuthenticated) {
        return navigateTo('/auth/login')
    }

    // Check if user is active and has Super Admin role
    // We check for both isAdmin AND isSuperAdmin for maximum security
    const isSuperAdmin = authStore.user?.isAdmin && authStore.user?.isSuperAdmin

    if (!isSuperAdmin) {
        console.warn('🔐 Access Denied: Super Admin role required for', to.path)
        // Redirect to admin dashboard if they are a normal admin, otherwise to home
        if (authStore.user?.isAdmin) {
            return navigateTo('/admin')
        }
        return navigateTo('/')
    }

    return true
})
