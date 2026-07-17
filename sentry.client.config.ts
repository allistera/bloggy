import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // Capture 100% of transactions in non-prod; dial down in production if volume grows
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Structured logs + application metrics
  enableLogs: true,
  enableMetrics: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    // Forward console.log / warn / error into Sentry Logs
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
  ],
  // No-op when DSN is unset (local dev without .env)
  enabled: Boolean(import.meta.env.PUBLIC_SENTRY_DSN),
});
