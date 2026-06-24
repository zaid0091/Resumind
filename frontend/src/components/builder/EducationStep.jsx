import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createEducation, updateEducation, deleteEducation, reorderEducation,
} from '../../api/resumes';
import { Button, Input } from '../ui';

function EducationForm({ resumeId, initial, onDone, onCancel }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(
    initial || {
      degree: '', institution: '', location: '',
      start_year: '', end_year: '', gpa: '', honors: '',
    },
  );

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        resume: resumeId,
        start_year: form.start_year ? Number(form.start_year) : null,
        end_year: form.end_year ? Number(form.end_year) : null,
        gpa: form.gpa ? Number(form.gpa) : null,
      };
      return initial
        ? updateEducation(initial.id, payload)
        : createEducation(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success(initial ? 'Education updated' : 'Education added');
      onDone();
    },
    onError: () => toast.error('Failed to save education'),
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Degree *" value={form.degree} onChange={(e) => update('degree', e.target.value)} placeholder="B.S. Computer Science" />
          <Input label="Institution *" value={form.institution} onChange={(e) => update('institution', e.target.value)} placeholder="Stanford University" />
          <Input label="Location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Stanford, CA" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Start year</label>
              <input type="number" value={form.start_year} onChange={(e) => update('start_year', e.target.value)} className="input-field" placeholder="2018" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">End year</label>
              <input type="number" value={form.end_year} onChange={(e) => update('end_year', e.target.value)} className="input-field" placeholder="2022" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">GPA</label>
              <input type="number" step="0.01" min="0" max="4" value={form.gpa} onChange={(e) => update('gpa', e.target.value)} className="input-field" placeholder="3.8" />
            </div>
            <Input label="Honors" value={form.honors} onChange={(e) => update('honors', e.target.value)} placeholder="Cum Laude" />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {onCancel && <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>}
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {initial ? 'Update' : 'Add'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function EducationStep({ resumeId, education }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const queryClient = useQueryClient();

  const delMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success('Education deleted');
    },
  });

  const moveItem = (index, dir) => {
    const items = [...education];
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    const payload = items.map((item, i) => ({ id: item.id, order: i }));
    reorderEducation(payload).then(() => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium text-ink">Education</h2>
        {!showForm && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); }}>
            <Plus className="h-4 w-4" /> Add Education
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <EducationForm
            resumeId={resumeId}
            initial={editingId ? education.find((e) => e.id === editingId) : null}
            onDone={() => { setShowForm(false); setEditingId(null); }}
            onCancel={() => { setShowForm(false); setEditingId(null); }}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {education?.map((edu, i) => (
          <motion.div
            key={edu.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative rounded-[6px] border border-hairline bg-canvas p-4"
          >
            <div className="absolute left-1 top-1/2 flex -translate-y-1/2 flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="rounded p-0.5 text-ink-mute hover:text-ink disabled:opacity-30"><ChevronUp className="h-3 w-3" /></button>
              <button onClick={() => moveItem(i, 1)} disabled={i === education.length - 1} className="rounded p-0.5 text-ink-mute hover:text-ink disabled:opacity-30"><ChevronDown className="h-3 w-3" /></button>
            </div>

            <div className="pl-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{edu.degree}</p>
                  <p className="text-sm text-ink-mute">{edu.institution}{edu.location ? ` — ${edu.location}` : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setShowForm(true); setEditingId(edu.id); }}
                    className="rounded p-1.5 text-ink-mute hover:bg-canvas-soft hover:text-ink"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete?')) delMutation.mutate(edu.id); }}
                    className="rounded p-1.5 text-ink-mute hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-ink-mute">{edu.start_year} – {edu.end_year || 'Present'}</p>
              {(edu.gpa || edu.honors) && (
                <p className="mt-1 text-sm text-ink-mute">
                  {edu.gpa && `GPA: ${edu.gpa}`}{edu.gpa && edu.honors ? ' | ' : ''}{edu.honors}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
