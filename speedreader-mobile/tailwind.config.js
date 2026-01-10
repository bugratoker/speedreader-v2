/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Deep Nebula Palette
                background: '#000000',
                surface: {
                    DEFAULT: '#0A0A0A',
                    elevated: '#141414',
                    overlay: 'rgba(20, 20, 20, 0.8)',
                },
                primary: {
                    DEFAULT: '#00FFFF',
                    dim: 'rgba(0, 255, 255, 0.6)',
                    glow: 'rgba(0, 255, 255, 0.2)',
                },
                secondary: {
                    DEFAULT: '#8A2BE2',
                    dim: 'rgba(138, 43, 226, 0.6)',
                    glow: 'rgba(138, 43, 226, 0.2)',
                },
                text: {
                    DEFAULT: '#FFFFFF',
                    muted: '#A0A0A0',
                    dim: '#666666',
                },
                glass: {
                    border: 'rgba(255, 255, 255, 0.1)',
                    fill: 'rgba(255, 255, 255, 0.05)',
                },
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
            },
            fontFamily: {
                ui: ['Inter'],
                reading: ['PlayfairDisplay'],
            },
            fontSize: {
                'reading-sm': ['16px', { lineHeight: '1.8' }],
                'reading-md': ['20px', { lineHeight: '1.8' }],
                'reading-lg': ['24px', { lineHeight: '1.8' }],
                'reading-xl': ['28px', { lineHeight: '1.8' }],
            },
            borderRadius: {
                'bento': '24px',
                'bento-sm': '16px',
            },
            spacing: {
                'bento': '16px',
                'bento-lg': '24px',
            },
        },
    },
    plugins: [],
};
