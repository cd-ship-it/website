/**
 * WordPress-backed pages served at `/{slug}`.
 * Add entries here; content is fetched at build time via `src/lib/wordpress/mirror.ts`.
 */
export type WpDynamicPageKind =
  | "wordpress_page"
  | "wordpress_category_latest_post";

export type WpDynamicPageConfig = {
  /** URL segment, e.g. `/weekly-prayer` */
  slug: string;
  kind: WpDynamicPageKind;
  /** `wordpress_page`: REST `pages?slug=` value */
  wpPageSlug?: string;
  /** `wordpress_category_latest_post`: REST `categories?slug=` then latest `posts` */
  wpCategorySlug?: string;
  pageHeader: {
    title: string;
    subtitle?: string;
  };
  seo: {
    title: string;
    description: string;
  };
  /**
   * `wordpress_category_latest_post` only: show the post title above content.
   * (Word of Your Pastor hides it because the body already includes headings.)
   */
  showPostTitle?: boolean;
};

export const WP_DYNAMIC_PAGES: WpDynamicPageConfig[] = [];

export function getWpDynamicPageConfig(
  slug: string,
): WpDynamicPageConfig | undefined {
  return WP_DYNAMIC_PAGES.find((p) => p.slug === slug);
}
