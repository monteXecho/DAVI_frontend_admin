/** @type {import('next').NextConfig} */
const nextConfig = {

  webpack(config) {
    // Support for importing SVGs as React components
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // Support for loading PDF.js worker files
    config.module.rules.push({
      test: /pdf\.worker(\.min)?\.js$/,
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[hash].[ext]',
          publicPath: '/_next/static/pdfjs/',
          outputPath: 'static/pdfjs/',
        },
      },
    });

    return config;
  },
};

module.exports = nextConfig;
