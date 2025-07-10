const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          // Existing polyfills
          process: require.resolve('process/browser'),
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify/browser'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          buffer: require.resolve('buffer/'),
          
          // Adding missing polyfills from the error messages
          querystring: require.resolve('querystring-es3'),
          timers: require.resolve('timers-browserify'),
          vm: require.resolve('vm-browserify'),
          
          // Other common Node.js polyfills that might be needed
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          assert: require.resolve('assert'),
          url: require.resolve('url'),
          zlib: require.resolve('browserify-zlib'),
          
          // Modules to disable
          fs: false,
          net: false,
          tls: false,
        },
      },
      plugins: [
        // Add Buffer and process polyfills
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ],
    },
  },
};
