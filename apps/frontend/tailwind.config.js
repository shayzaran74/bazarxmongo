/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // ─── Mevcut BazarX renk sistemi (korunuyor) ───────────────────────
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#FFD814',
          600: '#eab308',
          700: '#a16207',
          900: '#713f12',
        },
        slate: {
          900: '#0F172A',
          950: '#020617',
        },
        success: {
          50:  '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },

        // ─── MD3 Token System (Additive — belge/html tasarımlarından) ──────
        // Çakışan keyler md3- prefix aldı:
        'md3-primary':               '#002444', // HTML'deki primary (navy)
        'md3-secondary':             '#046d39', // HTML'deki secondary (yeşil)
        'background-md3':            '#f8f9fa', // HTML'deki background

        // Surface tokens
        'surface':                   '#f8f9fa',
        'surface-bright':            '#f8f9fa',
        'surface-dim':               '#d9dadb',
        'surface-variant':           '#e1e3e4',
        'surface-container':         '#edeeef',
        'surface-container-low':     '#f3f4f5',
        'surface-container-high':    '#e7e8e9',
        'surface-container-lowest':  '#ffffff',
        'surface-container-highest': '#e1e3e4',
        'surface-tint':              '#436084',
        'inverse-surface':           '#2e3132',

        // On-* (text on surfaces)
        'on-surface':                '#191c1d',
        'on-surface-variant':        '#43474e',
        'on-background':             '#191c1d',
        'inverse-on-surface':        '#f0f1f2',

        // Primary container
        'primary-container':         '#1a3a5c',
        'on-primary-container':      '#87a4cc',
        'on-primary':                '#ffffff',
        'primary-fixed':             '#d2e4ff',
        'primary-fixed-dim':         '#abc9f2',
        'inverse-primary':           '#abc9f2',
        'on-primary-fixed':          '#001c37',
        'on-primary-fixed-variant':  '#2a486b',

        // Secondary container
        'secondary-container':       '#99f3b1',
        'on-secondary-container':    '#0e713d',
        'on-secondary':              '#ffffff',
        'secondary-fixed':           '#9cf6b4',
        'secondary-fixed-dim':       '#81d999',
        'on-secondary-fixed':        '#00210d',
        'on-secondary-fixed-variant':'#005229',

        // Tertiary / Altın tokens
        'tertiary':                  '#302000',
        'tertiary-container':        '#4c3500',
        'on-tertiary':               '#ffffff',
        'on-tertiary-container':     '#ce9925',
        'tertiary-fixed':            '#ffdea6',
        'tertiary-fixed-dim':        '#f7bd48', // Altın sarısı (badge/CTA)
        'on-tertiary-fixed':         '#271900',
        'on-tertiary-fixed-variant': '#5d4200',

        // Error tokens
        'error':                     '#ba1a1a',
        'error-container':           '#ffdad6',
        'on-error':                  '#ffffff',
        'on-error-container':        '#93000a',

        // Outline tokens
        'outline':                   '#73777f',
        'outline-variant':           '#c3c6cf',
      },

      fontSize: {
        // ─── MD3 Typography Scale ──────────────────────────────────────────
        'display-lg':  ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-sm':    ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-md':     ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-caps':  ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
      },

      borderRadius: {
        'md3':    '0.25rem',
        'md3-lg': '0.5rem',
        'md3-xl': '0.75rem',
      },

      boxShadow: {
        'premium':       '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
        'glow-primary':  '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-accent':   '0 0 20px rgba(255, 216, 20, 0.3)',
        'ambient':       '0 10px 30px -10px rgba(26, 58, 92, 0.08)',
      },

      animation: {
        'fade-in':   'fadeIn 0.5s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'pulse-slow':'pulse 3s infinite',
        'blur-in':   'blurIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Premium blur-slide-up entrance (tüm yeni MD3 bileşenler)
        blurIn: {
          '0%':   { opacity: '0', filter: 'blur(12px)', transform: 'translateY(28px)' },
          '100%': { opacity: '1', filter: 'blur(0px)',  transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}