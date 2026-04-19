import type { WpPost, WpStaff, WpMinistry } from "./wordpress/types";

const WP_BASE_URL = import.meta.env.PUBLIC_WORDPRESS_URL;

if (!WP_BASE_URL) {
  throw new Error(
    "PUBLIC_WORDPRESS_URL is not defined. Set it in your .env or deployment environment."
  );
}

const API_ROOT = new URL("/wp-json/wp/v2/", WP_BASE_URL).toString();

type QueryParams = Record<string, string | number | boolean | undefined>;

async function requestFromWordPress(
  endpoint: string,
  params: QueryParams = {},
): Promise<Response> {
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

  return response;
}

async function fetchFromWordPress<T>(
  endpoint: string,
  params: QueryParams = {},
): Promise<T> {
  const response = await requestFromWordPress(endpoint, params);
  return (await response.json()) as T;
}

async function fetchPaginatedFromWordPress<T>(
  endpoint: string,
  params: QueryParams = {},
): Promise<T[]> {
  const perPage = 100;
  const firstResponse = await requestFromWordPress(endpoint, {
    per_page: perPage,
    page: 1,
    ...params,
  });
  const firstPageItems = (await firstResponse.json()) as T[];
  const totalPages = Number(firstResponse.headers.get("X-WP-TotalPages") ?? "1");

  if (!Number.isFinite(totalPages) || totalPages <= 1) {
    return firstPageItems;
  }

  const restPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchFromWordPress<T[]>(endpoint, {
        per_page: perPage,
        page: index + 2,
        ...params,
      }),
    ),
  );

  return [firstPageItems, ...restPages].flat();
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

interface WpCategory {
  id: number;
  slug: string;
  name: string;
}

export async function getWpCategoryBySlug(
  categorySlug: string,
): Promise<WpCategory | null> {
  const categories = await fetchFromWordPress<WpCategory[]>("categories", {
    slug: categorySlug,
    per_page: 1,
    hide_empty: false,
  });

  return categories[0] ?? null;
}

export async function getWpPostsByCategoryId(
  categoryId: number,
  params: QueryParams = {},
): Promise<WpPost[]> {
  return fetchPaginatedFromWordPress<WpPost>("posts", {
    status: "publish",
    _embed: "1",
    categories: categoryId,
    ...params,
  });
}

export async function getWpPostById(id: number): Promise<WpPost | null> {
  try {
    return await fetchFromWordPress<WpPost>(`posts/${id}`, {
      _embed: "1",
    });
  } catch {
    return null;
  }
}

export async function getWpPageById(id: number): Promise<WpPost | null> {
  try {
    return await fetchFromWordPress<WpPost>(`pages/${id}`, {
      _embed: "1",
    });
  } catch {
    return null;
  }
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

