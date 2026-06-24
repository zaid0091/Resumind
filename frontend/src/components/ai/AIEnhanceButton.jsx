import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

export default function AIEnhanceButton({ onEnhance, isLoading, hasResult, disabled }) {
  return (
    <div className="group relative inline-flex">
      <motion.button
        type="button"
        onClick={onEnhance}
        disabled={isLoading || disabled}
        whileTap={{ scale: 0.98 }}
        className={[
          'relative inline-flex items-center gap-2 overflow-hidden rounded-[6px] px-4 py-2.5 text-sm font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          isLoading
            ? 'bg-primary text-on-primary'
            : hasResult
              ? 'border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
              : 'bg-primary text-on-primary hover:bg-primary-deep',
        ].join(' ')}
      >
        {isLoading && (
          <motion.span
            className="absolute inset-0 -translate-x-full rounded-[6px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['0%', '200%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        )}

        <span className="relative">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasResult ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </span>

        <span className="relative">
          {isLoading ? 'Enhancing...' : hasResult ? 'Re-enhance' : 'Enhance with AI'}
        </span>
      </motion.button>

      <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="whitespace-nowrap rounded-md bg-canvas-night px-3 py-1.5 text-xs text-on-dark shadow-lg">
          Uses Google Gemini AI to improve your content
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-canvas-night" />
        </div>
      </div>
    </div>
  );
}
