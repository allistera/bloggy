import * as Sentry from '@sentry/astro';

const hasDsn = Boolean(import.meta.env.PUBLIC_SENTRY_DSN);

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // Capture 100% of transactions in non-prod; dial down in production if volume grows
  tracesSampleRate: hasDsn ? (import.meta.env.PROD ? 0.2 : 1.0) : 0,
  replaysSessionSampleRate: hasDsn ? 0.1 : 0,
  replaysOnErrorSampleRate: hasDsn ? 1.0 : 0,
  // Structured logs + application metrics — only when Sentry is active
  enableLogs: hasDsn,
  enableMetrics: hasDsn,
  integrations: hasDsn
    ? [
        Sentry.browserTracingIntegration(),
        // Replay is heavy (~60KB gzipped); only include when DSN is set
        Sentry.replayIntegration(),
        Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      ]
    : [
        // When DSN is absent we ship minimal SDK (no replay, no browser tracing)
        Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      ],
  enabled: hasDsn,
});
