export interface Project {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}

export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
}

export const mockProjects: Project[] = [
  {
    name: 'automated-chaos-mesh',
    description: 'Kubernetes chaos engineering controller designed to inject faults and verify resiliency of distributed AIOps microservices.',
    stars: 342,
    forks: 47,
    language: 'Go',
    updatedAt: '2026-07-10T14:30:00Z'
  },
  {
    name: 'kubernetes-cost-optimizer',
    description: 'An automated resource profiling and rightsizing controller targeting Kubernetes clusters using historical telemetry.',
    stars: 189,
    forks: 23,
    language: 'TypeScript',
    updatedAt: '2026-07-15T09:15:00Z'
  }
];

export const longProjectDetails: Project[] = [
  {
    name: 'super-cali-fragilistic-expiali-docious-extremely-long-repository-name-that-goes-on-and-on',
    description: 'This is an exceptionally long and verbose project description meant to test text wrap-around logic and layout constraint safety in high-density flex containers across variable viewport widths without overflowing boundaries or overlapping adjacent components.',
    stars: 99999,
    forks: 88888,
    language: 'WebAssembly',
    updatedAt: '2026-07-17T12:00:00Z'
  }
];

export const mockCarouselData: CarouselItem[] = [
  {
    id: 'chaos-mesh-dashboard',
    title: 'Chaos Mesh Control Plane',
    description: 'Real-time telemetry and fault injection dashboard.',
    image: '/assets/screenshots/chaos-mesh.png',
    link: 'https://github.com/example/chaos-mesh-dashboard'
  },
  {
    id: 'cost-optimizer-ui',
    title: 'Cost Optimization Analytics',
    description: 'Cluster resource utilization and savings analysis recommendations.',
    image: '/assets/screenshots/cost-optimizer.png',
    link: 'https://github.com/example/cost-optimizer-ui'
  },
  {
    id: 'aiops-anomaly-detector',
    title: 'AIOps Engine Logs',
    description: 'Anomaly detection visualizer with historical baseline comparisons.',
    image: '/assets/screenshots/aiops-detector.png',
    link: 'https://github.com/example/aiops-anomaly-detector'
  }
];

export const singleCarouselItem: CarouselItem[] = [
  {
    id: 'single-project',
    title: 'Single Project Showcase',
    description: 'Statically configured single item carousel for boundary testing.',
    image: '/assets/screenshots/single.png',
    link: 'https://github.com/example/single'
  }
];

export const brokenImageCarousel: CarouselItem[] = [
  {
    id: 'broken-img-project',
    title: 'Broken Image Project',
    description: 'Project slide testing broken image fallback scenarios.',
    image: '/assets/screenshots/non-existent-image-path.png',
    link: 'https://github.com/example/broken-img'
  }
];

export const missingLinkCarousel: CarouselItem[] = [
  {
    id: 'no-link-project',
    title: 'No External Link Project',
    description: 'This project does not have a GitHub repository link provided.',
    image: '/assets/screenshots/no-link.png'
    // link is omitted
  }
];

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
          <span>Stars: <strong class="text-zinc-300">${project.stars}</strong></span>
          <span>Forks: <strong class="text-zinc-300">${project.forks}</strong></span>
        </div>
        <span>Updated: ${new Date(project.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  `;
}

