/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 민트/그린 톤 — 아기자기하고 친근한 느낌의 메인 팔레트
        brand: {
          50: '#f0faf3',
          100: '#dcf3e3',
          200: '#b8e6c8',
          300: '#8ad4a6',
          400: '#5cbd84',
          500: '#3aa568',
          600: '#2c8853',
          700: '#256e45',
          800: '#20583a',
          900: '#1b4830',
        },
        // 따뜻한 크림/베이지 배경 톤
        paper: {
          50: '#fdfbf5',
          100: '#faf6ea',
          200: '#f3ecd8',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
