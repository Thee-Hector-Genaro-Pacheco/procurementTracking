export function EmptyState({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={`empty-message ${className}`.trim()}>
      {message}
    </div>
  );
}