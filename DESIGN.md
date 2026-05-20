# BazarX Design System (MD3 + Premium Glassmorphism)

This document outlines the official BazarX design tokens, layout guidelines, and component guidelines. It is structured to serve as an active design context for AI coding agents and Open Design.

---

## 1. Visual Theme & Atmosphere
BazarX combines the structured reliability of **Material Design 3 (MD3)** with a high-end, **Premium Glassmorphism** aesthetic. The visual theme is defined by:
* **Deep Trust & Dynamic Action:** Deep Navy and Slate create a solid corporate foundation, while vibrant Blue (`#3b82f6`) and golden Accent Yellow (`#FFD814`) act as call-to-action indicators.
* **Premium Micro-interactions:** Use of smooth transitions, subtle glows, and the signature **`blur-in`** entry animation (blur + slide up).
* **Local-first Clarity:** High-contrast interfaces optimized for local commercial exchange (B2B TicariTakas and B2C marketplaces).

---

## 2. Color Palette & Roles

### 2.1 Core Palette
| Color Role | Token Name | Value | Description |
| :--- | :--- | :---: | :--- |
| **Primary Navy** | `md3-primary` | `#002444` | Base corporate brand identity. |
| **Secondary Green** | `md3-secondary` | `#046d39` | Used for positive balance, status complete, and profit indicators. |
| **Accent Gold** | `accent-500` | `#FFD814` | High-fidelity highlights, star-ratings, and primary buttons. |
| **Success Green** | `success-500` | `#22c55e` | Transaction validations and active states. |
| **Base Background** | `background-md3` | `#f8f9fa` | Body background. |

### 2.2 Surface & Container System (MD3)
| Token Name | Hex Value | Usage |
| :--- | :--- | :--- |
| `surface` | `#f8f9fa` | Default card background. |
| `surface-variant` | `#e1e3e4` | Darker borders or inactive tabs. |
| `surface-container` | `#edeeef` | Medium-contrast inner containers. |
| `surface-container-lowest` | `#ffffff` | Absolute white cards for elevated content. |
| `primary-container` | `#1a3a5c` | Elevated Navy container (e.g. hero banner). |
| `secondary-container` | `#99f3b1` | Light green highlights for success statuses. |
| `tertiary-container` | `#4c3500` | Golden containers for B2B Apex/Elite indicators. |

### 2.3 Text Roles (On-* Tokens)
* `on-surface` (`#191c1d`): High emphasis text on standard surfaces.
* `on-surface-variant` (`#43474e`): Subtitles, helper text, and icons.
* `on-primary` (`#ffffff`): Text color inside Navy primary containers or buttons.
* `on-secondary-container` (`#0e713d`): Success text inside light-green alerts.
* `on-tertiary-container` (`#ce9925`): Golden label text.

---

## 3. Typography Rules
BazarX enforces a dual font-family strategy with specific MD3 type scaling rules:
* **Headings:** `Outfit` (fallback: `Inter`, `sans-serif`) for modern, rounded geometric look.
* **Body/UI Text:** `Inter` (fallback: `sans-serif`) for crisp legibility.

### 3.1 Typography Scale
| Token | Font Size | Line Height | Letter Spacing | Font Weight | Usage |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `display-lg` | `48px` | `56px` | `-0.02em` | `700` (Bold) | Large landing hero headers. |
| `headline-md` | `32px` | `40px` | `-0.01em` | `600` (SemiBold) | Section headers. |
| `title-sm` | `20px` | `28px` | `0` | `600` (SemiBold) | Card titles. |
| `body-md` | `16px` | `24px` | `0` | `400` (Regular) | Body text, descriptions. |
| `label-caps` | `12px` | `16px` | `0.05em` | `700` (Bold) | Badges, small metadata. |

---

## 4. Component Stylings

### 4.1 Buttons & Interactive Elements
* **Primary Button:** Uses `bg-accent-500` with `text-slate-900` or `bg-primary-600` with `text-white`. Must have `hover:shadow-glow-primary` or `hover:shadow-glow-accent` transitions.
* **Border Radius:** Applied uniformly using MD3 tokens:
  * `rounded-md3` (`0.25rem`) for small inputs.
  * `rounded-md3-lg` (`0.5rem`) for buttons and medium components.
  * `rounded-md3-xl` (`0.75rem`) for cards, modals, and sliders.

### 4.2 Cards & Elevons
* All cards must utilize `bg-surface-container-lowest` (pure white) on top of `bg-background-md3`.
* Standard shadow: `shadow-premium` (`0 10px 40px -10px rgba(0, 0, 0, 0.05)`).
* Hover transition: `hover:shadow-premium-hover` (`0 20px 50px -12px rgba(0, 0, 0, 0.1)`) accompanied by a translation `hover:-translate-y-0.5`.

---

## 5. Layout Principles
* **Fluid Grid:** Use of `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to handle cards.
* **Section Padding:** Spacing uses consistent padding (typically `py-8` to `py-16` or margin increments of `space-y-6`).
* **Container Bounds:** Standard wrappers should use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` to enforce horizontal alignment.

---

## 6. Depth & Elevation
Elevation is simulated through shadows and glass overlays:
* **Level 0 (Flat):** `bg-background-md3`
* **Level 1 (Card):** `bg-surface-container-lowest shadow-premium`
* **Level 2 (Modals & Overlays):** `bg-surface-container-lowest shadow-premium-hover border border-outline-variant`
* **Glass Overlays:** Add `backdrop-blur-md bg-white/80 border border-white/20 shadow-premium`.

---

## 7. Do's and Don'ts

### 7.1 Do's
* **DO** use the `blur-in` entry animation for new page views, modals, and dynamic card list loading to give a premium feel.
* **DO** check readability by matching text colors precisely to `on-*` tokens (e.g. `text-on-surface` on `#f8f9fa`).
* **DO** keep layouts structured using flexbox/grids instead of absolute positioning.

### 7.2 Don'ts
* **DON'T** use standard saturated primary colors (pure red, green, blue). Stick to `md3-primary`, `md3-secondary`, and `success-500`.
* **DON'T** use arbitrary borders. Utilize `border border-outline-variant` (`#c3c6cf`) for subtle dividers.
* **DON'T** apply `all-caps` to typography without adding `tracking-widest` or `tracking-wider` letter spacing.

---

## 8. Responsive Behavior
* Mobile: Strict single-column stack. Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
* Table views: Horizontal scroll for tables (`overflow-x-auto`) on screens smaller than 768px.
* Navigation: Bottom navigation bar for mobile screens, top header bar for desktop screens.

---

## 9. Agent Prompt Guide
When writing UI components for BazarX:
1. Inject the Tailwind class names directly into Vue / Nuxt templates.
2. Rely on CSS variables where Tailwind utility classes are not sufficient.
3. For custom animations, use the pre-configured keyframes:
   * `@keyframes blurIn { 0% { opacity: 0; filter: blur(12px); transform: translateY(28px); } 100% { opacity: 1; filter: blur(0); transform: translateY(0); } }`
4. Always wrap interactive panels in cards using `rounded-md3-xl border border-outline-variant bg-surface-container-lowest shadow-premium`.
