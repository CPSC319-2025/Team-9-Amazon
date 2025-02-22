module.exports = {
  extend: {
    animation: {
      'shine': 'shine 4s linear infinite',
    },
    keyframes: {
      shine: {
        '0%': { left: '-100%' },
        '100%': { left: '100%' },
      },
    },
  },
}