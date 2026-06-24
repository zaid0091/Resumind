import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createSkill, deleteSkill,
  createProject, updateProject, deleteProject, enhanceProject as enhanceProjApi,
} from '../../api/resumes';
import { Button, Input } from '../ui';

const categoryColors = {
  technical: 'bg-primary/10 text-primary',
  soft: 'bg-primary/10 text-primary',
  language: 'bg-accent-purple/10 text-accent-purple',
  tool: 'bg-amber-50 text-amber-700',
};

/* ─── Skills Tab ─── */
function SkillsTab({ resumeId, skills }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('technical');
  const [proficiency, setProficiency] = useState(3);

  const addMutation = useMutation({
    mutationFn: () => createSkill({ resume: resumeId, name, category, proficiency }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      setName('');
      setCategory('technical');
      setProficiency(3);
    },
    onError: () => toast.error('Failed to add skill'),
  });

  const delMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && name.trim()) {
      e.preventDefault();
      addMutation.mutate();
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-ink-mute">Skill name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type skill and press Enter"
            className="input-field"
          />
        </div>
        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-ink-mute">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            <option value="technical">Technical</option>
            <option value="soft">Soft</option>
            <option value="language">Language</option>
            <option value="tool">Tool</option>
          </select>
        </div>
        <div className="w-24">
          <label className="mb-1 block text-xs font-medium text-ink-mute">Level (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={proficiency}
            onChange={(e) => setProficiency(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <Button size="sm" onClick={() => addMutation.mutate()} disabled={!name.trim() || addMutation.isPending}>
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills?.map((skill) => (
          <motion.span
            key={skill.id}
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${categoryColors[skill.category] || categoryColors.technical}`}
          >
            {skill.name}
            <button onClick={() => delMutation.mutate(skill.id)} className="ml-0.5 rounded-full p-0.5 hover:bg-black/10">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
        {(!skills || skills.length === 0) && (
          <p className="py-2 text-sm text-ink-mute">No skills added yet. Type a skill name above and press Enter.</p>
        )}
      </div>

      {skills?.length > 0 && (
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-mute">
          <span>1</span>
          <div className="h-1 flex-1 rounded-full bg-hairline">
            <div className="h-1 rounded-full bg-primary" style={{ width: `${(proficiency / 5) * 100}%` }} />
          </div>
          <span>5</span>
        </div>
      )}
    </div>
  );
}

/* ─── Projects Tab ─── */
function ProjectsTab({ resumeId, projects }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', tech_stack: '', url: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  const createMutation = useMutation({
    mutationFn: () => createProject({ ...form, resume: resumeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      setForm({ title: '', tech_stack: '', url: '', description: '' });
      setShowForm(false);
      toast.success('Project added');
    },
    onError: () => toast.error('Failed to add project'),
  });

  const delMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
      toast.success('Project deleted');
    },
  });

  const enhanceMutation = useMutation({
    mutationFn: (projectId) => enhanceProjApi(resumeId, { project_id: projectId }),
    onSuccess: () => {
      toast.success('Project enhanced!');
      queryClient.invalidateQueries({ queryKey: ['resume', resumeId] });
    },
    onError: () => toast.error('Failed to enhance project'),
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-4">
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden rounded-[6px] border border-hairline bg-canvas-soft p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} />
              <Input label="Tech Stack" value={form.tech_stack} onChange={(e) => update('tech_stack', e.target.value)} placeholder="React, Node.js, PostgreSQL" />
              <div className="sm:col-span-2">
                <Input label="URL" value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-ink">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Describe your project..." />
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>Add</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {projects?.map((proj) => (
          <motion.div
            key={proj.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[6px] border border-hairline bg-canvas p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-ink">{proj.title}</p>
                <p className="text-sm text-ink-mute">{proj.tech_stack}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => enhanceMutation.mutate(proj.id)}
                  disabled={enhanceMutation.isPending}
                >
                  <Sparkles className="h-3 w-3" />
                </Button>
                <button
                  onClick={() => { if (confirm('Delete?')) delMutation.mutate(proj.id); }}
                  className="rounded p-1.5 text-ink-mute hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm text-ink-mute">
              {proj.ai_enhanced_description || proj.description}
            </div>
            {proj.url && (
              <a href={proj.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-primary hover:underline">
                {proj.url}
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function SkillsProjectsStep({ resumeId, skills, projects }) {
  const [tab, setTab] = useState('skills');

  return (
    <div>
      <h2 className="mb-6 text-xl font-medium text-ink">Skills &amp; Projects</h2>

      <div className="mb-6 flex gap-1 rounded-[6px] bg-canvas-soft p-1">
        <button
          onClick={() => setTab('skills')}
          className={`flex-1 rounded-[6px] px-4 py-2 text-sm font-medium transition-all ${
            tab === 'skills' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-mute hover:text-ink'
          }`}
        >
          Skills
        </button>
        <button
          onClick={() => setTab('projects')}
          className={`flex-1 rounded-[6px] px-4 py-2 text-sm font-medium transition-all ${
            tab === 'projects' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-mute hover:text-ink'
          }`}
        >
          Projects
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'skills' ? (
          <motion.div key="skills" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <SkillsTab resumeId={resumeId} skills={skills} />
          </motion.div>
        ) : (
          <motion.div key="projects" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <ProjectsTab resumeId={resumeId} projects={projects} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
