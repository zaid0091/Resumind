import { useState, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, Loader2, Clock, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';
import { enhanceAll, getResume } from '../../api/resumes';

const stepLabels = [
  { key: 'summary', label: 'Summary' },
  { key: 'experience', label: 'Experience' },
  { key: 'projects', label: 'Projects' },
];

function Confetti() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ['#3ecf8e', '#171717', '#24b47e', '#707070', '#4ade80'][i % 5],
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '100vh', opacity: 0, rotate: 360 }}
          transition={{ duration: 2, delay: p.delay, ease: 'easeIn' }}
          className="absolute h-3 w-3 rounded-sm"
          style={{ backgroundColor: p.color, left: `${p.x}%` }}
        />
      ))}
    </div>
  );
}

export default function EnhanceAllModal({ resumeId, onClose, onComplete }) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('idle');

  const addLog = useCallback((status, label, detail) => {
    setLogs((prev) => [...prev, { status, label, detail, id: Date.now() }]);
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      setPhase('processing');

      const resume = await getResume(resumeId);
      const sections = [];

      if (resume.summary?.raw_text) sections.push('summary');
      const expCount = resume.experiences?.length || 0;
      if (expCount) {
        for (let i = 0; i < expCount; i++) sections.push('experience');
      }
      const projCount = resume.projects?.length || 0;
      if (projCount) {
        for (let i = 0; i < projCount; i++) sections.push('project');
      }

      const total = sections.length;
      let done = 0;

      addLog('pending', 'Summary', 'Queued...');
      for (const s of sections) {
        if (s === 'summary') {
          addLog('processing', 'Summary', 'Enhancing with AI...');
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      const result = await enhanceAll(resumeId);

      const newLogs = [];
      if (result.summaries > 0) {
        newLogs.push({ status: 'done', label: 'Summary', detail: 'Enhanced successfully', id: Date.now() + 1 });
        done++;
      }
      if (result.experiences > 0) {
        for (let i = 0; i < result.experiences; i++) {
          newLogs.push({
            status: 'done',
            label: `Experience ${i + 1} of ${result.experiences}`,
            detail: 'Enhanced successfully',
            id: Date.now() + 2 + i,
          });
          done++;
        }
      }
      if (result.projects > 0) {
        for (let i = 0; i < result.projects; i++) {
          newLogs.push({
            status: 'done',
            label: `Project ${i + 1} of ${result.projects}`,
            detail: 'Enhanced successfully',
            id: Date.now() + 200 + i,
          });
          done++;
        }
      }

      setLogs((prev) => {
        const combined = [...prev, ...newLogs];
        return combined;
      });
      setProgress(Math.round((done / Math.max(total, 1)) * 100));

      setTimeout(() => setProgress(100), 300);
      setTimeout(() => {
        setPhase('done');
        toast.success(`Enhanced ${done} sections!`);
        if (onComplete) onComplete(result);
      }, 600);

      return result;
    },
    onError: () => {
      addLog('error', 'Error', 'Enhancement failed');
      toast.error('Enhancement failed');
      setPhase('done');
    },
  });

  useEffect(() => {
    mutation.mutate();
  }, []);

  const totalDone = logs.filter((l) => l.status === 'done').length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-[12px] border border-hairline bg-canvas shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
        >
          {phase === 'done' && <Confetti />}

          <div className="relative px-6 pb-6 pt-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary text-on-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-ink">AI Enhancement</h3>
                  <p className="text-xs text-ink-mute">
                    {phase === 'idle' && 'Preparing...'}
                    {phase === 'processing' && 'Processing your content...'}
                    {phase === 'done' && 'All done!'}
                  </p>
                </div>
              </div>
              {phase === 'done' && (
                <button
                  onClick={() => { onClose(); }}
                  className="rounded-[6px] p-1.5 text-ink-mute hover:bg-canvas-soft hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-hairline">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-ink-mute">Progress</span>
              <span className="font-medium text-ink">{progress}%</span>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto rounded-[6px] bg-canvas-soft p-3">
              {logs.length === 0 && phase === 'idle' && (
                <div className="flex items-center gap-2 py-2 text-sm text-ink-mute">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing resume...
                </div>
              )}

              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    {log.status === 'pending' && <Clock className="h-4 w-4 shrink-0 text-ink-faint" />}
                    {log.status === 'processing' && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    )}
                    {log.status === 'done' && <CheckCircle className="h-4 w-4 shrink-0 text-primary" />}
                    {log.status === 'error' && <X className="h-4 w-4 shrink-0 text-red-500" />}

                    <span className="text-ink">
                      <span className="font-medium">{log.label}</span>
                      {log.detail && (
                        <span className="ml-1 text-ink-mute">— {log.detail}</span>
                      )}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-[6px] bg-primary/5 px-4 py-3 text-primary"
              >
                <PartyPopper className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Done! {totalDone} section{totalDone !== 1 ? 's' : ''} enhanced.
                </span>
              </motion.div>
            )}

            {phase === 'done' && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => { onClose(); }} className="btn-primary-green">
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
