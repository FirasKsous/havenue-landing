import { useEffect, useState, useRef } from 'react';

interface CounterAnimationProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  isVisible?: boolean;
}

export function CounterAnimation({
  end,
  duration = 1500,
  suffix = '',
  prefix = '',
  className = '',
  isVisible = true,
}: CounterAnimationProps) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    
    hasAnimated.current = true;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease out quad for smooth deceleration
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      
      setCount(Math.floor(easeProgress * end));

      if (now < endTime) {
        requestAnimationFrame(tick);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(tick);
  }, [isVisible, end, duration]);

  return (
    <span className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}
