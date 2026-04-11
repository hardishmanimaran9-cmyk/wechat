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
          dark: '#0b141a',      // Main background (dark)
          darker: '#060d11',    // Darker panels
          sidebar: '#111b21',   // Sidebar background
          chat: '#0b141a',      // Chat area background
          input: '#1e2a30',     // Input field background
          hover: '#182229',     // Hover states
          border: '#2a3942',    // Border color
          green: '#00a884',     // Primary green (WhatsApp-like)
          greenLight: '#05d398',// Lighter green for hover
          greenDark: '#008f72', // Darker green
          bubble: '#005c4b',    // Sent message bubble
          bubbleIn: '#1e2a30',  // Received message bubble
          text: '#e9edef',      // Primary text
          textSec: '#8696a0',   // Secondary text
          icon: '#aebac1',      // Icon color
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
