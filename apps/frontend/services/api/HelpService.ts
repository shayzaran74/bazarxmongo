import { useApi } from '~/services/api'
import type { ApiResponse, HelpArticle, HelpCategory } from '@barterborsa/shared-types'

export const useHelpService = () => {
    const { $api } = useApi()
    return {
        search: (query: string): Promise<ApiResponse<HelpArticle[]>> => $api<HelpArticle[]>('/api/help/search', { params: { q: query } }),
        getPopular: (): Promise<ApiResponse<HelpArticle[]>> => $api<HelpArticle[]>('/api/help/popular'),
        getCategory: (slug: string): Promise<ApiResponse<HelpCategory>> => $api<HelpCategory>(`/api/help/categories/${slug}`),
        getArticle: (slug: string): Promise<ApiResponse<HelpArticle>> => $api<HelpArticle>(`/api/help/articles/${slug}`),
    }
}
