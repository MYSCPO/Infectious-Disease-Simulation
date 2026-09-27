/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 메디컬 틸(Teal) - 보건·의료의 전문성과 청결함, 신뢰를 주는 메인 컬러
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // 딥 블루(Deep Navy / Blue) - 위기대응 컨트롤타워의 안정감과 신뢰도
        navy: {
          50: '#f0f4f9',
          100: '#dee7f2',
          200: '#bed1e6',
          300: '#91b3d5',
          400: '#5e90c0',
          500: '#3c74ab',
          600: '#2e5c8e',
          700: '#264a73',
          800: '#1b3350',
          900: '#0f2035',
          950: '#091321',
        },
        // 메디컬 클린 페이퍼 배경 톤 (은은한 틸-슬레이트 틴트의 고급스러운 오프화이트)
        paper: {
          50: '#f8fbfb',
          100: '#f1f6f7',
          200: '#e5edef',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'Noto Sans KR',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card-focus': '0 20px 40px -15px rgba(13, 148, 136, 0.15), 0 0 0 1px rgba(13, 148, 136, 0.08)',
        'hero-glow': '0 25px 50px -12px rgba(15, 32, 53, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
