module.exports = {
  dependencies: {
    '@nozbe/simdjson': {
      platforms: {
        ios: {
          podspecPath: './node_modules/@nozbe/simdjson/simdjson.podspec',
        },
        android: null, // No Android native code
      },
    },
  },
};
