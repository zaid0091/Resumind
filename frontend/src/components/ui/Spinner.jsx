export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-hairline" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-b-primary/50" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
      </div>
    </div>
  );
}
