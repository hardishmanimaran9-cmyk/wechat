/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Chatwe color palette
        chatwe: {
          dark: '#020617',      // Deep slate background
          darker: '#000000',    // True black for deep shadows
          sidebar: '#0f172a',   // Slate sidebar
          chat: '#020617',      // Main chat background
          input: 'rgba(255, 255, 255, 0.05)', // Translucent glass input
          hover: 'rgba(139, 92, 246, 0.1)',  // Violet hover glow
          border: 'rgba(255, 255, 255, 0.1)', // Subtle glass border
          green: '#8b5cf6',     // Primary accent (Violet)
          greenLight: '#f472b6',// Secondary accent (Pink)
          greenDark: '#7c3aed', // Darker violet
          bubble: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', // Gradient bubbles
          bubbleIn: 'rgba(255, 255, 255, 0.08)', // Glassy received bubble
          text: '#f8fafc',      // Bright slate text
          textSec: '#94a3b8',   // Muted slate text
          icon: '#cbd5e1',      // Slate icon color
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
