import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Sparkles, Trash2, ChevronUp, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createExperience, updateExperience, deleteExperience, enhanceExperience as enhanceExpApi,
  reorderExperiences,
} from '../../api/resumes';
import { Button, Input } from '../ui';

function ExperienceForm({ resumeId, initial, onDone, onCancel }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(
    initial ? {
      ...initial,
      start_date: initial.start_date?.slice(0, 7) || '',
      end_date: initial.end_date?.slice(0, 7) || '',
    } : {
      job_title: '', company: '', location: '',
      start_date: '', end_date: '', is_current: false,
      raw_description: '',
    },
  );
  const [aiText, setAiText] = useState(initial?.ai_enhanced_description || '');
  const [showAi, setShowAi] = useState(false);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        resume: resumeId,
        start_date: form.start_date ? `${form.start_date}-01` : null,
        end_date: form.is_current ? null : form.end_date ? `${form.end_date}-01` : null,
      };
      return initial
        ? updateExperience(initial.id, payload)
        : createExperience(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success(initial ? 'Experience updated' : 'Experience added');
      onDone();
    },
    onError: () => toast.error('Failed to save experience'),
  });

  const enhanceMutation = useMutation({
    mutationFn: () => {
      if (initial) {
        return enhanceExpApi(resumeId, { experience_id: initial.id });
      }
      return saveMutation.mutateAsync().then(() => {
        return enhanceExpApi(resumeId, { experience_id: initial?.id });
      });
    },
    onSuccess: (data) => {
      setAiText(data?.enhanced_text || '');
      setShowAi(true);
      toast.success('Description enhanced!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
    onError: () => toast.error('Failed to enhance'),
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mb-4 rounded-[6px] border border-hairline bg-canvas-soft p-4">
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Input label="Job Title *" value={form.job_title} onChange={(e) => update('job_title', e.target.value)} placeholder="Senior Engineer" />
          <Input label="Company *" value={form.company} onChange={(e) => update('company', e.target.value)} placeholder="Acme Corp" />
          <Input label="Location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="San Francisco, CA" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Start date</label>
              <input type="month" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">End date</label>
              <input type="month" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} className="input-field" disabled={form.is_current} />
            </div>
          </div>
        </div>

        <label className="mb-3 flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.is_current}
            onChange={(e) => update('is_current', e.target.checked)}
            className="rounded border-hairline-strong text-primary focus:ring-primary"
          />
          I currently work here
        </label>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-ink">Job description</label>
          <textarea
            value={form.raw_description}
            onChange={(e) => update('raw_description', e.target.value)}
            placeholder="Add rough bullet points, responsibilities, achievements..."
            className="input-field min-h-[100px] resize-y"
          />
        </div>

        <AnimatePresence>
          {showAi && aiText && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 rounded-[6px] border border-primary/20 bg-primary/5 p-3"
            >
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> AI Enhanced
              </p>
              <p className="text-sm text-ink whitespace-pre-wrap">{aiText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => enhanceMutation.mutate()} disabled={enhanceMutation.isPending}>
              <Sparkles className="h-3.5 w-3.5" /> Enhance
            </Button>
          </div>
          <div className="flex gap-2">
            {onCancel && <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
            <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {initial ? 'Update' : 'Add'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExperienceStep({ resumeId, experiences }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const delMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success('Experience deleted');
    },
  });

  const moveItem = (index, dir) => {
    const items = [...experiences];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    const payload = items.map((item, i) => ({ id: item.id, order: i }));
    reorderExperiences(payload).then(() => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium text-ink">Work Experience</h2>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); }}>
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <ExperienceForm
            resumeId={resumeId}
            initial={editingId ? experiences.find((e) => e.id === editingId) : null}
            onDone={() => { setShowForm(false); setEditingId(null); }}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {experiences?.map((exp, i) => (
          <motion.div
            key={exp.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative rounded-[6px] border border-hairline bg-canvas p-4"
          >
            <div className="absolute left-1 top-1/2 flex -translate-y-1/2 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="rounded p-0.5 text-ink-mute hover:text-ink disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
              <button onClick={() => moveItem(i, 1)} disabled={i === experiences.length - 1} className="rounded p-0.5 text-ink-mute hover:text-ink disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
            </div>

            <div className="pl-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{exp.job_title}</p>
                  <p className="text-sm text-ink-mute">{exp.company}{exp.location ? ` — ${exp.location}` : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setShowForm(true); setEditingId(exp.id); }}
                    className="rounded p-1.5 text-ink-mute hover:bg-canvas-soft hover:text-ink"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete?')) delMutation.mutate(exp.id); }}
                    className="rounded p-1.5 text-ink-mute hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-1 text-xs text-ink-mute">
                {exp.start_date ? new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                {' – '}
                {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
              </p>

              <div className="mt-2 text-sm text-ink-mute whitespace-pre-wrap">
                {exp.use_ai_version && exp.ai_enhanced_description
                  ? exp.ai_enhanced_description
                  : exp.raw_description}
              </div>

              {exp.ai_enhanced_description && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {exp.use_ai_version ? (
                    <span className="text-primary flex items-center gap-0.5"><Sparkles className="h-3 w-3" /> AI version</span>
                  ) : (
                    <span className="text-ink-mute">Original version</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
