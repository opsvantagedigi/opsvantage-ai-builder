export type SectionType =
  | 'HERO'
  | 'FEATURES'
  | 'TESTIMONIALS'
  | 'FAQ'
  | 'CUSTOM';

export interface Section {
  id: string;
  pageId: string;
  type: SectionType;
  variant?: string | null;
  data: unknown;
  order?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Page {
  id: string;
  projectId: string;
  title: string;
  slug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  type?: 'HOME' | 'LANDING' | 'CUSTOM';
  isHome?: boolean;
  createdAt?: string;
  updatedAt?: string;
  sections?: Section[];
}

export type PageType = 'HOME' | 'LANDING' | 'CUSTOM';

export interface Project {
  id: string;
  name: string;
  subdomain?: string | null;
  sanityDataset?: string | null;
  createdAt?: string;
  updatedAt?: string;
  workspaceId?: string;
  pages?: Page[];
}

export type SectionWithOrder = Section & { order: number | null };
