import type { ReactNode } from 'react';

export function FormField({ label, children, className = '', style }: { label: string; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`field ${className}`.trim()} style={style}>
      <label>{label}</label>
      {children}
    </div>
  );
}