import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		fontFamily: {
			display: ["var(--font-display)", "system-ui", "sans-serif"],
			body: ["var(--font-body)", "system-ui", "sans-serif"],
			mono: ["var(--font-mono)", "ui-monospace", "monospace"],
			script: ["var(--font-script)", "cursive"],
		},
		animation: {
			'spin-slow': 'spin 3s linear infinite',
		},
  		colors: {
  			canvas: {
  				DEFAULT: "var(--canvas)",
  				elevated: "var(--canvas-elevated)",
  			},
  			ink: {
  				DEFAULT: "var(--ink)",
  				muted: "var(--ink-muted)",
  			},
  			signal: "var(--signal)",
  			slateGray: 'var(--slate-gray)',
  			steelGray: 'var(--steel-gray)',
  			gunmetal: 'var(--gunmetal)',
  			lightGray: 'var(--light-gray)',
  			softGray: 'var(--soft-gray)',
  			charcoal: 'var(--charcoal)',
  			offWhite: 'var(--off-white)',
  			pureWhite: 'var(--pure-white)',
  			vibrantOrange: 'var(--vibrant-orange)',
  			white: 'var(--white)',
  			black: 'var(--black)',
  			ashGray: 'var(--ash-gray)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
} satisfies Config;
