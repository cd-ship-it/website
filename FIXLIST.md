# Fix List

## Broken Links
- [ ] Fix the footer `Life Groups` link so it no longer points to `/ministries/life-groups` 404: [Footer.astro](/Users/fredng/projects/crosspointweb3.0/src/components/Global/Footer.astro:40)
- [ ] Fix the footer `Privacy` link so it no longer points to `/privacy-policy` 404: [Footer.astro](/Users/fredng/projects/crosspointweb3.0/src/components/Global/Footer.astro:143)
- [ ] Fix the footer `Terms` link so it no longer points to `/terms-of-service` 404: [Footer.astro](/Users/fredng/projects/crosspointweb3.0/src/components/Global/Footer.astro:145)
- [ ] Fix the footer `Prayer Request` link or restore a real `#prayer` target on the contact page: [Footer.astro](/Users/fredng/projects/crosspointweb3.0/src/components/Global/Footer.astro:39), [contact.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/contact.astro:305)
- [ ] Fix the `/our-season` hero CTA links so `#reality` and `#ahead` do not render as malformed quoted URLs: [our-season.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/our-season.astro:55), [our-season.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/our-season.md:36)
- [ ] Fix event slug collisions so different events do not collapse to `/events/event`: [eventApi.ts](/Users/fredng/projects/crosspointweb3.0/src/lib/eventApi.ts:61), [eventApi.ts](/Users/fredng/projects/crosspointweb3.0/src/lib/eventApi.ts:144)
- [ ] Improve generated event slugs so pages like `/events/2026` become descriptive and unique: [eventApi.ts](/Users/fredng/projects/crosspointweb3.0/src/lib/eventApi.ts:144)

## Copy And Grammar
- [ ] Change `Opps... Page not found.` to `Oops... Page not found.`: [404.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/404.astro:13)
- [ ] Fix `duringservice` to `during service`: [im-new.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/im-new.md:95)
- [ ] Fix the typo class `body-cop` to `body-copy`: [im-new.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/im-new.astro:98)
- [ ] Add a period to `Here's what you can expect when you visit us for the first time`: [im-new.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/im-new.md:32)
- [ ] Make the `Service Length` copy consistent across languages because English says `70 minutes` while Chinese says `75 minutes`: [im-new.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/im-new.md:42)
- [ ] Reword `had helped with voluntary service` to more natural English: [membership.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/membership.md:32)
- [ ] Reword `We need proof of membership to connect with the secular world.` so it reads more naturally on a public page: [membership.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/membership.md:64)
- [ ] Change `fits in to` to `fits into`: [orange-kids.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/orange-kids.md:47)
- [ ] Change `in all campuses` to `at all campuses` or `across all campuses`: [orange-kids.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/orange-kids.md:77)
- [ ] Review `create a crosspoint between children and God` and decide whether to rewrite it in more natural seeker-facing language: [orange-kids.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/orange-kids.md:10), [orange-kids.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/orange-kids.md:31)
- [ ] Make `Heart of a Shepherd` and `Word of Your Pastor` consistent across title, subtitle, and SEO copy: [wpDynamicPages.ts](/Users/fredng/projects/crosspointweb3.0/src/config/wpDynamicPages.ts:51)

## Localization And Consistency
- [ ] Audit secondary pages so the language toggle changes page headings and UI consistently on `/events`, `/sermons`, and `/contact`: [events/index.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/events/index.astro:18), [sermons/index.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/sermons/index.astro:8), [contact.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/contact.astro:11)
- [ ] Fix the Pleasanton Traditional Chinese service labels so they do not show `國語崇拜` twice: [service-times.md](/Users/fredng/projects/crosspointweb3.0/src/content/siteInfo/service-times.md:35)
- [ ] Standardize Simplified Chinese punctuation and formatting in service times: [service-times.md](/Users/fredng/projects/crosspointweb3.0/src/content/siteInfo/service-times.md:22)
- [ ] Standardize social profile URLs between footer and contact page, especially YouTube: [Footer.astro](/Users/fredng/projects/crosspointweb3.0/src/components/Global/Footer.astro:58), [contact.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/contact.astro:288)

## Seeker Experience
- [ ] Render the `I'm New` location and directions section or remove the unused content: [im-new.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/im-new.md:113)
- [ ] Replace the placeholder `123 Main Street`, `Anytown`, and `(555) 123-4567` before using that `I'm New` location content: [im-new.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/im-new.md:135)
- [ ] Render the `I'm New` FAQ section or remove the unused content block: [im-new.md](/Users/fredng/projects/crosspointweb3.0/src/content/pages/im-new.md:164)
- [ ] Give the campus overview page a real intro and H1 instead of only dropping visitors into the service-times component: [campus.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/campus.astro:18)
- [ ] Make `I'm New` easier to discover in mobile navigation instead of burying it under `Connect`: [main-menu.md](/Users/fredng/projects/crosspointweb3.0/src/content/navigation/main-menu.md:15)
- [ ] Improve the 404 page so it offers recovery actions like Home, Campuses, or `I'm New`: [404.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/404.astro:5)
- [ ] Remove the empty footer tagline band or populate it with intentional content: [Footer.astro](/Users/fredng/projects/crosspointweb3.0/src/components/Global/Footer.astro:73)
- [ ] Remove or replace the commented placeholder ministry emails so they cannot accidentally ship later: [contact.astro](/Users/fredng/projects/crosspointweb3.0/src/pages/contact.astro:305)
