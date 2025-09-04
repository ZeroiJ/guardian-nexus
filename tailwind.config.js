/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", /* primary-blue-20 */
        input: "var(--color-input)", /* elevated-dark-blue-gray */
        ring: "var(--color-ring)", /* primary-blue */
        background: "var(--color-background)", /* deep-space-black */
        foreground: "var(--color-foreground)", /* light-gray */
        primary: {
          DEFAULT: "var(--color-primary)", /* destiny-blue */
          foreground: "var(--color-primary-foreground)", /* white */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* tactical-orange */
          foreground: "var(--color-secondary-foreground)", /* white */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* error-red */
          foreground: "var(--color-destructive-foreground)", /* white */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* elevated-dark-blue-gray */
          foreground: "var(--color-muted-foreground)", /* muted-gray */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* legendary-purple */
          foreground: "var(--color-accent-foreground)", /* white */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* elevated-dark-blue-gray */
          foreground: "var(--color-popover-foreground)", /* light-gray */
        },
        card: {
          DEFAULT: "var(--color-card)", /* elevated-dark-blue-gray */
          foreground: "var(--color-card-foreground)", /* light-gray */
        },
        success: {
          DEFAULT: "var(--color-success)", /* vibrant-green */
          foreground: "var(--color-success-foreground)", /* white */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* attention-amber */
          foreground: "var(--color-warning-foreground)", /* black */
        },
        error: {
          DEFAULT: "var(--color-error)", /* error-red */
          foreground: "var(--color-error-foreground)", /* white */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'body': ['Source Sans Pro', 'sans-serif'],
        'caption': ['Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            opacity: "1",
            boxShadow: "0 0 8px rgba(74, 144, 226, 0.3)"
          },
          "50%": { 
            opacity: "0.8",
            boxShadow: "0 0 16px rgba(74, 144, 226, 0.5)"
          },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 1.5s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
        "slide-out-right": "slide-out-right 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
      boxShadow: {
        'tactical': '0 2px 8px rgba(74, 144, 226, 0.15)',
        'tactical-lg': '0 4px 16px rgba(74, 144, 226, 0.2)',
        'glow': '0 0 8px rgba(74, 144, 226, 0.3)',
        'glow-lg': '0 0 16px rgba(74, 144, 226, 0.4)',
      },
      transitionTimingFunction: {
        'tactical': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}