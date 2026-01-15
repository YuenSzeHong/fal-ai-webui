// Note: i18n config removed - Next.js 15 App Router doesn't support Pages Router i18n
// Internationalization is now handled via middleware and app directory structure

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fal.ai',
      },
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: '**.fal.media',
      },
    ],
  },
  // 廃止されたページから統合ページへのリダイレクト設定
  async redirects() {
    return [
      {
        source: '/text-to-image',
        destination: '/generate',
        permanent: true,
      },
      {
        source: '/text-to-video',
        destination: '/generate',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 