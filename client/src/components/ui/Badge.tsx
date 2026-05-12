import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted' | 'purple';

export function Badge({ children, variant = 'muted', className = '' }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return <span className={`badge badge-${variant} ${className}`.trim()}>{children}</span>;
}