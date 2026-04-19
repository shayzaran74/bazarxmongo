export interface HomeMenuItem {
  title: string
  path: string
  icon: string
  colorFrom: string
  colorTo: string
  shadowColor: string
  hoverColor: string
}

export const useHomeMenuItems = () => {
  const { t } = useI18n()
  
  return computed<HomeMenuItem[]>(() => [
    { 
      title: t('home.menu.barter'), 
      path: '/barter', 
      icon: 'CurrencyDollarIcon', 
      colorFrom: 'from-blue-600', 
      colorTo: 'to-indigo-700', 
      shadowColor: 'shadow-blue-200', 
      hoverColor: 'group-hover:text-blue-600' 
    },
    { 
      title: t('home.menu.products'), 
      path: '/products', 
      icon: 'ShoppingBagIcon', 
      colorFrom: 'from-emerald-500', 
      colorTo: 'to-teal-600', 
      shadowColor: 'shadow-emerald-200', 
      hoverColor: 'group-hover:text-emerald-600' 
    },
    { 
      title: t('home.menu.auctions'), 
      path: '/auctions', 
      icon: 'FireIcon', 
      colorFrom: 'from-orange-500', 
      colorTo: 'to-red-600', 
      shadowColor: 'shadow-red-200', 
      hoverColor: 'group-hover:text-red-500' 
    },
    { 
      title: t('home.menu.lotteries'), 
      path: '/lotteries', 
      icon: 'TagIcon', 
      colorFrom: 'from-purple-500', 
      colorTo: 'to-indigo-600', 
      shadowColor: 'shadow-purple-200', 
      hoverColor: 'group-hover:text-purple-600' 
    },
    { 
      title: t('home.menu.vendors'), 
      path: '/vendors', 
      icon: 'CheckBadgeIcon', 
      colorFrom: 'from-slate-700', 
      colorTo: 'to-slate-900', 
      shadowColor: 'shadow-slate-200', 
      hoverColor: 'group-hover:text-slate-900' 
    },
    { 
      title: t('home.menu.restaurants'), 
      path: '/products?categorySlug=restoran-kafe', 
      icon: 'CheckBadgeIcon', 
      colorFrom: 'from-rose-500', 
      colorTo: 'to-pink-600', 
      shadowColor: 'shadow-rose-200', 
      hoverColor: 'group-hover:text-rose-600' 
    },
    { 
      title: t('home.menu.performance'), 
      path: '#performance', 
      icon: 'StarIcon', 
      colorFrom: 'from-amber-400', 
      colorTo: 'to-orange-500', 
      shadowColor: 'shadow-amber-200', 
      hoverColor: 'group-hover:text-amber-600' 
    }
  ])
}
