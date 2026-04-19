// apps/frontend/server/api/settings/side-ads.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  // Forward to backend with v1 prefix
  // Backend: /api/v1/settings/side-ads
  const backendUrl = `${config.public.apiBase}/api/v1/settings/side-ads`
  
  try {
    return await $fetch(backendUrl, {
      query
    })
  } catch (err: any) {
    console.error('[Proxy Error] Side Ads:', err.message)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: 'Backend connection failed'
    })
  }
})
