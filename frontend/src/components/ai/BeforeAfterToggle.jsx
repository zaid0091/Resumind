import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

export default function BeforeAfterToggle({ originalText, enhancedText, useAI, onToggle }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Choose version:</p>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`relative rounded-[6px] border-2 p-4 text-left transition-all ${
            !useAI
              ? 'border-primary ring-2 ring-primary/10 bg-primary/5'
              : 'border-hairline bg-canvas hover:border-hairline-strong'
          }`}
        >
          {!useAI && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary"
            >
              <Check className="h-3.5 w-3.5" />
            </motion.div>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-mute">
            Your Version
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={originalText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                {originalText || 'No content yet'}
              </p>
            </motion.div>
          </AnimatePresence>
        </button>

        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`relative rounded-[6px] border-2 p-4 text-left transition-all ${
            useAI
              ? 'border-primary ring-2 ring-primary/10'
              : 'border-hairline bg-canvas hover:border-hairline-strong'
          }`}
        >
          {useAI && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary"
            >
              <Check className="h-3.5 w-3.5" />
            </motion.div>
          )}
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI Version
          </p>

          {enhancedText ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={enhancedText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                  {enhancedText}
                </p>
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="text-sm italic text-ink-mute">
              Click &quot;Enhance with AI&quot; to generate an improved version
            </p>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className={`text-xs font-medium transition-colors ${!useAI ? 'text-ink' : 'text-ink-mute'}`}>
          Your Version
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={useAI}
          onClick={() => onToggle(!useAI)}
          disabled={!enhancedText}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useAI ? 'bg-primary' : 'bg-hairline-strong'
          } ${!enhancedText ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm ${
              useAI ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-xs font-medium transition-colors ${useAI ? 'text-ink' : 'text-ink-mute'}`}>
          AI Version
        </span>
      </div>
    </div>
  );
}
