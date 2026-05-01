---
paths:
  - "apps/frontend/**/*"
  - "packages/ui/**/*"
---
# Nuxt 3 & Frontend Guidelines

## Development
- Use **Vue 3 Composition API** with `<script setup lang="ts">`. Options API KESİNLİKLE YASAKTIR.
- Use **Nuxt 3 Auto-imports** effectively.
- All styles should use **TailwindCSS**.
- **Hardcoded URL YASAKTIR.** Tüm API çağrıları `useRuntimeConfig().public.apiBase` üzerinden yapılacaktır.
- Import path'leri `~/` prefix'i ile kullanılacaktır (Ör: `~/stores/auth`).

## SSR & Safety
- Use `import.meta.client` or `onMounted` for client-only code (window, document, localStorage vb.).
- Ensure all composables and stores are SSR-safe.
- Use `useFetch` or `useAsyncData` for data fetching.

## Store Management
- Use **Pinia** for state management.
- Store actions should be used for business logic, not just state mutation.

## ✨ Premium Aesthetics & Animations
- **Design Tokens:** Hardcoded hex/rgb values are forbidden. Use CSS variables or Tailwind theme tokens for colors, spacing, and typography.
- **Blur-Slide-Up Entrance:** All major sections and cards must use this entrance animation:
  - `initial: { opacity: 0, filter: 'blur(12px)', y: 28 }`
  - `animate: { opacity: 1, filter: 'blur(0px)', y: 0 }`
  - `transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }`
- **Micro-interactions:**
  - **Cards:** Use `whileHover: { y: -7, scale: 1.02 }` with spring physics (`stiffness: 300, damping: 22`).
  - **Buttons:** Use `whileHover: { scale: 1.05 }` and `whileTap: { scale: 0.95 }`.
- **Staggered Lists:** Use stagger delay (`0.09s`) for lists/grids to create an intentional, premium flow.
- **Typography:** Enforce consistent type scales. Heading font and body font must be clearly distinguished via tokens.
