const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');


module.exports = {
  entry: {
    'farmos_land_drawing_tool': {
      'import': `${__dirname}/src/main.js`,
    },
  },
  output: {
    path: `${__dirname}/farmos_land_drawing_tool/js`,
    filename: '[name].js',
  },
  optimization: {
    splitChunks: {
      // Setting this to 1MB rather than the default of 50KB to avoid
      // Random vendor chunks being generated
      enforceSizeThreshold: 1024 * 1024,
    },
  },
  performance: {
    hints: false,
  },
  devServer: {
    proxy: {
      context: () => true,
      target: 'http://localhost:80',
      bypass: function (req, res, proxyOptions) {
        if (req.path.indexOf('modules/farmos_land_drawing_tool/js/farmos_land_drawing_tool.js') !== -1) {
          return '/farmos_land_drawing_tool.js';
        }
        if (req.path.indexOf('.hot-update.js') !== -1) {
          return '/' + req.path.split('/').pop();
        }
      },
    },
  },
  module: {
    rules: [
      { test: /\.vue$/, use: 'vue-loader' },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
};
