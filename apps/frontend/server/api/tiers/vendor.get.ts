// apps/frontend/server/api/tiers/vendor.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backendUrl = `${config.public.apiBase}/api/v1/tiers/me`

  try {
    const authorization = getRequestHeader(event, 'authorization')
    const res = await $fetch<{ success: boolean; data: { tier?: string } }>(backendUrl, {
      headers: authorization ? { authorization } : {},
    })
    return res
  } catch {
    return { success: true, data: { tier: 'CORE', commission: 0.12 } }
  }
})
