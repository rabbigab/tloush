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
  async redirects() {
    // Redirections 308 permanentes (equivalent moderne du 301, preserve
    // la methode HTTP). Chantier 1 P1 : anciennes routes legacy renommees
    // vers le hub unique /aides (multi-onglets).
    return [
      {
        source: '/rights-detector',
        destination: '/aides',
        permanent: true,
      },
      {
        source: '/rights-check',
        destination: '/aides?tab=travail',
        permanent: true,
      },
      // /droits-olim (legacy) et /droits/olim (PR #2B) sont desormais
      // tous deux rediriges vers /aides/olim (consolidation /aides).
      {
        source: '/droits-olim',
        destination: '/aides/olim',
        permanent: true,
      },
      {
        source: '/droits/olim',
        destination: '/aides/olim',
        permanent: true,
      },
      // Chantier 1 P1 (PR #2C) : harmonisation des annuaires.
      // /annuaire/<categorie-artisan> -> /annuaire/artisans/<categorie>
      // La liste est reduite aux slugs existants pour eviter de rediriger
      // /annuaire/professionnels ou /annuaire/inscription.
      {
        source: '/annuaire/:category(plombier|electricien|peintre|serrurier|climatisation|bricoleur)',
        destination: '/annuaire/artisans/:category',
        permanent: true,
      },
      {
        source: '/annuaire/:category(plombier|electricien|peintre|serrurier|climatisation|bricoleur)/:slug',
        destination: '/annuaire/artisans/:category/:slug',
        permanent: true,
      },
      {
        source: '/annuaire/inscription',
        destination: '/annuaire/artisans/inscription',
        permanent: true,
      },
      {
        source: '/annuaire/avis/:path*',
        destination: '/annuaire/artisans/avis/:path*',
        permanent: true,
      },
      // /experts -> /annuaire/professionnels (public landing + waitlist)
      {
        source: '/experts',
        destination: '/annuaire/professionnels',
        permanent: true,
      },
      {
        source: '/experts/rejoindre',
        destination: '/annuaire/professionnels/rejoindre',
        permanent: true,
      },
      // Consolidation autour de /aides : 3 routes fusionnees.
      {
        source: '/bituach-leumi',
        destination: '/aides',
        permanent: true,
      },
      {
        source: '/tax-refund',
        destination: '/aides/tax-refund',
        permanent: true,
      },
      // Standardisation des slugs anglais vers le francais (P2).
      // /inbox supprime (etait deja un redirect vers /dashboard).
      {
        source: '/inbox',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/folders',
        destination: '/mes-documents',
        permanent: true,
      },
      {
        source: '/folders/:path*',
        destination: '/mes-documents/:path*',
        permanent: true,
      },
      {
        source: '/search',
        destination: '/recherche',
        permanent: true,
      },
      {
        source: '/referral',
        destination: '/parrainage',
        permanent: true,
      },
      {
        source: '/assistant',
        destination: '/assistant-ia',
        permanent: true,
      },
      {
        source: '/assistant/:path*',
        destination: '/assistant-ia/:path*',
        permanent: true,
      },
      {
        source: '/bank-import',
        destination: '/import-bancaire',
        permanent: true,
      },
      {
        source: '/compare',
        destination: '/comparer-fiches',
        permanent: true,
      },
      {
        source: '/compare/:path*',
        destination: '/comparer-fiches/:path*',
        permanent: true,
      },
    ];
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
          {
            key: 'Content-Security-Policy',
            // 'unsafe-eval' removed in production (only kept in dev for HMR)
            value: process.env.NODE_ENV === 'development'
              ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.crisp.chat https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://client.crisp.chat https://unpkg.com; img-src 'self' data: blob: https://*.supabase.co https://client.crisp.chat https://*.tile.openstreetmap.org https://unpkg.com https://img.yad2.co.il https://*.scontent.xx.fbcdn.net; font-src 'self' https://client.crisp.chat; connect-src 'self' https://*.supabase.co https://wss.crisp.chat https://client.crisp.chat https://api.anthropic.com https://va.vercel-scripts.com https://nominatim.openstreetmap.org; frame-src 'self' https://js.stripe.com https://game.crisp.chat; frame-ancestors 'none'"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' https://client.crisp.chat https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://client.crisp.chat https://unpkg.com; img-src 'self' data: blob: https://*.supabase.co https://client.crisp.chat https://*.tile.openstreetmap.org https://unpkg.com https://img.yad2.co.il https://*.scontent.xx.fbcdn.net; font-src 'self' https://client.crisp.chat; connect-src 'self' https://*.supabase.co https://wss.crisp.chat https://client.crisp.chat https://api.anthropic.com https://va.vercel-scripts.com https://nominatim.openstreetmap.org; frame-src 'self' https://js.stripe.com https://game.crisp.chat; frame-ancestors 'none'",
          },
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
