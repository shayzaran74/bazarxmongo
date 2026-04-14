import { useApi } from '~/services/api'
import type { ApiResponse, HelpArticle, HelpCategory } from '@barterborsa/shared-types'

export const useHelpService = () => {
    const { $api } = useApi()
    return {
        search: (query: string) => $api<ApiResponse<HelpArticle[]>>('/api/help/search', { params: { q: query } }),
        getPopular: () => $api<ApiResponse<HelpArticle[]>>('/api/help/popular'),
        getCategory: (slug: string) => $api<ApiResponse<HelpCategory>>(`/api/help/categories/${slug}`),
        getArticle: (slug: string) => $api<ApiResponse<HelpArticle>>(`/api/help/articles/${slug}`),
    }
}
