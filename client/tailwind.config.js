/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-hover': '#4338CA',
        surface: '#FAFAF9',
        'surface-alt': '#F5F5F4',
        border: '#E7E5E4',
        'text-primary': '#1C1917',
        'text-secondary': '#78716C',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        'priority-low': '#64748B',
        'priority-medium': '#D97706',
        'priority-high': '#E11D48',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
      boxShadow: {
        sm: '0 1px 0 rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
