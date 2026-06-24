import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles, Eye, Trash2, Edit3 } from 'lucide-react';
import { deleteResume } from '../api/resumes';

const templateColors = {
  modern: 'badge-primary',
  classic: 'badge-warning',
  minimal: 'bg-canvas-soft text-ink',
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ResumeCard({ resume }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteResume(resume.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted successfully');
    },
    onError: () => toast.error('Failed to delete resume'),
  });

  const handleDelete = () => {
    const modal = document.getElementById(`delete-modal-${resume.id}`);
    if (modal) modal.showModal();
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="card-elevated group relative cursor-pointer"
      >
        <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/builder/${resume.id}`); }}
            className="rounded-[6px] p-1.5 text-ink-mute hover:bg-canvas-soft hover:text-ink transition-colors"
            title="Edit"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/preview/${resume.id}`); }}
            className="rounded-[6px] p-1.5 text-ink-mute hover:bg-canvas-soft hover:text-ink transition-colors"
            title="Preview"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="rounded-[6px] p-1.5 text-ink-mute hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>

        <h3
          className="cursor-pointer truncate text-base font-medium text-ink hover:text-primary transition-colors"
          onClick={() => navigate(`/builder/${resume.id}`)}
        >
          {resume.title}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <span className={templateColors[resume.template] || templateColors.modern}>
            {resume.template}
          </span>
          {resume.is_ai_enhanced && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-ink-mute">
            <span>Completion</span>
            <span className="font-medium">{resume.completion_percentage}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-hairline">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${resume.completion_percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        <div className="mt-4 border-t border-hairline pt-3 text-xs text-ink-mute">
          Updated {timeAgo(resume.updated_at)}
        </div>
      </motion.div>

      <dialog
        id={`delete-modal-${resume.id}`}
        className="rounded-[12px] border border-hairline bg-canvas p-6 shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:flex open:flex-col open:gap-4 max-w-xs"
      >
        <h3 className="text-lg font-medium text-ink">Delete resume?</h3>
        <p className="text-sm text-ink-mute">
          Are you sure you want to delete &ldquo;{resume.title}&rdquo;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => document.getElementById(`delete-modal-${resume.id}`)?.close()}
            className="btn-secondary-outline py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              document.getElementById(`delete-modal-${resume.id}`)?.close();
              deleteMutation.mutate();
            }}
            className="btn-danger py-2 text-sm"
          >
            Delete
          </button>
        </div>
      </dialog>
    </>
  );
}
