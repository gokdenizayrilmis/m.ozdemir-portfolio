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

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className = '',
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EDITORIAL_EASE },
        },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function HoverLift({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </m.div>
  );
}
