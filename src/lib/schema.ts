const SITE = 'https://allisterantosik.com';
const EMAIL = 'hey@allisterantosik.com';

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Allister Antosik',
  url: SITE,
  email: EMAIL,
  jobTitle: 'Lead SRE & AIOps Engineer',
  sameAs: [
    'https://github.com/allistera',
    'https://www.linkedin.com/in/allister-antosik-160433395/',
  ],
  image: `${SITE}/logo.png`,
  description:
    'Lead SRE & AIOps Engineer — automation, reliability, and high-performance systems.',
};

export function blogPostingSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: Date | string;
  tags?: string[];
  image?: string;
}) {
  const date =
    opts.datePublished instanceof Date
      ? opts.datePublished.toISOString()
      : new Date(opts.datePublished).toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    datePublished: date,
    dateModified: date,
    author: {
      '@type': 'Person',
      name: 'Allister Antosik',
      url: SITE,
      email: EMAIL,
    },
    publisher: {
      '@type': 'Person',
      name: 'Allister Antosik',
      url: SITE,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
    ...(opts.image
      ? { image: opts.image.startsWith('http') ? opts.image : `${SITE}${opts.image}` }
      : { image: `${SITE}/og-default.png` }),
    ...(opts.tags?.length ? { keywords: opts.tags.join(', ') } : {}),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Allister Antosik',
    url: SITE,
    description:
      'Lead SRE & AIOps Engineer portfolio and blog — automation, reliability, and high-performance systems.',
    author: personSchema,
  };
}
