// apps/frontend/server/api/settings/side-ads.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  // Backend SettingsController: /api/v1/settings/side-ads
  const backendUrl = `${config.public.apiBase}/api/v1/settings/side-ads`
  
  try {
    const res = await $fetch<any>(backendUrl, { query })
    // Backend {success, data} formatında döndürüyor
    return res
  } catch (err: any) {
    console.error('[Proxy Error] Side Ads:', err.message)
    // Hata durumunda boş başarılı yanıt döndür (UI crash olmasın)
    return { success: true, data: [] }
  }
})
