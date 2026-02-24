/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        // Sunset palette tokens
        'sunset-gold': 'var(--sunset-gold)',
        'sunset-orange': 'var(--sunset-orange)',
        'sunset-pink': 'var(--sunset-pink)',
        'sunset-purple': 'var(--sunset-purple)',
        'dusk-bg': 'var(--dusk-bg)',
        'dusk-mid': 'var(--dusk-mid)',
        'dusk-deep': 'var(--dusk-deep)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        sans: ['Rajdhani', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'sunset': '0 0 20px oklch(0.72 0.18 55 / 0.4), 0 0 40px oklch(0.65 0.22 40 / 0.2)',
        'sunset-sm': '0 0 10px oklch(0.72 0.18 55 / 0.35), 0 0 20px oklch(0.65 0.22 40 / 0.15)',
        'sunset-pink': '0 0 20px oklch(0.60 0.22 350 / 0.4), 0 0 40px oklch(0.60 0.22 350 / 0.2)',
        'sunset-purple': '0 0 20px oklch(0.45 0.18 295 / 0.5), 0 0 40px oklch(0.45 0.18 295 / 0.25)',
        'neon': '0 0 20px oklch(0.72 0.18 55 / 0.4), 0 0 40px oklch(0.65 0.22 40 / 0.2)',
        'neon-sm': '0 0 10px oklch(0.72 0.18 55 / 0.35), 0 0 20px oklch(0.65 0.22 40 / 0.15)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 10px oklch(0.72 0.18 55 / 0.3), 0 0 20px oklch(0.65 0.22 40 / 0.15)',
          },
          '50%': {
            boxShadow: '0 0 25px oklch(0.72 0.18 55 / 0.6), 0 0 50px oklch(0.65 0.22 40 / 0.3)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
