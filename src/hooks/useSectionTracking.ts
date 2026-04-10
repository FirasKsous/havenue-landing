import { useEffect } from 'react';
import { trackEvent } from '../lib/analytics';

/**
 * Observes all <section> elements with an `id` attribute inside the given
 * container and fires a `section_viewed` event once each becomes 30% visible.
 *
 * Call once from App-level useEffect with the main element ref.
 */
export function initSectionTracking(): () => void {
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  if (sections.length === 0) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          trackEvent({
            event: 'section_viewed',
            sectionId,
            data: { section: sectionId },
          });
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.3 }
  );

  sections.forEach((section) => observer.observe(section));

  return () => observer.disconnect();
}

/**
 * React hook that initializes section tracking after mount.
 * Uses a small delay to ensure all sections are rendered.
 */
export function useSectionTracking(): void {
  useEffect(() => {
    // Small delay to ensure all sections are in the DOM after initial render
    const timer = setTimeout(() => {
      const cleanup = initSectionTracking();
      return cleanup;
    }, 500);

    return () => clearTimeout(timer);
  }, []);
}
