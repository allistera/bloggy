const SITE_SUFFIX = ' - Allister Antosik';

/**
 * Keeps the <title> tag within Google's ~60-char SERP cutoff — only appends
 * the site suffix when the base title leaves room for it.
 */
export function pageTitle(
  title: string,
  suffix = SITE_SUFFIX,
  maxLength = 60,
): string {
  return title.length + suffix.length <= maxLength ? `${title}${suffix}` : title;
}
