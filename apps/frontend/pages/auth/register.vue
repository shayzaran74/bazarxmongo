<template>
  <div class="space-y-6">
    <!-- Error Alert -->
    <div v-if="authStore.error" class="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div class="text-xs font-bold text-red-600 uppercase tracking-tight">
        {{ authStore.error }}
      </div>
    </div>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <!-- Full Name -->
      <div class="space-y-2 group">
        <label for="name" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.fullName') }}
        </label>
        <div class="relative">
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
            :placeholder="$t('auth.fullName')"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-2 group">
        <label for="email" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.email') }}
        </label>
        <div class="relative">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
            placeholder="merhaba@bazarx.com"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-2 group">
        <label for="password" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.password') }}
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
            @click="showPassword = !showPassword"
          >
            <Icon v-if="showPassword" name="heroicons:eye-slash" class="w-5 h-5" />
            <Icon v-else name="heroicons:eye" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Consents -->
      <div class="space-y-3 pt-2">
        <div class="flex items-start px-1">
          <input id="acceptTerms" v-model="form.acceptTerms" type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer">
          <label for="acceptTerms" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer">{{ $t('auth.acceptTerms') }}</label>
        </div>
        <div class="flex items-start px-1">
          <input id="kvkkConsent" v-model="form.kvkkConsent" type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer">
          <label for="kvkkConsent" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer">{{ $t('auth.kvkkConsent') }}</label>
        </div>
      </div>

      <!-- Register Button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full h-15 bg-primary-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] shadow-xl hover:bg-primary-700 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 mt-6"
      >
        <div v-if="loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span class="relative z-10 font-display">
           {{ loading ? $t('auth.creatingAccount') : $t('auth.registerBtn') }}
        </span>
      </button>
    </form>

    <!-- Login Link -->
    <div class="text-center mt-6">
      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        {{ $t('auth.alreadyHaveAccount') }}
        <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline ml-1">
          {{ $t('auth.loginNow') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const { register } = useAuth();
const authStore = useAuthStore();
const router = useRouter();

const showPassword = ref(false);
const loading = ref(false);
const form = reactive({
  email: '',
  name: '',
  password: '',
  acceptTerms: false,
  kvkkConsent: false
});

const handleRegister = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    // Name alanını firstName ve lastName olarak parçala
    const nameParts = form.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';

    const success = await register({
      email: form.email,
      firstName,
      lastName,
      password: form.password
    });
    
    if (success) {
      await router.push('/');
    }
  } catch (error) {
    console.error('Register error:', error);
  } finally {
    loading.value = false;
  }
};
</script>
