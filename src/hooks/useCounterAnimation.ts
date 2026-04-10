import { useEffect, useState, useRef } from 'react';

interface UseCounterAnimationOptions {
  start?: number;
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export function useCounterAnimation({
  start = 0,
  end,
  duration = 1500,
  suffix = '',
  prefix = '',
}: UseCounterAnimationOptions) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimating) {
            setIsAnimating(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isAnimating]);

  useEffect(() => {
    if (!isAnimating) return;

    let startTime: number;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(start + (end - start) * easeOut);
      
      setCount(currentCount);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isAnimating, start, end, duration]);

  const displayValue = `${prefix}${count}${suffix}`;

  return { count, displayValue, elementRef, isAnimating };
}
