/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
