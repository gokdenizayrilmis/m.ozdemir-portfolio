'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export default function AnimatedCounter({
  value,
  durationMs = 500,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const targetValue = Number.isFinite(value) ? value : 0;
    const startTime = performance.now();
    let frameId = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(
        startValue + (targetValue - startValue) * eased
      );
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = targetValue;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value, durationMs]);

  return <span className={`tabular-nums ${className}`}>{displayValue}</span>;
}
