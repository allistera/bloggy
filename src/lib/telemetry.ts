import * as Sentry from '@sentry/astro';

/** Record a page view (logs + metrics). Safe when Sentry is disabled. */
export function trackPageView(path = window.location.pathname): void {
  const attributes = { path };

  Sentry.logger.info('Page view', attributes);
  Sentry.metrics.count('page.view', 1, { attributes });
}

/** Record a named UI / product event. */
export function trackEvent(
  name: string,
  attributes: Record<string, string | number | boolean> = {},
): void {
  Sentry.logger.info(name, attributes);
  Sentry.metrics.count(name, 1, { attributes });
}

/** Wire HTMX lifecycle events into Sentry logs + metrics. */
export function instrumentHtmx(): void {
  const body = document.body;
  if (!body || body.dataset.sentryHtmx === '1') return;
  body.dataset.sentryHtmx = '1';

  body.addEventListener('htmx:afterRequest', ((event: CustomEvent) => {
    const detail = event.detail ?? {};
    const path =
      detail.pathInfo?.requestPath ||
      detail.requestConfig?.path ||
      detail.xhr?.responseURL ||
      'unknown';
    const status = detail.xhr?.status ?? 0;
    const ok = Boolean(detail.successful);

    Sentry.logger.info('HTMX request completed', {
      path,
      status,
      ok,
    });
    Sentry.metrics.count('htmx.request', 1, {
      attributes: {
        path: String(path),
        status: String(status),
        ok: String(ok),
      },
    });
  }) as EventListener);

  body.addEventListener('htmx:responseError', ((event: CustomEvent) => {
    const detail = event.detail ?? {};
    const path = detail.pathInfo?.requestPath || 'unknown';
    const status = detail.xhr?.status ?? 0;

    Sentry.logger.error('HTMX request failed', { path, status });
    Sentry.metrics.count('htmx.request.error', 1, {
      attributes: { path: String(path), status: String(status) },
    });
  }) as EventListener);
}
