import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronDown, Briefcase, Edit3, Target, Zap, TrendingUp } from 'lucide-react';
import { getTips } from '../../api/resumes';

const tipIcons = [Briefcase, Edit3, Target, Zap, TrendingUp];

function TipSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-[6px] bg-canvas-soft p-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-hairline" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-hairline" />
          <div className="h-3 w-full rounded bg-hairline" />
        </div>
      </div>
    </div>
  );
}

export default function AITipsPanel({ resumeId }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tips', resumeId],
    queryFn: () => getTips(resumeId),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const tips = data?.tips || [];

  return (
    <div className="rounded-[6px] border border-hairline bg-canvas">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-canvas-soft"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-amber-50 text-amber-600">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">AI Improvement Tips</p>
            <p className="text-xs text-ink-mute">Get personalized suggestions</p>
          </div>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-ink-mute" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-hairline px-5 pb-5 pt-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <TipSkeleton key={i} />)}
                </div>
              ) : isError ? (
                <div className="text-center">
                  <p className="mb-2 text-sm text-ink-mute">Failed to load tips</p>
                  <button onClick={() => refetch()} className="text-sm font-medium text-primary hover:text-primary-deep">
                    Try again
                  </button>
                </div>
              ) : tips.length === 0 ? (
                <p className="text-sm italic text-ink-mute">
                  No suggestions available. Add more content to your resume first.
                </p>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                  className="space-y-2"
                >
                  {tips.map((tip, i) => {
                    const Icon = tipIcons[i % tipIcons.length];
                    return (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: { opacity: 0, x: -10 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        className="flex items-start gap-3 rounded-[6px] bg-canvas-soft p-3.5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed text-ink">{tip}</p>
                        </div>
                        <div className="mt-0.5 shrink-0 text-hairline-strong">
                          <Icon className="h-4 w-4" />
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
