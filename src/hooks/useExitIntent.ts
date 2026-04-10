import { useEffect, useState, useCallback } from 'react';

interface UseExitIntentOptions {
  threshold?: number; // Percentage of mouse Y position to trigger (default: 10)
  cooldown?: number; // Cooldown in milliseconds (default: 60000 = 1 min)
  maxTriggers?: number; // Max times to trigger per session (default: 1)
}

export function useExitIntent({
  threshold = 10,
  cooldown = 60000,
  maxTriggers = 1,
}: UseExitIntentOptions = {}) {
  const [isTriggered, setIsTriggered] = useState(false);
  const [triggerCount, setTriggerCount] = useState(0);
  const analyticsWindow = window as Window & { gtag?: (...args: unknown[]) => void };

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      // Check if mouse is leaving through the top of the viewport
      if (e.clientY <= (window.innerHeight * threshold) / 100) {
        // Check if already dismissed in this session
        const dismissed = sessionStorage.getItem('exit-intent-dismissed');
        if (dismissed === 'true') return;

        // Check trigger count
        if (triggerCount >= maxTriggers) return;

        // Check cooldown
        const lastTrigger = sessionStorage.getItem('exit-intent-last-trigger');
        if (lastTrigger) {
          const timeSince = Date.now() - parseInt(lastTrigger, 10);
          if (timeSince < cooldown) return;
        }

        setIsTriggered(true);
        setTriggerCount((prev) => prev + 1);
        sessionStorage.setItem('exit-intent-last-trigger', Date.now().toString());

        // Analytics event
        if (typeof window !== 'undefined' && analyticsWindow.gtag) {
          analyticsWindow.gtag('event', 'exit_intent_triggered');
        }
      }
    },
    [threshold, cooldown, maxTriggers, triggerCount, analyticsWindow]
  );

  const reset = useCallback(() => {
    setIsTriggered(false);
  }, []);

  const dismiss = useCallback(() => {
    setIsTriggered(false);
    sessionStorage.setItem('exit-intent-dismissed', 'true');
  }, []);

  useEffect(() => {
    // Only on desktop (mouse required)
    if (typeof window === 'undefined' || 'ontouchstart' in window) {
      return;
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  return { isTriggered, reset, dismiss };
}
