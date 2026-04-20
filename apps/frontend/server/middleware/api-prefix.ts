export default defineEventHandler((event) => {
  // SSR (Server-Side Rendering) sırasında `useApi.ts` içerisindeki client-side
  // interceptor çalışmayabilir. Proxy kurallarına uygun olarak gelen `/api/...` 
  // isteklerini backend formatına uyarak `/api/v1/...` şekline dönüştürürüz.
  const url = event.node.req.url;
  
  if (url && url.startsWith('/api/') && !url.startsWith('/api/v1/')) {
    event.node.req.url = url.replace('/api/', '/api/v1/');
  }
});
