import type { ReactNode } from 'react';

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`card ${className}`.trim()} style={style}>{children}</div>;
}