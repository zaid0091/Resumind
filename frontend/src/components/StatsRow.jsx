import { motion } from 'framer-motion';
import { FileText, Sparkles, Clock } from 'lucide-react';

function timeAgo(dateStr) {
  if (!dateStr) return 'N/A';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const statCards = [
  {
    icon: FileText,
    label: 'Total Resumes',
    getValue: (resumes) => resumes?.length ?? 0,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Sparkles,
    label: 'AI Enhanced',
    getValue: (resumes) => resumes?.filter((r) => r.is_ai_enhanced).length ?? 0,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Clock,
    label: 'Last Updated',
    getValue: (resumes) => {
      if (!resumes?.length) return '—';
      const sorted = [...resumes].sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      );
      return timeAgo(sorted[0].updated_at);
    },
    color: 'text-ink-mute',
    bg: 'bg-canvas-soft',
  },
];

export default function StatsRow({ resumes }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3 rounded-[6px] border border-hairline bg-canvas p-4"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-[6px] ${stat.bg} ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-mute">{stat.label}</p>
            <p className={`text-xl font-medium ${stat.color}`}>
              {stat.getValue(resumes)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
