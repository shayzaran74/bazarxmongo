import { useApi } from '~/services/api'

export const useSurplusCategoryService = () => {
    const { $api } = useApi()
    return {
        getCategories: () => $api('/api/surplus/categories'),
    }
}
