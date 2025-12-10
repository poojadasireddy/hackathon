export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyber-Medical Palette
        void: '#050511',           // Deepest Background
        surface: '#0F1221',        // Card Background
        plasma: '#FF003C',         // Primary Action / Urgent
        'plasma-glow': '#FF003C80',
        cyan: '#00F0FF',           // Secondary / Info
        'cyan-glow': '#00F0FF80',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        'glass-surface': 'rgba(15, 18, 33, 0.7)',
      },
      boxShadow: {
        'neon-red': '0 0 20px rgba(255, 0, 60, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 240, 255, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'], // Need to import this in CSS
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
