// apps/frontend/composables/useAppImage.ts

/**
 * Backend'den gelen görsel yollarını (avatar, ürün, banner vb.) 
 * tam URL'ye dönüştürmek için kullanılan yardımcı composable.
 */
export const useAppImage = () => {
  const config = useRuntimeConfig();
  
  const resolveImageUrl = (path: string | null | undefined, type: 'avatar' | 'product' | 'banner' | 'general' = 'general') => {
    if (!path) {
      if (type === 'avatar') return '/images/default-avatar.png';
      return '/images/placeholder.png';
    }
    
    if (path.startsWith('http')) return path;
    
    const apiBase = config.public.apiBase || 'http://localhost:3001/api/v1';
    // Backend static paths (NestJS default static folder is 'uploads')
    const base = apiBase.replace('/api/v1', '');
    
    if (type === 'avatar') return `${base}/uploads/avatars/${path}`;
    if (type === 'product') return `${base}/uploads/products/${path}`;
    if (type === 'banner') return `${base}/uploads/banners/${path}`;
    
    return `${base}/uploads/${path}`;
  };

  return { resolveImageUrl };
};
