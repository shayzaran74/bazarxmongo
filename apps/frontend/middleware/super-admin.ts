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

    // isSuperAdmin ve isAdmin store getter'larından okunur (user nesnesinde değil)
    if (!authStore.isSuperAdmin) {
        if (authStore.isAdmin) {
            return navigateTo('/admin')
        }
        return navigateTo('/')
    }

    return true
})
