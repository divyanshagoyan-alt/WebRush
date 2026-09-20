import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  direction?: 'up' | 'down';
  className?: string;
}

export function AnimatedCounter({ value, direction = 'up', className = '' }: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('0');

  // Motion values
  const startValue = direction === 'up' ? 0 : value * 2; // For down, start high
  const motionValue = useMotionValue(startValue);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(Math.floor(latest).toLocaleString('en-IN'));
    });
  }, [springValue]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}
