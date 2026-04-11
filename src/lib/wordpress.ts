import type { WpPost, WpStaff, WpMinistry } from "./wordpress/types";

const WP_BASE_URL = import.meta.env.PUBLIC_WORDPRESS_URL;

if (!WP_BASE_URL) {
  throw new Error(
    "PUBLIC_WORDPRESS_URL is not defined. Set it in your .env or deployment environment."
  );
}

const API_ROOT = new URL("/wp-json/wp/v2/", WP_BASE_URL).toString();

type QueryParams = Record<string, string | number | boolean | undefined>;

async function fetchFromWordPress<T>(
  endpoint: string,
  params: QueryParams = {},
): Promise<T> {
  const url = new URL(endpoint, API_ROOT);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    let body = "";
    try {
      body = await response.text();
    } catch {
      // ignore
    }

    throw new Error(
      `WordPress API error (${response.status} ${response.statusText}) for ${url.toString()}${body ? `: ${body}` : ""
      }`,
    );
  }

  return (await response.json()) as T;
}

export async function getWpPosts(
  params: QueryParams = {},
): Promise<WpPost[]> {
  return fetchFromWordPress<WpPost[]>("posts", {
    per_page: 100,
    status: "publish",
    _embed: "1",
    ...params,
  });
}

export async function getWpStaff(
  params: QueryParams = {},
): Promise<WpStaff[]> {
  // Staff are stored as regular posts in a specific category (e.g. 355)
  // https://www.crosspointchurchsv.org/wp-json/wp/v2/posts?categories=355
  return fetchFromWordPress<WpStaff[]>("posts", {
    per_page: 100,
    status: "publish",
    _embed: "1",
    categories: 355,
    ...params,
  });
}

export async function getWpMinistries(
  params: QueryParams = {},
): Promise<WpMinistry[]> {
  return fetchFromWordPress<WpMinistry[]>("ministries", {
    per_page: 100,
    status: "publish",
    _embed: "1",
    ...params,
  });
}

