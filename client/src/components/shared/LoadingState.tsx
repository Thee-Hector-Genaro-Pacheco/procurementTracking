export function LoadingState({ message = 'Loading...', className = '' }: { message?: string; className?: string }) {
  return (
    <div className={`loading-message ${className}`.trim()}>
      {message}
    </div>
  );
}