import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { enhanceSummary as enhanceSummaryApi, updateResume } from '../../api/resumes';
import { Button } from '../ui';

export default function SummaryStep({ resumeId, summary }) {
  const queryClient = useQueryClient();
  const [rawText, setRawText] = useState(summary?.raw_text || '');
  const [jobTitle, setJobTitle] = useState(summary?.target_job_title || '');
  const [useAi, setUseAi] = useState(summary?.use_ai_version ?? true);
  const [aiText, setAiText] = useState(summary?.ai_enhanced_text || '');
  const [hasEnhanced, setHasEnhanced] = useState(!!summary?.ai_enhanced_text);
  const saveTimer = useRef(null);
  const jobTitleTimer = useRef(null);

  const debouncedSave = useCallback(
    (text) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await updateResume(resumeId, { summary: { raw_text: text } });
          queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
        } catch { /* ignore */ }
      }, 1000);
    },
    [resumeId, queryClient],
  );

  useEffect(() => {
    debouncedSave(rawText);
  }, [rawText, debouncedSave]);

  useEffect(() => {
    if (jobTitleTimer.current) clearTimeout(jobTitleTimer.current);
    jobTitleTimer.current = setTimeout(async () => {
      try {
        await updateResume(resumeId, { summary: { target_job_title: jobTitle } });
        queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      } catch (e) {
        toast.error('Failed to save target job title');
      }
    }, 1000);
    return () => { if (jobTitleTimer.current) clearTimeout(jobTitleTimer.current); };
  }, [jobTitle, resumeId, queryClient]);

  const toggleMutation = useMutation({
    mutationFn: (val) => updateResume(resumeId, { summary: { use_ai_version: val } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resume', resumeId] }),
  });

  const enhanceMutation = useMutation({
    mutationFn: () => enhanceSummaryApi(resumeId, { raw_text: rawText, job_title: jobTitle }),
    onSuccess: (data) => {
      setAiText(data.enhanced_text);
      setHasEnhanced(true);
      setUseAi(true);
      toast.success('Summary enhanced!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
    onError: () => toast.error('Failed to enhance summary'),
  });

  return (
    <div>
      <h2 className="mb-6 text-xl font-medium text-ink">Professional Summary</h2>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Target job title (for AI context)
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          className="input-field"
        />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-ink">Your notes</label>
        <span className="text-xs text-ink-mute">{rawText.length} chars</span>
      </div>
      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder="Write rough notes about yourself, your career highlights, key achievements..."
        className="input-field min-h-[160px] resize-y"
      />

      <div className="mt-4 flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => enhanceMutation.mutate()}
          disabled={!rawText.trim() || enhanceMutation.isPending}
        >
          {enhanceMutation.isPending ? (
            <span className="flex items-center gap-1"><span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-mute border-t-transparent" /> Enhancing...</span>
          ) : (
            <><Sparkles className="h-4 w-4" /> Enhance with AI</>
          )}
        </Button>
        {enhanceMutation.isPending && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-ink-mute">
            AI is writing your summary...
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {hasEnhanced && aiText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <p className="mb-2 text-sm font-medium text-ink">Choose version:</p>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => { setUseAi(false); toggleMutation.mutate(false); }}
                className={`relative rounded-[6px] border-2 p-4 text-left transition-all ${
                  !useAi ? 'border-primary ring-2 ring-primary/10' : 'border-hairline'
                }`}
              >
                {!useAi && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-mute">Original</p>
                <p className="text-sm leading-relaxed text-ink">{rawText}</p>
              </button>

              <button
                type="button"
                onClick={() => { setUseAi(true); toggleMutation.mutate(true); }}
                className={`relative rounded-[6px] border-2 p-4 text-left transition-all ${
                  useAi ? 'border-primary ring-2 ring-primary/10' : 'border-hairline'
                }`}
              >
                {useAi && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Sparkles className="h-3 w-3" /> AI Enhanced
                </p>
                <p className="text-sm leading-relaxed text-ink">{aiText}</p>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
