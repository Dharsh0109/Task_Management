/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-hover': '#4338CA',
        surface: '#FCFAF8',
        'surface-alt': '#F5F1EB',
        border: '#E7E2D9',
        'text-primary': '#1E1B18',
        'text-secondary': '#6B7280',
        success: '#2F7D4F',
        warning: '#C3841A',
        danger: '#C2410C',
        'priority-low': '#64748B',
        'priority-medium': '#B7791F',
        'priority-high': '#BE123C',
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
        sm: '0 1px 0 rgba(30, 27, 24, 0.05)',
      },
    },
  },
  plugins: [],
};
