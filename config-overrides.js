const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const webpack = require('webpack');
const { override, overrideDevServer } = require('customize-cra');

module.exports = {
  webpack: override(
    (config, webpackEnv) => {
      console.log('overriding webpack config...');

      const isEnvDevelopment = webpackEnv === 'development';
      const isEnvProduction = webpackEnv === 'production';
      const loaders = config.module.rules[1].oneOf;

      loaders.splice(loaders.length - 1, 0, {
        test: /\.(js|mjs|cjs)$/,
        exclude: /@babel(?:\/|\\{1,2})runtime/,
        loader: require.resolve('babel-loader'),
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [
            [
              require.resolve('babel-preset-react-app/dependencies'),
              { helpers: true },
            ],
          ],
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,
          // @remove-on-eject-begin
          cacheIdentifier: getCacheIdentifier(
            isEnvProduction
              ? 'production'
              : isEnvDevelopment && 'development',
            [
              'babel-plugin-named-asset-import',
              'babel-preset-react-app',
              'react-dev-utils',
              'react-scripts',
            ]
          ),
          // @remove-on-eject-end
          // Babel sourcemaps are needed for debugging into node_modules
          // code.  Without the options below, debuggers like VSCode
          // show incorrect code and set breakpoints on the wrong lines.
          sourceMaps: shouldUseSourceMap,
          inputSourceMap: shouldUseSourceMap,
        },
      });

      if (config.resolve && config.resolve.fallback) {
        delete config.resolve.fallback.buffer;
      }

      if (config.plugins) {
        config.plugins = config.plugins.filter(plugin => !(plugin instanceof webpack.ProvidePlugin));
      }

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
