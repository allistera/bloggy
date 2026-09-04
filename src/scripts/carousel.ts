interface CarouselItem {
  id?: string;
  title: string;
  description: string;
  images: readonly string[];
  image?: string;
  link?: string;
}

type CarouselTelemetry = Pick<typeof import('@sentry/astro'), 'logger' | 'metrics'>;

const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="%2318181b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ff3333" font-family="monospace" font-size="14">Image Load Failure</text></svg>';

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const responsiveImage = (image: string) => {
  if (!image.startsWith('/screenshots/') || !image.endsWith('.webp')) {
    return { src: image, srcset: '' };
  }

  const base = image.slice(0, -'.webp'.length);
  return {
    src: `${base}-640.webp`,
    srcset: `${base}-640.webp 640w, ${base}-1200.webp 1200w`,
  };
};

const setResponsiveSource = (imageElement: HTMLImageElement, image: string) => {
  const responsive = responsiveImage(image);
  imageElement.src = responsive.src;
  if (responsive.srcset) {
    imageElement.srcset = responsive.srcset;
    imageElement.sizes = '(min-width: 1280px) 576px, (min-width: 768px) calc(50vw - 4rem), calc(100vw - 5rem)';
  } else {
    imageElement.removeAttribute('srcset');
    imageElement.removeAttribute('sizes');
  }
};

export const initCarousel = (container: HTMLElement) => {
  const slidesContainer = container.querySelector<HTMLElement>('#carousel-slides');
  const dotsContainer = container.querySelector<HTMLElement>('#carousel-dots');
  const controls = container.querySelector<HTMLElement>('#carousel-controls');
  const lightbox = document.getElementById('carousel-lightbox');
  const lightboxBackdrop = document.getElementById('carousel-lightbox-backdrop');
  const lightboxClose = document.getElementById('carousel-lightbox-close');
  const lightboxImage = document.getElementById('carousel-lightbox-image') as HTMLImageElement | null;
  const lightboxTitle = document.getElementById('carousel-lightbox-title');
  const lightboxCaption = document.getElementById('carousel-lightbox-caption');
  const lightboxPrev = document.getElementById('carousel-lightbox-prev');
  const lightboxNext = document.getElementById('carousel-lightbox-next');

  if (!slidesContainer || !dotsContainer || !lightbox || !lightboxImage) return;

  const configuredData = JSON.parse(container.dataset.carouselItems || '[]') as CarouselItem[];
  const data = ((window as typeof window & { carouselData?: CarouselItem[] }).carouselData || configuredData);
  if (data.length === 0) return;

  let currentIndex = 0;
  let lightboxProjectIndex = 0;
  let lightboxImageIndex = 0;
  let lightboxOpen = false;

  const getImages = (item: CarouselItem) => item.images?.length ? item.images : item.image ? [item.image] : [];
  const track = (name: string, attributes: Record<string, string | number>) => {
    try {
      const sentry = (window as typeof window & { Sentry?: CarouselTelemetry }).Sentry;
      sentry?.metrics.count(name, 1, { attributes });
      sentry?.logger.info(name, attributes);
    } catch {
      // Telemetry must never break carousel controls.
    }
  };

  const render = () => {
    const isSingle = data.length === 1;
    controls?.classList.toggle('hidden', isSingle);

    slidesContainer.innerHTML = data.map((item, index) => {
      const images = getImages(item);
      const image = images[0] || '';
      const responsive = responsiveImage(image);
      const isMobileDashboard = image.includes('mobile-dashboard');
      const link = item.link?.trim()
        ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="carousel-link inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold font-mono text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400">View Repository</a>`
        : '<span class="carousel-link inline-block px-4 py-2 bg-zinc-900 text-zinc-600 font-mono text-xs rounded opacity-50 cursor-not-allowed border border-zinc-800">No Link Available</span>';

      return `
        <div class="carousel-slide ${index === 0 ? 'active' : 'hidden'} flex flex-col md:flex-row gap-6 items-center w-full" data-index="${index}">
          <div class="w-full md:w-1/2 flex flex-col justify-center">
            <button type="button" class="carousel-image-btn group relative max-w-full rounded border border-zinc-800 bg-zinc-950 p-0 focus:outline-none focus:ring-2 focus:ring-emerald-500" data-project-index="${index}" data-image-index="0" aria-label="Open screenshot: ${escapeHtml(item.title)}">
              <img class="carousel-image max-h-56 w-full rounded object-cover transition group-hover:opacity-90" src="${escapeHtml(responsive.src)}" ${responsive.srcset ? `srcset="${escapeHtml(responsive.srcset)}" sizes="(min-width: 1280px) 576px, (min-width: 768px) calc(50vw - 4rem), calc(100vw - 5rem)"` : ''} alt="${escapeHtml(item.title)} screenshot 1" width="640" height="${isMobileDashboard ? 1391 : 436}" decoding="async" fetchpriority="low" loading="lazy" />
              <span class="pointer-events-none absolute inset-x-0 bottom-0 bg-zinc-950/80 py-1 text-center font-mono text-[10px] text-emerald-400 opacity-0 transition group-hover:opacity-100">Click to expand</span>
            </button>
            <div class="carousel-image-controls mt-3 flex items-center justify-center gap-3 ${images.length > 1 ? '' : 'hidden'}" aria-label="${escapeHtml(item.title)} screenshots">
              <button type="button" class="carousel-image-prev rounded border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500" data-project-index="${index}" aria-label="Previous ${escapeHtml(item.title)} screenshot">&lt; Prev image</button>
              <span class="carousel-image-counter font-mono text-xs text-zinc-500" aria-live="polite">1 / ${images.length}</span>
              <button type="button" class="carousel-image-next rounded border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500" data-project-index="${index}" aria-label="Next ${escapeHtml(item.title)} screenshot">Next image &gt;</button>
            </div>
          </div>
          <div class="w-full md:w-1/2 flex flex-col gap-4">
            <h3 class="carousel-title text-xl font-bold text-zinc-100 font-mono tracking-wide">${escapeHtml(item.title)}</h3>
            <p class="carousel-description text-sm text-zinc-400 leading-relaxed">${escapeHtml(item.description)}</p>
            <div class="pt-2">${link}</div>
          </div>
        </div>`;
    }).join('\n');

    dotsContainer.innerHTML = isSingle ? '' : data.map((_, index) => `
      <button type="button" class="carousel-dot w-3 h-3 rounded-full border border-zinc-700 bg-zinc-900 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${index === 0 ? 'active bg-emerald-400 border-emerald-400' : ''}" data-carousel-dot="${index}" aria-label="Go to slide ${index + 1}"></button>
    `).join('\n');
  };

  const goToSlide = (index: number) => {
    const slides = slidesContainer.querySelectorAll<HTMLElement>('.carousel-slide');
    const dots = dotsContainer.querySelectorAll<HTMLElement>('.carousel-dot');
    slides.forEach((slide) => {
      slide.classList.remove('active');
      slide.classList.add('hidden');
    });
    dots.forEach((dot) => dot.classList.remove('active', 'bg-emerald-400', 'border-emerald-400'));

    currentIndex = (index + data.length) % data.length;
    const activeSlide = slides[currentIndex];
    activeSlide?.classList.remove('hidden');
    activeSlide?.classList.add('active');
    dots[currentIndex]?.classList.add('active', 'bg-emerald-400', 'border-emerald-400');
  };

  const openLightbox = (projectIndex: number, imageIndex = 0) => {
    lightboxProjectIndex = (projectIndex + data.length) % data.length;
    const item = data[lightboxProjectIndex];
    if (!item) return;
    const images = getImages(item);
    if (images.length === 0) return;
    lightboxImageIndex = (imageIndex + images.length) % images.length;
    const image = images[lightboxImageIndex];
    if (!image) return;
    lightboxImage.src = image;
    lightboxImage.alt = `${item.title} screenshot ${lightboxImageIndex + 1}`;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCaption) lightboxCaption.textContent = `${lightboxImageIndex + 1} of ${images.length} - ${item.description || ''}`;
    if (lightboxPrev) lightboxPrev.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    if (lightboxNext) lightboxNext.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxOpen = true;
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
    track('carousel.lightbox.open', { id: item.id || String(lightboxProjectIndex), image: lightboxImageIndex + 1 });
  };

  const closeLightbox = () => {
    if (!lightboxOpen) return;
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxOpen = false;
    document.body.style.overflow = '';
    lightboxImage.removeAttribute('src');
    track('carousel.lightbox.close', {});
  };

  const stepLightbox = (delta: number) => {
    const item = data[lightboxProjectIndex];
    if (!item) return;
    const images = getImages(item);
    if (images.length > 1) openLightbox(lightboxProjectIndex, lightboxImageIndex + delta);
  };

  const changeProjectImage = (projectIndex: number, delta: number) => {
    const item = data[projectIndex];
    if (!item) return;
    const images = getImages(item);
    if (images.length <= 1) return;
    const slide = slidesContainer.querySelector<HTMLElement>(`.carousel-slide[data-index="${projectIndex}"]`);
    const imageElement = slide?.querySelector<HTMLImageElement>('.carousel-image');
    const imageButton = slide?.querySelector<HTMLElement>('.carousel-image-btn');
    const counter = slide?.querySelector<HTMLElement>('.carousel-image-counter');
    if (!imageElement || !imageButton) return;
    const current = Number.parseInt(imageButton.dataset.imageIndex || '0', 10);
    const next = (current + delta + images.length) % images.length;
    const image = images[next];
    if (!image) return;
    setResponsiveSource(imageElement, image);
    imageElement.alt = `${item.title} screenshot ${next + 1}`;
    imageButton.dataset.imageIndex = String(next);
    if (counter) counter.textContent = `${next + 1} / ${images.length}`;
  };

  render();

  container.addEventListener('click', (event) => {
    const target = event.target as Element;
    const dot = target.closest<HTMLElement>('[data-carousel-dot]');
    if (dot) return goToSlide(Number.parseInt(dot.dataset.carouselDot || '0', 10));
    if (target.closest('#carousel-prev')) return goToSlide(currentIndex - 1);
    if (target.closest('#carousel-next')) return goToSlide(currentIndex + 1);

    const imageControl = target.closest<HTMLElement>('.carousel-image-prev, .carousel-image-next');
    if (imageControl) {
      const projectIndex = Number.parseInt(imageControl.dataset.projectIndex || '0', 10);
      return changeProjectImage(projectIndex, imageControl.classList.contains('carousel-image-next') ? 1 : -1);
    }

    const imageButton = target.closest<HTMLElement>('.carousel-image-btn');
    if (imageButton) {
      openLightbox(Number.parseInt(imageButton.dataset.projectIndex || '0', 10), Number.parseInt(imageButton.dataset.imageIndex || '0', 10));
    }
  });

  slidesContainer.addEventListener('error', (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || !image.classList.contains('carousel-image') || image.src.startsWith('data:')) return;
    image.removeAttribute('srcset');
    image.src = placeholder;
  }, true);

  container.addEventListener('keydown', (event) => {
    if (lightboxOpen || data.length <= 1) return;
    if (event.key === 'ArrowRight') goToSlide(currentIndex + 1);
    else if (event.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    else return;
    event.preventDefault();
  });

  let touchStartX = 0;
  container.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches.item(0);
    if (!touch) return;
    touchStartX = touch.screenX;
  }, { passive: true });
  container.addEventListener('touchend', (event) => {
    const touch = event.changedTouches.item(0);
    if (!touch) return;
    const delta = touchStartX - touch.screenX;
    if (Math.abs(delta) > 50 && data.length > 1) goToSlide(currentIndex + (delta > 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!lightboxOpen) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowRight') stepLightbox(1);
    else if (event.key === 'ArrowLeft') stepLightbox(-1);
    else return;
    event.preventDefault();
  });

  lightboxBackdrop?.addEventListener('click', closeLightbox);
  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
  lightboxNext?.addEventListener('click', () => stepLightbox(1));
  container.dataset.carouselReady = 'true';
};
