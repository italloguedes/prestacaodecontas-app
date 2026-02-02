/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#8b5cf6',
                    dark: '#7c3aed',
                    light: '#a78bfa',
                },
                secondary: {
                    DEFAULT: '#06b6d4',
                    dark: '#0891b2',
                    light: '#22d3ee',
                },
                accent: {
                    DEFAULT: '#f472b6',
                    dark: '#ec4899',
                    light: '#f9a8d4',
                },
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.08)',
                    border: 'rgba(255, 255, 255, 0.12)',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'mesh': 'meshMove 20s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateX(-10px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
                'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
                'glow-lg': '0 0 40px rgba(139, 92, 246, 0.5)',
            },
        },
    },
    plugins: [],
}
