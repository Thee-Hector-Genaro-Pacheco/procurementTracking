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