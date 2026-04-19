import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Home page entrance motion: hero fades/slides in on load; lower panels stagger in on scroll.
 * Skipped when `prefers-reduced-motion: reduce` is set.
 */
export function initHomePageGsap(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector<HTMLElement>(".panel--hero");
  if (hero) {
    gsap.from(hero, {
      opacity: 0,
      y: 28,
      duration: 1.05,
      ease: "power3.out",
      delay: 0.06,
    });
  }

  document.querySelectorAll<HTMLElement>(".panel-deck > .panel:not(.panel--hero)").forEach((panel) => {
    gsap.fromTo(
      panel,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: {
          trigger: panel,
          start: "top 90%",
          once: true,
        },
      },
    );
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
  window.addEventListener(
    "load",
    () => {
      ScrollTrigger.refresh();
    },
    { once: true },
  );
}
