import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  const options = {
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    icon: true,
    rtl: false
  }
  
  nuxtApp.vueApp.use(Toast, options)
  
  const toast = useToast()
  
  return {
    provide: {
      toast
    }
  }
})
