'use client';

import { m } from 'motion/react';
import { ReactNode } from 'react';

const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function FadeIn({
  children,
  delay = 0,
  y = 18,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </m.div>
  );
}
