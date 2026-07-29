/* Tailwind CDN theme config — must load AFTER cdn.tailwindcss.com, BEFORE body renders.
   Colors resolve to CSS custom properties so every utility follows the light/dark theme.
   Use them as normal utilities: bg-surface, text-muted, border-line, text-up, bg-primary. */
tailwind.config = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:        'rgb(var(--c-bg) / <alpha-value>)',
        surface:   'rgb(var(--c-surface) / <alpha-value>)',
        surface2:  'rgb(var(--c-surface2) / <alpha-value>)',
        line:      'rgb(var(--c-line) / <alpha-value>)',
        fg:        'rgb(var(--c-fg) / <alpha-value>)',
        muted:     'rgb(var(--c-muted) / <alpha-value>)',
        primary:   'rgb(var(--c-primary) / <alpha-value>)',
        'primary-fg': 'rgb(var(--c-primary-fg) / <alpha-value>)',
        accent:    'rgb(var(--c-accent) / <alpha-value>)',
        /* Vietnamese price-board semantics — see README */
        up:    'rgb(var(--c-up) / <alpha-value>)',
        down:  'rgb(var(--c-down) / <alpha-value>)',
        ref:   'rgb(var(--c-ref) / <alpha-value>)',
        ceil:  'rgb(var(--c-ceil) / <alpha-value>)',
        floor: 'rgb(var(--c-floor) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      maxWidth: { shell: '1440px' },
      borderRadius: { xl2: '1rem' },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.18)',
        pop:  '0 12px 40px -12px rgb(0 0 0 / 0.35)',
      },
      keyframes: {
        'fade-up':  { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
        'marquee':  { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'blink':    { '0%,100%': { opacity: 1 }, '50%': { opacity: .25 } },
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,.61,.36,1) both',
        'marquee': 'marquee 40s linear infinite',
        'blink':   'blink 1.6s ease-in-out infinite',
      },
    },
  },
};
