import type { WpPost, WpStaff } from "./types";

export interface StaffEntryData {
  name: string;
  title: string;
  bio: string;
  image?: string;
  email?: string;
  phone?: string;
  order?: number;
}

export interface StaffEntry {
  slug: string;
  data: StaffEntryData;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function mapWpStaffToEntries(posts: (WpStaff | WpPost)[]): StaffEntry[] {
  return posts.map((post) => {
    const acf = (post as WpPost).acf ?? {};

    const name =
      (acf["name"] as string | undefined) ?? post.title?.rendered ?? "";
    const title = (acf["title"] as string | undefined) ?? "";

    const rawBio =
      (acf["biography"] as string | undefined) ??
      post.content?.rendered ??
      "";
    const bio = stripHtml(rawBio);

    const order =
      (acf["order"] as number | undefined) ??
      (typeof (acf["order"] as unknown) === "string"
        ? Number(acf["order"])
        : undefined);

    return {
      slug: post.slug,
      data: {
        name,
        title,
        bio,
        order,
      },
    };
  });
}

