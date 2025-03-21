module.exports = {
  babel: {
    plugins: [
      'relay'
    ]
  },
  webpack: {
    configure: {
      resolve: {
        preferRelative: true
      }
    }
  }
}; 