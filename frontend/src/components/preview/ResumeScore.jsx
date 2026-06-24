import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const CATEGORIES = [
  { key: 'personal_info', label: 'Personal Info', max: 20, getScore: (r) => (r.personal_info?.full_name ? 20 : 0) },
  { key: 'summary', label: 'Summary', max: 15, getScore: (r) => (r.summary?.raw_text ? 15 : 0) },
  { key: 'experience', label: 'Experience', max: 30, getScore: (r) => Math.min((r.experiences?.length || 0) * 10, 30) },
  { key: 'education', label: 'Education', max: 15, getScore: (r) => Math.min((r.education?.length || 0) * 7.5, 15) },
  { key: 'skills', label: 'Skills', max: 10, getScore: (r) => Math.min((r.skills?.length || 0) * 2, 10) },
  { key: 'projects', label: 'Projects', max: 10, getScore: (r) => Math.min((r.projects?.length || 0) * 5, 10) },
];

function getColor(score) {
  if (score >= 71) return { bg: 'bg-primary', text: 'text-primary', ring: 'ring-primary/20', label: 'Great' };
  if (score >= 41) return { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-200', label: 'Needs work' };
  return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-200', label: 'Incomplete' };
}

export default function ResumeScore({ resume }) {
  const total = CATEGORIES.reduce((sum, c) => sum + c.getScore(resume), 0);
  const rounded = Math.round(total);
  const colors = getColor(rounded);

  const missing = CATEGORIES.filter((c) => c.getScore(resume) === 0).map((c) => c.label);

  return (
    <div className="rounded-[6px] border border-hairline bg-canvas p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">Resume Score</h3>
        <div className="group relative">
          <Info className="h-3.5 w-3.5 text-ink-mute cursor-help" />
          <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md bg-canvas-night px-3 py-2 text-xs text-on-dark opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Score based on content completeness across all sections.
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#ededed" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(rounded / 100) * 213.6} 213.6`}
              className={colors.text}
              initial={{ strokeDasharray: '0 213.6' }}
              animate={{ strokeDasharray: `${(rounded / 100) * 213.6} 213.6` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <span className={`text-2xl font-medium ${colors.text}`}>{rounded}</span>
        </div>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map((cat) => {
          const score = cat.getScore(resume);
          return (
            <div key={cat.key}>
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="text-ink-mute">{cat.label}</span>
                <span className="font-medium text-ink-mute">{score}/{cat.max}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / cat.max) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * CATEGORIES.indexOf(cat) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <div className="mt-3 rounded-[6px] bg-amber-50 p-2.5">
          <p className="mb-1 text-xs font-medium text-amber-800">Add these sections:</p>
          <ul className="space-y-0.5">
            {missing.map((m) => (
              <li key={m} className="flex items-center gap-1.5 text-xs text-amber-700">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
