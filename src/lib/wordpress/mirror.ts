import {
  getWpCategoryBySlug,
  getWpPages,
  getWpPageById,
  getWpPostById,
  getWpPostsByCategoryId,
} from "../wordpress";
import type { WpPost } from "./types";

export type WpMirrorItem = WpPost & {
  type?: string;
};

export function parseWordPressIds(rawIds?: string): number[] {
  if (!rawIds) {
    return [];
  }

  return rawIds
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);
}

export async function fetchExplicitWordPressItemsById(
  ids: number[],
): Promise<WpMirrorItem[]> {
  const items = (
    await Promise.all(
      ids.map(async (id) => {
        const [post, page] = await Promise.all([getWpPostById(id), getWpPageById(id)]);
        return [post, page].filter(Boolean) as WpMirrorItem[];
      }),
    )
  ).flat();

  return items;
}

export async function fetchWordPressItemsByCategorySlug(
  categorySlug: string,
): Promise<WpMirrorItem[]> {
  const category = await getWpCategoryBySlug(categorySlug);
  if (!category) {
    return [];
  }
  return getWpPostsByCategoryId(category.id);
}

export async function fetchWordPressPageBySlug(
  pageSlug: string,
): Promise<WpMirrorItem | null> {
  const pages = await getWpPages({
    slug: pageSlug,
    per_page: 1,
  });
  return pages[0] ?? null;
}

export async function fetchLatestWordPressPostByCategorySlug(
  categorySlug: string,
): Promise<WpMirrorItem | null> {
  const category = await getWpCategoryBySlug(categorySlug);
  if (!category) {
    return null;
  }

  const posts = await getWpPostsByCategoryId(category.id, {
    per_page: 1,
    orderby: "date",
    order: "desc",
  });
  return posts[0] ?? null;
}

export function mergeWordPressMirrorItems(
  categoryItems: WpMirrorItem[],
  explicitItems: WpMirrorItem[],
): WpMirrorItem[] {
  const keyToItem = new Map<string, WpMirrorItem>();
  const lowerSlugToItemKey = new Map<string, string>();

  const putItem = (item: WpMirrorItem, isExplicit: boolean) => {
    const type = item.type ?? "post";
    const key = `${type}:${item.id}`;
    const lowerSlug = item.slug.toLowerCase();
    const existingKey = lowerSlugToItemKey.get(lowerSlug);

    if (existingKey && existingKey !== key) {
      if (isExplicit) {
        console.warn(
          `[wp-mirror] slug collision "${item.slug}" replaced by explicit ID (${key}) over ${existingKey}`,
        );
        keyToItem.delete(existingKey);
      } else {
        console.warn(
          `[wp-mirror] slug collision "${item.slug}" ignored for ${key} (already used by ${existingKey})`,
        );
        return;
      }
    }

    lowerSlugToItemKey.set(lowerSlug, key);
    keyToItem.set(key, item);
  };

  for (const item of categoryItems) {
    putItem(item, false);
  }
  for (const item of explicitItems) {
    putItem(item, true);
  }

  return Array.from(keyToItem.values());
}

