module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a', // green-600
        'primary-dark': '#15803d', // green-700
        accent: '#facc15', // yellow-400
        'accent-dark': '#eab308', // yellow-500
        'text-main': '#1e3a8a', // blue-900
        'text-muted': '#9ca3af', // gray-400
        'text-muted-dark': '#6b7280', // gray-500
        'bg-light': '#f5f5f4', // warm-gray-100
        'bg-dark': '#1f2937', // gray-800
      },
    },
  },
  plugins: [],
}