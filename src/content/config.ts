import { defineCollection, z } from 'astro:content';

const staffCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    title: z.string(), // e.g., "Senior Pastor", "Deaconess"
    image: z.string().startsWith('/uploads/staff/'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(), // Short bio in frontmatter
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const eventsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(), // Event start date
    endDate: z.date().optional(), // Event end date
    time: z.string().optional(), // e.g., "09:00 AM - 11:00 AM"
    location: z.string(),
    image: z.string().startsWith('/uploads/events/'),
    summary: z.string(),
    tags: z.array(z.string()).optional(),
    registrationLink: z.string().url().optional(),
    registrationRequired: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const sermonsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(), // Auto-generated if not provided
    date: z.date(),
    speaker: z.string(),
    series: z.string().optional(),
    scripture: z.string().optional(),
    audioUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
    image: z.string().startsWith('/uploads/sermons/').optional(), // Thumbnail
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const ministriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    logo: z.string().startsWith('/uploads/ministries/').optional(),
    summary: z.string(),
    coordinator: z.string().optional(),
    contact: z.string().optional(), // Email or text
    schedule: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    pubDate: z.date(),
    description: z.string(), // Short description for previews
    author: z.string().default("Church Staff"),
    image: z.object({
      url: z.string().startsWith('/uploads/blog/'),
      alt: z.string()
    }).optional(),
    tags: z.array(z.string()).default(["general"]),
    draft: z.boolean().default(false),
  }),
});

/** Trilingual (or plain string for backwards compatibility). */
const localizedText = z.object({
  en: z.string(),
  'zh-Hant': z.string().optional(),
  'zh-Hans': z.string().optional(),
});
const localizedOrString = z.union([z.string(), localizedText]);

const siteInfoCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    /** Service-times section heading */
    sectionHeading: localizedText.optional(),
    campuses: z.array(z.object({
      campusName: localizedOrString,
      worshipDate: localizedOrString,
      services: z.array(localizedOrString).default([]),
    })).optional(),
    /** home-hero.md fields */
    hero: z.object({
      heroTitle:         localizedText.optional(),
      heroSubtitle:      localizedText.optional(),
      backgroundImage:   z.string().optional(),
      ctaText:           localizedText.optional(),
      ctaLink:           z.string().optional(),
      secondaryCtaText:  localizedText.optional(),
      secondaryCtaLink:  z.string().optional(),
    }).optional(),
    /** home-second-hero.md — about block on home */
    secondHero: z.object({
      image:       z.string().optional(),
      imageAlt:    localizedText.optional(),
      heading:     localizedText.optional(),
      paragraph1:  localizedText.optional(),
      paragraph2:  localizedText.optional(),
      ctaText:     localizedText.optional(),
      ctaLink:     z.string().optional(),
    }).optional(),
    /** new-to_crosspoint.md — home “new to Crosspoint” card grid */
    newToCrosspoint: z.object({
      sectionTitle:    localizedText.optional(),
      sectionSubtitle: localizedText.optional(),
      cardLinkLabel:   localizedText.optional(),
      footerCtaText:   localizedText.optional(),
      footerCtaLink:   z.string().optional(),
      cards: z.array(z.object({
        icon: z.enum(['users', 'music', 'globe', 'sparkles', 'calenders', 'question_mark', 'thunder']),
        background: z.string().optional(),
        /** Small uppercase label above title (pathways layout). */
        tag: localizedText.optional(),
        title: localizedText,
        description: localizedText,
        href: z.string(),
      })).min(1).max(8),
    }).optional(),
    draft: z.boolean().default(false),
  }),
});

const campusCollection = defineCollection({
  type: 'content',
  schema: z.object({
    campusId: z.enum(['Milpitas', 'Pleasanton', 'Tracy', 'Peninsula', 'San Leandro']),
    /** WordPress post category ID used to filter campus-specific events. */
    wpEventCategoryId: z.string(),
    hero: z.object({
      image: z.string(),
      alt: localizedOrString,
    }),
    /** Short paragraph displayed below the hero. */
    description: localizedOrString,
    /** Google Maps embed src URL (iframe). Leave empty for placeholder. */
    googleMapsUrl: z.string().optional(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
    draft: z.boolean().default(false),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: localizedOrString,
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
    pageHeader: z.object({
      backgroundImage: z.string(),
      title: localizedOrString.optional(),
      subtitle: localizedOrString.optional(),
    }).optional(),
    heroImage: z.object({
      src: z.string(),
      alt: localizedOrString,
    }).optional(),
    pageIntro: localizedOrString.optional(),
    missionStatement: localizedOrString.optional(),
    coreCommitment: localizedOrString.optional(),
    pillars: z.array(z.object({
      icon: z.string(),
      title: localizedOrString,
      description: localizedOrString,
    })).optional(),
    sundayMorning: z.object({
      heading: localizedOrString,
      description: localizedOrString,
      keyPoints: z.array(localizedOrString),
      childcareNote: localizedOrString.optional(),
      image: z.object({
        src: z.string(),
        alt: localizedOrString,
      }).optional(),
    }).optional(),
    pastors: z.array(z.object({
      name: z.string(),
      title: localizedOrString,
      image: z.string(),
      email: z.string().optional(),
      bio: localizedOrString,
    })).optional(),
    contactPhone: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const navigationLevel3 = z.object({
  id: z.string(),
  label: localizedText,
  /** Link target. Use "#" for non-navigating placeholder items. */
  href: z.string().default('#'),
});

const navigationLevel2 = z.object({
  id: z.string(),
  label: localizedText,
  /** Link target. Use "#" for non-navigating placeholder items. */
  href: z.string().default('#'),
  children: z.array(navigationLevel3).optional(),
});

const navigationCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    items: z.array(z.object({
      id: z.string(),
      label: localizedText,
      /** Link target. Use "#" for non-navigating placeholder items. */
      href: z.string().default('#'),
      children: z.array(navigationLevel2).optional(),
    })),
    draft: z.boolean().default(false),
  }),
});

/** One row in “Additional Giving Options”. Optional `learnMoreDetails` on any variant adds the same Learn more pattern in the UI. */
const additionalGivingMethod = z.discriminatedUnion('variant', [
  z.object({
    variant: z.literal('checkCash'),
    title: localizedOrString,
    description: localizedOrString,
    learnMoreDetails: localizedOrString.optional(),
  }),
  z.object({
    variant: z.literal('billPay'),
    title: localizedOrString,
    description: localizedOrString,
    address: z.string(),
    learnMoreDetails: localizedOrString.optional(),
  }),
  z.object({
    variant: z.literal('standard'),
    title: localizedOrString,
    description: localizedOrString,
    learnMoreDetails: localizedOrString.optional(),
  }),
]);

const givingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    seo: z.object({
      title: z.string(),
      description: z.string(),
    }),
    pageHeader: z.object({
      backgroundImage: z.string(),
      title: localizedOrString,
      subtitle: localizedOrString.optional(),
    }),
    mainHeading: localizedOrString,
    introParagraph1: localizedOrString,
    introParagraph2: localizedOrString,
    tithelySection: z.object({
      heading: localizedOrString,
      description: localizedOrString,
      feesNote: localizedOrString,
      campuses: z.array(z.object({
        name: localizedOrString,
        url: z.string(),
      })),
    }),
    paypalSection: z.object({
      heading: localizedOrString,
      description: localizedOrString,
      url: z.string(),
    }),
    designatedFundsSection: z.object({
      heading: localizedOrString,
      description: localizedOrString,
      contactNote: localizedOrString,
      funds: z.array(localizedOrString),
    }),
    additionalGivingOptions: z.object({
      heading: localizedOrString,
      subtitle: localizedOrString.optional(),
      methods: z.array(additionalGivingMethod),
    }),
    ctaSection: z.object({
      heading: localizedOrString,
      description: localizedOrString,
    }),
    contactEmail: z.string(),
    contactPhone: z.string(),
    /** Extra copy shown behind “Learn more” on the giving page (designated funds). */
    designatedfundsDetails: localizedOrString.optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  staff: staffCollection,
  events: eventsCollection,
  sermons: sermonsCollection,
  ministries: ministriesCollection,
  blog: blogCollection,
  siteInfo: siteInfoCollection,
  campus: campusCollection,
  giving: givingCollection,
  pages: pagesCollection,
  navigation: navigationCollection,
};