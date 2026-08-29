/** @type {import('tailwindcss').Config} */

/* ============================================================
   NOCTURNAL SCHOLAR
   "Library at Midnight" — authoritative, prestigious, focused.
   Depth comes from TONAL LAYERING + ghost outlines, not shadows.
   Semantic names resolve to CSS variables (see src/index.css),
   raw ramps are exposed for the rare case a literal tone is needed.
   ============================================================ */

const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* ---------------------------------------------- TYPOGRAPHY */
      fontFamily: {
        // Latin face first, Bengali faces behind it — the browser falls back
        // per glyph, so Bengali always lands on a real Bengali face.
        //
        // Two Bengali faces, in a deliberate order per role:
        //   Hind Siliguri     — the reading face. Warmer, better conjuncts,
        //                       so it leads wherever running Bengali TEXT is
        //                       set. It only ships 400-700.
        //   Noto Sans Bengali — the numeral face. Ships 100-900 and has
        //                       wider, more even digits that sit properly
        //                       beside Latin figures, so it leads wherever
        //                       NUMERALS are set (label/mono). It also backs
        //                       up the text stacks, because font-black (900)
        //                       on Hind Siliguri would otherwise be faked by
        //                       the browser and come out smeared.
        display: ['"Hanken Grotesk"', '"Hind Siliguri"', '"Noto Sans Bengali"', 'SolaimanLipi', 'sans-serif'],
        headline: ['"Hanken Grotesk"', '"Hind Siliguri"', '"Noto Sans Bengali"', 'SolaimanLipi', 'sans-serif'],
        sans: ['"Work Sans"', '"Hind Siliguri"', '"Noto Sans Bengali"', 'SolaimanLipi', 'system-ui', 'sans-serif'],
        body: ['"Work Sans"', '"Hind Siliguri"', '"Noto Sans Bengali"', 'SolaimanLipi', 'sans-serif'],
        // Numerals. `mono` previously ended at `monospace`, which carries no
        // Bengali at all — every Bengali digit on the site was falling all
        // the way through to the browser's last-resort font.
        label: ['"JetBrains Mono"', '"Noto Sans Bengali"', '"Hind Siliguri"', 'ui-monospace', 'monospace'],
        mono: ['"JetBrains Mono"', '"Noto Sans Bengali"', '"Hind Siliguri"', 'ui-monospace', 'monospace'],
        bengali: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'SolaimanLipi', 'sans-serif'],
      },

      // Named steps from the spec. Bengali gets +1.2x line-height via the
      // .bn-text helper in index.css so ascenders/descenders never collide.
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '500' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },

      /* ---------------------------------------------- COLOR */
      colors: {
        /* --- Tonal surface ladder: higher in the stack = brighter --- */
        surface: {
          DEFAULT: v('--surface'),
          dim: v('--surface-dim'),
          bright: v('--surface-bright'),
          lowest: v('--surface-lowest'),
          low: v('--surface-low'),
          container: v('--surface-container'),
          high: v('--surface-container-high'),
          highest: v('--surface-container-highest'),
          variant: v('--surface-variant'),
          card: v('--surface-card'),      // Level 1
          overlay: v('--surface-overlay'), // Level 2
          inverse: v('--inverse-surface'),
        },

        /* --- Text ("on-" roles) --- */
        ink: {
          DEFAULT: v('--ink-body'),
          strong: v('--ink-strong'),
          body: v('--ink-body'),
          muted: v('--ink-muted'),
          faint: v('--ink-faint'),
          inverse: v('--inverse-on-surface'),
        },

        /* --- Ghost outlines: these replace shadows at Level 1 --- */
        line: {
          DEFAULT: v('--outline-variant'),
          soft: v('--outline-variant'),
          strong: v('--outline'),
        },

        /* --- Primary: luminous emerald --- */
        primary: {
          DEFAULT: v('--primary'),
          on: v('--on-primary'),
          container: v('--primary-container'),
          'on-container': v('--on-primary-container'),
          inverse: v('--inverse-primary'),
          fixed: v('--primary-fixed'),
          dim: v('--primary-fixed-dim'),
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ffbbe',
          400: '#4edea3',
          500: '#10b981',
          600: '#059669',
          700: '#006c49',
          800: '#005236',
          900: '#064e3b',
          950: '#002113',
        },

        /* --- Secondary: gold. Achievement, excellence, alerts only. --- */
        secondary: {
          DEFAULT: v('--secondary'),
          on: v('--on-secondary'),
          container: v('--secondary-container'),
          'on-container': v('--on-secondary-container'),
          fixed: v('--secondary-fixed'),
          dim: v('--secondary-fixed-dim'),
          50: '#fffbeb',
          100: '#ffdf9a',
          200: '#ffca45',
          300: '#facc15',
          400: '#f7be1d',
          500: '#e4ae00',
          600: '#ca8a04',
          700: '#5a4300',
          800: '#3f2e00',
          900: '#251a00',
        },

        /* --- Tertiary: teal --- */
        tertiary: {
          DEFAULT: v('--tertiary'),
          on: v('--on-tertiary'),
          container: v('--tertiary-container'),
          'on-container': v('--on-tertiary-container'),
          fixed: v('--tertiary-fixed'),
          dim: v('--tertiary-fixed-dim'),
          50: '#f0fdfa',
          100: '#62fae3',
          200: '#3cddc7',
          300: '#00b7a4',
          400: '#009e8d',
          500: '#008073',
          600: '#005047',
          700: '#00413a',
          800: '#003731',
          900: '#00201c',
        },

        /* --- Error --- */
        error: {
          DEFAULT: v('--error'),
          on: v('--on-error'),
          container: v('--error-container'),
          'on-container': v('--on-error-container'),
        },
      },

      /* ---------------------------------------------- SHAPE */
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',  // buttons, inputs, standard cards
        md: '0.75rem',
        lg: '1rem',         // main content containers
        xl: '1.5rem',       // student profiles / talent spotlights
        full: '9999px',
      },

      /* ---------------------------------------------- 8px RHYTHM */
      spacing: {
        xs: '4px',
        base: '8px',
        sm: '12px',
        md: '24px',
        lg: '48px',
        xl: '80px',
        gutter: '24px',
        'margin-mobile': '16px',
      },
      maxWidth: {
        content: '1280px',
      },

      /* ---------------------------------------------- ELEVATION */
      // Level 1 uses a ghost border, NOT a shadow. Only Level 2 (modals,
      // dropdowns) earns an ambient shadow.
      boxShadow: {
        overlay: '0px 10px 30px rgba(0, 0, 0, 0.5)',
        focus: '0 0 0 2px rgb(var(--primary) / 0.6)',
        none: 'none',
      },

      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-down': { '0%': { opacity: '0', transform: 'translateY(-8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        gradient: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        // Indeterminate route-loading bar: a sliver crossing the viewport.
        'route-bar': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(400%)' } },
        'skeleton-sweep': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out',
        'fade-in-down': 'fade-in-down 0.25s ease-out',
        gradient: 'gradient 3s ease infinite',
        pulse: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'route-bar': 'route-bar 1.1s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        'skeleton-sweep': 'skeleton-sweep 1.6s cubic-bezier(0.22, 1, 0.36, 1) infinite',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
        emphasized: 'cubic-bezier(0.16, 1, 0.3, 1)',
        exit: 'cubic-bezier(0.4, 0, 1, 1)',
      },
      backgroundSize: { '200%': '200% 200%' },
    },
  },
  plugins: [],
}
