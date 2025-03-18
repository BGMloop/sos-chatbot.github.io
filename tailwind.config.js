/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cream: "#FAF7F0",
        parchment: "#F5F1E4",
        bookgray: "#3A3A3A",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "lightning-dissipate": {
          "0%": { opacity: 0.9, height: "0%" },
          "5%": { opacity: 1, height: "15%" },
          "20%": { opacity: 0.8, height: "40%" },
          "50%": { opacity: 0.6, height: "70%" },
          "80%": { opacity: 0.4, height: "90%" },
          "100%": { opacity: 0, height: "100%" }
        },
        "lightning-flicker": {
          "0%": { opacity: 1, strokeWidth: "3" },
          "20%": { opacity: 0.8, strokeWidth: "2.5" },
          "40%": { opacity: 0.9, strokeWidth: "3.5" },
          "60%": { opacity: 0.7, strokeWidth: "2" },
          "80%": { opacity: 1, strokeWidth: "3" },
          "100%": { opacity: 0.6, strokeWidth: "2.5" }
        },
        "lightning-flicker-fast": {
          "0%": { opacity: 0.8, strokeWidth: "2" },
          "15%": { opacity: 1, strokeWidth: "2.5" },
          "30%": { opacity: 0.6, strokeWidth: "1.5" },
          "45%": { opacity: 0.9, strokeWidth: "2" },
          "60%": { opacity: 0.7, strokeWidth: "1" },
          "75%": { opacity: 1, strokeWidth: "2.5" },
          "100%": { opacity: 0.5, strokeWidth: "1.5" }
        },
        "lightning-impact": {
          "0%": { opacity: 0, transform: "scale(0)" },
          "20%": { opacity: 0.8, transform: "scale(0.5)" },
          "40%": { opacity: 0.6, transform: "scale(0.8)" },
          "60%": { opacity: 0.4, transform: "scale(1.1)" },
          "100%": { opacity: 0, transform: "scale(1.3)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "lightning-dissipate": "lightning-dissipate 1.5s forwards ease-in",
        "lightning-flicker": "lightning-flicker 0.8s forwards linear",
        "lightning-flicker-fast": "lightning-flicker-fast 0.5s forwards linear",
        "lightning-impact": "lightning-impact 1s forwards ease-out"
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      utilities: {
        '.page-break-before': {
          'page-break-before': 'always'
        },
        '.hanging-indent': {
          'text-indent': '-1.5em',
          'padding-left': '1.5em'
        },
        '.first-letter-drop': {
          '&:first-letter': {
            'float': 'left',
            'font-size': '4rem',
            'line-height': '1',
            'margin-right': '0.25rem',
            'font-family': 'serif'
          }
        },
        '.verse-format': {
          'padding-left': '2rem',
          'padding-right': '2rem',
          'font-style': 'italic'
        },
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontFamily: 'Georgia, serif',
            },
            h2: {
              fontFamily: 'Georgia, serif',
            },
            blockquote: {
              fontStyle: 'italic',
              borderLeftWidth: '4px',
              borderLeftColor: '#e5e7eb',
              paddingLeft: '1rem',
            },
            'blockquote p:first-of-type::before': {
              content: 'none',
            },
            'blockquote p:last-of-type::after': {
              content: 'none',
            },
          },
        },
      },
      textStyles: {
        book: {
          fontFamily: 'Georgia, Times New Roman, serif',
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
} 