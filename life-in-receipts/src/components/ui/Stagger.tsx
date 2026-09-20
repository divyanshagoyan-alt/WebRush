import type { ReactNode } from 'react';

interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  viewportMargin?: string;
  role?: string;
  'aria-label'?: string;
}

export function Stagger({ 
  children, 
  className = '',
  role,
  'aria-label': ariaLabel
}: StaggerProps) {
  return (
    <div className={className} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
