export interface WpRenderedField {
  rendered: string;
}

export interface WpFeaturedMedia {
  id: number;
  alt_text: string;
  source_url: string;
}

export interface WpBasePost {
  id: number;
  slug: string;
  date: string;
  /** Canonical URL on WordPress (REST `link`). */
  link?: string;
  status?: string;
  type?: string;
  title: WpRenderedField;
  content: WpRenderedField;
  excerpt?: WpRenderedField;
  meta?: Record<string, unknown>;
  acf?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: WpFeaturedMedia[];
    // Other embedded resources (terms, authors, etc.)
    [key: string]: unknown;
  };
}

export interface WpPost extends WpBasePost {
  excerpt: WpRenderedField;
}

export interface WpStaff extends WpBasePost {}

export interface WpMinistry extends WpBasePost {}

