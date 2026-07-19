export interface Project {
  name: string;
  description: string;
  language: string;
  url: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  link?: string;
}

/** Mirrors a subset of live /api/projects cards for HTMX mock tests. */
export const mockProjects: Project[] = [
  {
    name: 'monzo-mcp',
    description:
      "Exposes Monzo's API to MCP clients (Claude Desktop, etc.) over stdio.",
    language: 'TypeScript',
    url: 'https://github.com/allistera/monzo-mcp',
  },
  {
    name: 'daily-news',
    description:
      'A small Python service that assembles a daily email newsletter from a set of sources and delivers it with Resend.',
    language: 'Python',
    url: 'https://github.com/allistera/daily-news',
  },
];

export const longProjectDetails: Project[] = [
  {
    name: 'super-cali-fragilistic-expiali-docious-extremely-long-repository-name-that-goes-on-and-on',
    description:
      'This is an exceptionally long and verbose project description meant to test text wrap-around logic and layout constraint safety in high-density flex containers across variable viewport widths without overflowing boundaries or overlapping adjacent components.',
    language: 'WebAssembly',
    url: 'https://github.com/allistera/long-name',
  },
];

export const mockCarouselData: CarouselItem[] = [
  {
    id: 'chaos-mesh-dashboard',
    title: 'Chaos Mesh Control Plane',
    description: 'Real-time telemetry and fault injection dashboard.',
    images: [
      '/assets/screenshots/chaos-mesh.png',
      '/assets/screenshots/chaos-mesh-detail.png',
    ],
    link: 'https://github.com/example/chaos-mesh-dashboard',
  },
  {
    id: 'cost-optimizer-ui',
    title: 'Cost Optimization Analytics',
    description: 'Cluster resource utilization and savings analysis recommendations.',
    images: ['/assets/screenshots/cost-optimizer.png'],
    link: 'https://github.com/example/cost-optimizer-ui',
  },
  {
    id: 'aiops-anomaly-detector',
    title: 'AIOps Engine Logs',
    description: 'Anomaly detection visualizer with historical baseline comparisons.',
    images: ['/assets/screenshots/aiops-detector.png'],
    link: 'https://github.com/example/aiops-anomaly-detector',
  },
];

export const singleCarouselItem: CarouselItem[] = [
  {
    id: 'single-project',
    title: 'Single Project Showcase',
    description: 'Statically configured single item carousel for boundary testing.',
    images: ['/assets/screenshots/single.png'],
    link: 'https://github.com/example/single',
  },
];

export const brokenImageCarousel: CarouselItem[] = [
  {
    id: 'broken-img-project',
    title: 'Broken Image Project',
    description: 'Project slide testing broken image fallback scenarios.',
    images: ['/assets/screenshots/non-existent-image-path.png'],
    link: 'https://github.com/example/broken-img',
  },
];

export const missingLinkCarousel: CarouselItem[] = [
  {
    id: 'no-link-project',
    title: 'No External Link Project',
    description: 'This project does not have a GitHub repository link provided.',
    images: ['/assets/screenshots/no-link.png'],
  },
];

/** HTML shape aligned with src/pages/api/projects.astro cards. */
export function formatProjectAsHtml(project: Project): string {
  return `
    <div class="project-card p-6 rounded bg-zinc-900 border border-zinc-800 flex flex-col justify-between gap-4 hover:border-emerald-500 transition-colors">
      <div class="flex flex-col gap-2">
        <h3 class="text-xl font-bold text-zinc-100 font-mono tracking-wide">${project.name}</h3>
        <p class="text-sm text-zinc-400 leading-relaxed">${project.description}</p>
      </div>
      <div class="flex flex-wrap items-center justify-between text-xs text-zinc-500 font-mono pt-4 border-t border-zinc-800">
        <div class="flex gap-4">
          <span>Language: <strong class="text-emerald-400">${project.language}</strong></span>
        </div>
        <span><a href="${project.url}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300">allistera/${project.name}</a></span>
      </div>
    </div>
  `;
}
