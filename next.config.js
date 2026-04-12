/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['playwright-core', '@sparticuz/chromium'],
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.crisp.chat https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://client.crisp.chat https://unpkg.com; img-src 'self' data: blob: https://*.supabase.co https://client.crisp.chat https://*.tile.openstreetmap.org https://unpkg.com https://img.yad2.co.il https://*.scontent.xx.fbcdn.net; font-src 'self' https://client.crisp.chat; connect-src 'self' https://*.supabase.co https://wss.crisp.chat https://client.crisp.chat https://api.anthropic.com https://va.vercel-scripts.com https://nominatim.openstreetmap.org; frame-src 'self' https://js.stripe.com https://game.crisp.chat; frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

const sentryOptions = {
  silent: true,
  disableLogger: true,
  hideSourceMaps: true,
  automaticVercelMonitors: false,
};

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? require('@sentry/nextjs').withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
