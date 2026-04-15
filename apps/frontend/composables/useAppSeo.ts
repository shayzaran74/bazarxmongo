/** Dinamik SEO meta tag'leri */
export function useAppSeo(options: {
  title?: string
  description?: string
  image?: string
  type?: string
  noindex?: boolean
} = {}) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const siteName = config.public.appName || 'BarterBorsa'
  const baseUrl = 'https://barterborsa.com'

  const title = options.title ? `${options.title} | ${siteName}` : siteName
  const description = options.description || (config.public.appDescription as string)
  const currentUrl = `${baseUrl}${route.path}`
  const image = options.image || `${baseUrl}/og-image.png`

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
    ogImage: image,
    ogUrl: currentUrl,
    ogType: (options.type as 'website' | 'article' | 'product') || 'website',
    ogSiteName: siteName,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow',
  })

  useHead({
    link: [{ rel: 'canonical', href: currentUrl }],
  })

  return { title, description, currentUrl, image }
}
