/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Beautiful Girly Palette - Pink, Purple, Gold, Lavender
        'rose': '#ff6b9d',
        'pink': '#ffc1e0',
        'lavender': '#d4a5d4',
        'purple': '#9b7ede',
        'deep-purple': '#6b4ba6',
        'gold': '#ffd700',
        'soft-gold': '#ffe8a8',
        'cream': '#fff8f0',
        'soft-white': '#fef9f5',
        
        // Cozy bedroom palette
        'bedroom-bg': '#1a0f1e',
        'bedroom-dark': '#2d1b3d',
        'bedroom-soft': '#4a2f5c',
        'midnight-blue': '#1e2a4a',
        'warm-amber': '#ffb866',
        'lamp-glow': '#ffd699',
        'soft-pink': '#ff9eb7',
        'plum': '#845ec2',
        'sunset-orange': '#ff8066',
        'twilight-purple': '#4b3f72',
        
        // UI elements
        'panel-glass': 'rgba(26, 15, 30, 0.7)',
        'panel-border': 'rgba(255, 193, 224, 0.2)',
        'text-primary': '#fef9f5',
        'text-secondary': 'rgba(255, 248, 240, 0.7)',
        
        // Legacy colors (keep for compatibility)
        'warm-ivory': '#FFF8F0',
        'deep-burgundy': '#6B2737',
        'soft-rose': '#E8B4B8',
        'muted-blush': '#F5D5D8',
        'warm-charcoal': '#3A3238',
        'gold-accent': '#D4AF37',
      },
      fontFamily: {
        'playfair': ['var(--font-playfair)', 'Georgia', 'serif'],
        'poppins': ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        'dancing': ['var(--font-dancing)', 'cursive'],
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
