import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        core: '#ff80b5',
        thought: '#7cd4ff',
        bucket_list: '#ffd700',
        trip: '#9aff95',
        milestone: '#ffae42',
        inside_joke: '#c084fc',
        celebration: '#ffdd95',
        heartbreak_repair: '#fb7185',
        anniversary: '#f97316',
        secret: '#9ca3af'
      },
      boxShadow: {
        'soft': '0 10px 25px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset'
      }
    },
  },
  plugins: [],
}
export default config

