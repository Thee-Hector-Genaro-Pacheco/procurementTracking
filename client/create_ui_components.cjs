const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join('src', file), content.trim());
};

write('components/ui/Card.tsx', `
import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={\`card \${className}\`.trim()}>{children}</div>;
}
`);

write('components/ui/Badge.tsx', `
import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted' | 'purple';

export function Badge({ children, variant = 'muted', className = '' }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return <span className={\`badge badge-\${variant} \${className}\`.trim()}>{children}</span>;
}
`);

write('components/ui/FormField.tsx', `
import type { ReactNode } from 'react';

export function FormField({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={\`field \${className}\`.trim()}>
      <label>{label}</label>
      {children}
    </div>
  );
}
`);

write('components/ui/PageHeader.tsx', `
export function PageHeader({ title, subtitle, className = '' }: { title: string; subtitle?: string; className?: string }) {
  return (
    <div className={\`page-header \${className}\`.trim()}>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
}
`);

write('components/ui/EmptyState.tsx', `
export function EmptyState({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={\`empty-message \${className}\`.trim()}>
      {message}
    </div>
  );
}
`);

write('components/shared/StatusBadge.tsx', `
import { Badge } from '../ui/Badge';

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  let variant: 'success' | 'warning' | 'danger' | 'muted' | 'purple' = 'muted';
  
  switch(status) {
    case 'APPROVED':
    case 'RECEIVED':
    case 'CLOSED':
      variant = 'success';
      break;
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'ORDERED':
    case 'ISSUED':
    case 'ACKNOWLEDGED':
    case 'PARTIALLY_RECEIVED':
      variant = 'warning';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'RESTRICTED':
      variant = 'danger';
      break;
    case 'ADMIN':
    case 'PREFERRED':
      variant = 'purple';
      break;
    default:
      variant = 'muted';
  }
  
  return <Badge variant={variant} className={className}>{status}</Badge>;
}
`);

write('components/shared/LoadingState.tsx', `
export function LoadingState({ message = 'Loading...', className = '' }: { message?: string; className?: string }) {
  return (
    <div className={\`loading-message \${className}\`.trim()}>
      {message}
    </div>
  );
}
`);

console.log("Components created successfully.");
