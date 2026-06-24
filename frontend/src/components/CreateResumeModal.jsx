import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { createResume } from '../api/resumes';

const templates = [
  {
    id: 'modern',
    label: 'Modern',
    desc: 'Two-column with sidebar',
    preview: (
      <div className="flex h-full overflow-hidden rounded-[6px] border border-hairline">
        <div className="w-1/3 bg-canvas-night p-2">
          <div className="mb-2 h-2 w-3/4 rounded bg-white/20" />
          <div className="mb-1 h-1.5 w-full rounded bg-white/15" />
          <div className="mb-1 h-1.5 w-5/6 rounded bg-white/15" />
          <div className="mt-3 h-1.5 w-full rounded bg-primary/70" />
          <div className="mt-1 h-1.5 w-4/5 rounded bg-white/15" />
        </div>
        <div className="flex-1 bg-white p-2">
          <div className="mb-2 h-2 w-1/2 rounded bg-ink" />
          <div className="mb-1 h-1 rounded bg-hairline" />
          <div className="mb-1 h-1 w-4/5 rounded bg-hairline" />
          <div className="mt-2 h-1 w-full rounded bg-primary/50" />
          <div className="mt-1 h-1 w-11/12 rounded bg-hairline" />
        </div>
      </div>
    ),
  },
  {
    id: 'classic',
    label: 'Classic',
    desc: 'Single-column traditional',
    preview: (
      <div className="h-full overflow-hidden rounded-[6px] border border-hairline bg-white p-2">
        <div className="mx-auto mb-2 h-2 w-1/2 rounded bg-ink" />
        <div className="mx-auto mb-2 flex justify-center gap-2">
          <div className="h-1 w-8 rounded bg-ink-mute" />
          <div className="h-1 w-8 rounded bg-ink-mute" />
          <div className="h-1 w-8 rounded bg-ink-mute" />
        </div>
        <div className="mb-1 h-px w-full bg-hairline" />
        <div className="mt-2 h-1 w-full rounded bg-ink" />
        <div className="mt-1 h-1 w-11/12 rounded bg-hairline" />
        <div className="mt-1 h-1 w-10/12 rounded bg-hairline" />
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimal',
    desc: 'Clean whitespace design',
    preview: (
      <div className="h-full overflow-hidden rounded-[6px] border border-hairline bg-white p-2">
        <div className="mb-3 h-2.5 w-1/3 rounded bg-ink" />
        <div className="mb-2 flex gap-2">
          <div className="h-1 w-12 rounded bg-ink-mute" />
          <div className="h-1 w-16 rounded bg-ink-mute" />
        </div>
        <div className="mb-1 h-px w-full bg-hairline" />
        <div className="mt-2 h-1 w-full rounded bg-ink-mute" />
        <div className="mt-1 h-1 w-4/5 rounded bg-hairline" />
        <div className="mt-3 h-px w-full bg-hairline" />
        <div className="mt-2 h-1 w-3/4 rounded bg-hairline" />
        <div className="mt-1 h-1 w-2/3 rounded bg-hairline" />
      </div>
    ),
  },
];

export default function CreateResumeModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const mutation = useMutation({
    mutationFn: () => createResume({ title: title || 'Untitled Resume', template: selectedTemplate }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume created!');
      onClose();
      navigate(`/builder/${data.id}`);
    },
    onError: () => toast.error('Failed to create resume'),
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="card-elevated w-full max-w-lg p-6 scale-in">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-ink">Create New Resume</h2>
                  <p className="text-sm text-ink-mute">Choose a template and get started</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-[6px] p-1.5 text-ink-mute hover:bg-canvas-soft hover:text-ink transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-5">
                <label className="label">Resume title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Resume"
                  className="input-field"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !mutation.isPending) {
                      mutation.mutate();
                    }
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="label mb-2.5">Choose template</label>
                <div className="grid grid-cols-3 gap-3">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`group relative overflow-hidden rounded-[6px] border-2 p-2 text-left transition-all ${
                        selectedTemplate === tpl.id
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-hairline hover:border-hairline-strong'
                      }`}
                    >
                      <div className="mb-2 h-20">{tpl.preview}</div>
                      <p className="text-sm font-medium text-ink">{tpl.label}</p>
                      <p className="text-xs text-ink-mute">{tpl.desc}</p>

                      {selectedTemplate === tpl.id && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary shadow-md">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="btn-secondary-outline">
                  Cancel
                </button>
                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending}
                  className="btn-primary-green"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {mutation.isPending ? 'Creating...' : 'Create Resume'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
