import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import CreateResumeModal from '../components/CreateResumeModal';
import { getResumes, deleteResume } from '../api/resumes';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    getResumes()
      .then((data) => setResumes(data || []))
      .catch(() => setResumes([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || 'Failed to delete resume';
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-[6px] bg-hairline shimmer" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated space-y-3">
              <div className="h-5 w-40 rounded bg-hairline shimmer" />
              <div className="h-4 w-28 rounded bg-hairline-cool shimmer" />
              <div className="h-8 w-24 rounded bg-hairline-cool-2 shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in-up">
      <CreateResumeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-ink tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-mute">Welcome back, {user?.name || user?.username}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon />
          New Resume
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <FileIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-medium text-ink">{resumes.length}</p>
              <p className="text-xs text-ink-mute">Total Resumes</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-primary/10 text-primary">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-medium text-ink">{resumes.filter((r) => r.completed).length}</p>
              <p className="text-xs text-ink-mute">Completed</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-ink-faint/10 text-ink-mute">
              <ClockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-medium text-ink">{resumes.filter((r) => !r.completed).length}</p>
              <p className="text-xs text-ink-mute">In Progress</p>
            </div>
          </div>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[12px] bg-primary/10">
            <FilePlusIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-ink">No resumes yet</h3>
          <p className="mt-1 text-sm text-ink-mute">Create your first resume to get started.</p>
          <Button className="mt-6" onClick={() => setShowCreateModal(true)}>
            <PlusIcon />
            Create Resume
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume, idx) => (
            <div
              key={resume.id}
              className="card-elevated group cursor-pointer"
              style={{ animationDelay: `${idx * 80}ms` }}
              onClick={() => navigate(`/builder/${resume.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-ink">
                    {resume.title || 'Untitled Resume'}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-mute">
                    Updated {new Date(resume.updated_at || resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {resume.completed && (
                  <span className="badge-success shrink-0 ml-2">Done</span>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/builder/${resume.id}`); }}
                  className="btn-ghost px-3 py-1 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/preview/${resume.id}`); }}
                  className="btn-ghost px-3 py-1 text-xs"
                >
                  Preview
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(resume.id); }}
                  className="btn-ghost px-3 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function FileIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
}

function CheckCircleIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function ClockIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}

function FilePlusIcon({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
}
