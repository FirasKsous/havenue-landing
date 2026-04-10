import { useEffect, useRef, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let observer: IntersectionObserver | null = null;

    // Single rAF to ensure hidden state is painted before observing
    const rafId = requestAnimationFrame(() => {
      if (!ref.current) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              if (triggerOnce && observer) {
                observer.unobserve(entry.target);
              }
            } else if (!triggerOnce) {
              setIsVisible(false);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(ref.current);
    });

    return () => {
      cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentProgress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;

        if (Math.abs(window.scrollY - lastScrollY) > 5) {
          setProgress(Math.min(100, Math.max(0, currentProgress)));
          lastScrollY = window.scrollY;
        }
        rafId = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return progress;
}
