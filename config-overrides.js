const webpack = require('webpack');
const { override, overrideDevServer } = require('customize-cra');

module.exports = {
  webpack: override(
    (config) => {
      if (config.resolve && config.resolve.fallback) {
        delete config.resolve.fallback.buffer;
      }
      return config;
    },
    (config) => {
      if (config.plugins) {
        config.plugins = config.plugins.filter(plugin => !(plugin instanceof webpack.ProvidePlugin));
      }
      return config;
    },
    (config) => {
      config.resolve.fallback = {
        buffer: require.resolve('buffer'),
        ...config.resolve.fallback,
      };
      config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ];
      return config;
    }
  ),
  devServer: overrideDevServer(
    (config) => {
      config.client = config.client || {};
      config.client.overlay = false;
      return config;
    }
  )
};
