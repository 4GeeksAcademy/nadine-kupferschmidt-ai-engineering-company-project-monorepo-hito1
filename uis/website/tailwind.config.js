/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dónde buscar las clases de Tailwind que usamos
  content: ['./*.html', './*.js'],
  theme: {
    extend: {
      // Paleta oficial de Brasaland (unificada desde index.html)
      colors: {
        brand: {
          ivory: '#FDF8F0',
          beige: '#F5EDE0',
          cream: '#F0E8D8',
          charcoal: '#2A2A2A',
          darkbrown: '#1A1410',
          earth: '#8B7355',
          ochre: '#C9A96E',
          ochredeep: '#8F6000',
          gold: '#B8860B',
          warmgray: '#6B6258',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      // Animación de los pasos del formulario (desde application.html)
      keyframes: {
        stepFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        stepFadeIn: 'stepFadeIn 0.4s ease forwards',
      },
    },
  },
  plugins: [],
};