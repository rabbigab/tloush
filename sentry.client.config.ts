import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring: sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session replay: capture 1% of sessions, 10% on error (not 100% to limit PII exposure)
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration(),
  ],
})
