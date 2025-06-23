import type { Config } from 'tailwindcss'
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        mono: ["Source Code Pro", ...fontFamily.mono],
      },
      colors: {
        // Opulentia Design Language Colors
        background: "var(--odl-background)",
        foreground: "var(--odl-text)",
        card: {
          DEFAULT: "var(--odl-card)",
          foreground: "var(--odl-text)",
        },
        primary: {
          DEFAULT: "var(--odl-button)",
          foreground: "var(--odl-text)",
        },
        secondary: {
          DEFAULT: "hsl(243.4, 72.1%, 56.5%)",
          foreground: "var(--odl-text)",
        },
        accent: {
          DEFAULT: "var(--odl-accent)",
          foreground: "var(--odl-background)",
        },
        muted: {
          DEFAULT: "var(--odl-card)",
          foreground: "var(--odl-sub-text)",
        },
        border: "var(--odl-border)",
        input: "var(--odl-button)",
        ring: "var(--odl-accent)",
        
        // Additional Opulentia Colors
        "odl-text": "var(--odl-text)",
        "odl-sub": "var(--odl-sub-text)",
        "odl-danger": "var(--odl-danger)",
        "odl-mint": "var(--odl-mint-bg)",
        
        // Chart Colors
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      spacing: {
        "odl-1": "var(--space-1)",
        "odl-2": "var(--space-2)",
        "odl-3": "var(--space-3)",
        "odl-4": "var(--space-4)",
        "odl-6": "var(--space-6)",
        "odl-8": "var(--space-8)",
      },
      fontSize: {
        "hero": ["clamp(3rem, 8vw, 5rem)", { lineHeight: "1", letterSpacing: "0" }],
        "h1": ["2.25rem", { lineHeight: "1.2", letterSpacing: "0" }],
        "h2": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0.02em" }],
        "caption": ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.04em" }],
      },
      boxShadow: {
        "sm": "var(--shadow-sm)",
        "md": "var(--shadow-md)",
        "lg": "var(--shadow-lg)",
        "glow": "var(--shadow-glow)",
        "quantum": "0 0 40px rgba(255, 170, 110, 0.3), 0 0 80px rgba(255, 170, 110, 0.1)",
      },
      animation: {
        "quantum-pulse": "quantum-pulse 3s ease-in-out infinite",
        "kinesthetic-flow": "kinesthetic-flow 3s linear infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "quantum-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        "kinesthetic-flow": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(255, 170, 110, 0.3)",
          },
          "50%": { 
            boxShadow: "0 0 40px rgba(255, 170, 110, 0.6), 0 0 80px rgba(255, 170, 110, 0.3)",
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "100% 100%" },
        },
      },
      transitionTimingFunction: {
        "micro": "cubic-bezier(0, 0, 0.2, 1)",
        "macro": "cubic-bezier(0.33, 1, 0.68, 1)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}

export default config