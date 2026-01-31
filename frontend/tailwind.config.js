/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                indigo: {
                    50: '#f5f7ff',
                    100: '#ebf0fe',
                    200: '#ced9fd',
                    300: '#adc0fb',
                    400: '#89a2f7',
                    500: '#637df2',
                    600: '#475ae2',
                    700: '#3846c4',
                    800: '#2e3a9c',
                    900: '#29337e',
                    950: '#181d4a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
