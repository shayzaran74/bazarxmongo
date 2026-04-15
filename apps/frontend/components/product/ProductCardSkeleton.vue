<template>
  <div class="product-card-skeleton bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col h-full animate-pulse">
    <!-- Image Area -->
    <div class="relative aspect-[4/5] bg-slate-100 dark:bg-gray-800" />
    
    <!-- Content Area -->
    <div class="p-5 flex flex-col flex-grow space-y-4">
      <div class="flex items-center justify-between">
        <div class="h-3 bg-slate-100 dark:bg-gray-800 rounded w-1/3" />
        <div class="h-3 bg-slate-100 dark:bg-gray-800 rounded w-1/4" />
      </div>
      
      <div class="space-y-2">
        <div class="h-4 bg-slate-100 dark:bg-gray-800 rounded w-full" />
        <div class="h-4 bg-slate-100 dark:bg-gray-800 rounded w-2/3" />
      </div>
      
      <div class="mt-auto pt-4 border-t border-slate-50 dark:border-gray-800 flex items-end justify-between">
        <div class="space-y-2">
          <div class="h-2 bg-slate-50 dark:bg-gray-800 rounded w-12" />
          <div class="h-5 bg-slate-100 dark:bg-gray-800 rounded w-20" />
        </div>
        <div class="h-4 bg-slate-50 dark:bg-gray-800 rounded w-8" />
      </div>
    </div>
  </div>
</template>
