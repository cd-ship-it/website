/**
 * Switch between the default main navigation and the alternate layout.
 * Set `PUBLIC_NAVIGATION_VARIANT=alt` in `.env` or your host’s env (e.g. Cloudflare).
 */
export type NavigationVariant = "default" | "alt";

export const NAVIGATION_VARIANT: NavigationVariant =
  import.meta.env.PUBLIC_NAVIGATION_VARIANT === "alt" ? "alt" : "default";
