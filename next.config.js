/** @type {import('next').NextConfig} */

function chatPublicHostnamesForRedirects() {
  const raw =
    process.env.CHAT_PUBLIC_HOSTNAME ||
    process.env.NEXT_PUBLIC_CHAT_PUBLIC_HOSTNAME ||
    'https://chat.daviapp.nl';
  return raw
    .split(',')
    .map((s) =>
      s
        .trim()
        .replace(/^https?:\/\//, '')
        .split('/')[0]
        .split(':')[0]
        .toLowerCase(),
    )
    .filter(Boolean);
}

const nextConfig = {
  async redirects() {
    const chatHosts = [...new Set(chatPublicHostnamesForRedirects())];
    const chatRootRedirects = chatHosts.map((host) => ({
      source: '/',
      has: [{ type: 'host', value: host }],
      destination: '/publicChat',
      permanent: false,
    }));
    return [
      {
        source: '/publicchat',
        destination: '/public-chat-admin',
        permanent: true,
      },
      ...chatRootRedirects,
    ];
  },

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
