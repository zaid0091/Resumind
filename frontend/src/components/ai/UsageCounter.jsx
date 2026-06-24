import { Info, AlertTriangle, Zap } from 'lucide-react';

const DAILY_LIMIT = 100;

export default function UsageCounter({ count = 0 }) {
  const ratio = count / DAILY_LIMIT;
  const isWarning = ratio >= 0.8;
  const isCritical = ratio >= 1;

  return (
    <div className="group relative inline-flex items-center">
      <div
        className={`inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors ${
          isCritical
            ? 'bg-red-50 text-red-700'
            : isWarning
              ? 'bg-amber-50 text-amber-700'
              : 'bg-canvas-soft text-ink-mute'
        }`}
      >
        <Zap className="h-3.5 w-3.5" />
        <span>
          AI calls today: <span className="font-semibold">{count}</span> / {DAILY_LIMIT}
        </span>
        {isWarning && !isCritical && (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
        )}
        {isCritical && (
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
        )}
      </div>

      <div className="ml-2 h-1.5 w-16 overflow-hidden rounded-full bg-hairline">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary'
          }`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>

      <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
        <div className="rounded-md bg-canvas-night px-3 py-1.5 text-xs text-on-dark shadow-lg">
          <div className="flex items-start gap-1.5">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              Free tier limit: {DAILY_LIMIT} AI calls per day.
              <br />
              Resets at midnight UTC.
            </span>
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-canvas-night" />
        </div>
      </div>
    </div>
  );
}
