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

/** Marketing pages under `src/content/pages/` — discriminated by `pageKind`. */
const pagesCollection = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('pageKind', [
    z.object({
      pageKind: z.literal('orange-kids'),
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
      contactPhone: z.string().optional(),
      draft: z.boolean().default(false),
    }),
    z.object({
      pageKind: z.literal('special-announcements'),
      seo: z.object({
        title: localizedText,
        description: localizedText,
      }),
      pageHeader: z.object({
        backgroundImage: z.string(),
        title: localizedText,
        subtitle: localizedText.optional(),
      }),
      eyebrow: localizedText,
      announcementTitle: localizedText,
      dateLabel: localizedText,
      letterGreeting: localizedText,
      letterParagraphs: z.array(localizedText).min(1),
      prayerIntro: localizedText,
      prayerBullets: z.array(localizedText).min(1),
      letterClosing: localizedText,
      signatureLine1: localizedText,
      signatureLine2: localizedText,
      partnersSectionTitle: localizedText,
      partnersIntro: localizedText,
      partners: z.array(z.string()),
      disclaimerSectionTitle: localizedText,
      disclaimerIntro: localizedText,
      disclaimer: z.array(z.string()),
      draft: z.boolean().default(false),
    }),
    z.object({
      pageKind: z.literal('lifegroups'),
      seo: z.object({
        title: localizedText,
        description: localizedText,
      }),
      pageHeader: z.object({
        backgroundImage: z.string(),
        title: localizedText,
        subtitle: localizedText.optional(),
      }),
      whatIsHeading: localizedText,
      whatIsBody: localizedText,
      whatIsImage: z.string(),
      whatIsImageAlt: localizedText,
      commitmentsEyebrow: localizedText,
      lifeLetters: z.array(
        z.object({
          letter: z.enum(['L', 'I', 'F', 'E']),
          text: localizedText,
        }),
      ).length(4),
      joinSectionHeading: localizedText,
      joinImage: z.string().optional(),
      joinSectionBody: localizedText,
      covenantHeading: localizedText,
      covenantIntro: localizedText,
      covenantItems: z.array(localizedText).min(1),
      formSectionHeading: localizedText,
      formSectionIntro: localizedText,
      formLabels: z.object({
        firstName: localizedText,
        lastName: localizedText,
        email: localizedText,
        city: localizedText,
        cityHelp: localizedText,
        message: localizedText,
        submit: localizedText,
      }),
      formSuccessMessage: localizedText,
      draft: z.boolean().default(false),
    }),
    z.object({
      pageKind: z.literal('membership'),
      seo: z.object({
        title: localizedText,
        description: localizedText,
      }),
      pageHeader: z.object({
        backgroundImage: z.string(),
        title: localizedText,
        subtitle: localizedText.optional(),
      }),
      introHeading: localizedText,
      introBody: localizedText,
      questionHeading: localizedText,
      questionLead: localizedText,
      reasons: z.array(
        z.object({
          title: localizedText,
          body: localizedText,
        }),
      ).min(1),
      requirementsHeading: localizedText,
      requirements: z.array(localizedText).min(1),
      zonePastorNote: localizedText,
      contactHeading: localizedText,
      phoneDisplay: z.string(),
      contactEmail: z.string().email(),
      draft: z.boolean().default(false),
    }),
    z.object({
      pageKind: z.literal('im-new'),
      seo: z.object({
        title: localizedText,
        description: localizedText,
      }),
      pageHeader: z.object({
        backgroundImage: z.string(),
        title: localizedText,
        subtitle: localizedText,
      }),
      expectSection: z.object({
        heading: localizedText,
        subheading: localizedText,
        cards: z.array(
          z.object({
            icon: z.enum(['clock', 'music', 'book']),
            title: localizedText,
            body: localizedText,
          }),
        ).length(3),
      }),
      kidsSection: z.object({
        heading: localizedText,
        intro: localizedText,
        items: z.array(
          z.object({
            title: localizedText,
            body: localizedText,
          }),
        ).min(1),
        safetyNote: localizedText,
        ctaText: localizedText,
        ctaHref: z.string(),
        image: z.string(),
        imageAlt: localizedText,
      }),
      locationSection: z.object({
        heading: localizedText,
        subheading: localizedText,
        mapPlaceholderTitle: localizedText,
        mapPlaceholderNote: localizedText,
        addressHeading: localizedText,
        addressLines: z.array(localizedText).min(1),
        phone: z.string(),
        parkingHeading: localizedText,
        parkingBody: localizedText,
        transitHeading: localizedText,
        transitBody: localizedText,
        directionsText: localizedText,
        directionsHref: z.string(),
      }),
      faqSection: z.object({
        heading: localizedText,
        subheading: localizedText,
        items: z.array(
          z.object({
            question: localizedText,
            answer: localizedText,
          }),
        ).min(1),
      }),
      visitCta: z.object({
        backgroundImage: z.string(),
        heading: localizedText,
        body: localizedText,
        contactText: localizedText,
        contactHref: z.string(),
        directionsText: localizedText,
        directionsHref: z.string(),
      }),
      draft: z.boolean().default(false),
    }),
  ]),
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

const aboutPastorEntry = z.object({
  name: localizedOrString,
  title: localizedOrString,
  image: z.string(),
  email: z.string().email().optional(),
  bio: localizedOrString,
});

const aboutCollection = defineCollection({
  type: 'content',
  schema: z
    .object({
      seo: z.object({ title: z.string(), description: z.string() }),
      /** Present on `about-pastors` only (page title vs. pageHeader.title). */
      title: localizedOrString.optional(),
      pageHeader: z.object({
        backgroundImage: z.string(),
        title: localizedOrString,
        subtitle: localizedOrString.optional(),
      }),
      pageIntro: localizedOrString.optional(),
      mission: z.object({ heading: localizedOrString, body: localizedOrString }).optional(),
      vision: z.object({ heading: localizedOrString, body: localizedOrString }).optional(),
      history: z
        .array(
          z.object({
            year: z.number(),
            en: z.string(),
            'zh-Hant': z.string().optional(),
            'zh-Hans': z.string().optional(),
            images: z.array(z.string()).optional(),
          }),
        )
        .optional(),
      testimonies: z.array(z.object({
        name: z.string(),
        file: z.string(),
        /** Still image shown before play; omit to auto-seek past black video leaders. */
        poster: z.string().optional(),
      })).optional(),
      pastors: z.array(aboutPastorEntry).optional(),
      contactPhone: z.string().optional(),
      draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      const isAboutUs =
        data.mission != null && data.vision != null && data.history != null;
      const isPastorsPage =
        data.title != null &&
        data.pastors != null &&
        data.pastors.length > 0;
      if (isAboutUs === isPastorsPage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [],
          message:
            'about: use either about-us (mission, vision, history) or about-pastors (title, pastors[]).',
        });
      }
    }),
});

export const collections = {
  staff: staffCollection,
  events: eventsCollection,
  sermons: sermonsCollection,
  ministries: ministriesCollection,
  siteInfo: siteInfoCollection,
  campus: campusCollection,
  giving: givingCollection,
  about: aboutCollection,
  pages: pagesCollection,
  navigation: navigationCollection,
};