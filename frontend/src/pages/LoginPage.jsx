import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { loginUser } from '../api/resumes';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const storeLogin = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email: form.email, password: form.password });
      const user = data.user?.name ? data.user : { ...data.user, name: data.user?.username || data.user?.email?.split('@')[0] || 'User' };
      storeLogin({ access: data.access, refresh: data.refresh }, user);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="card-elevated w-full max-w-md p-8 scale-in">
        <div className="mb-8 text-center">
          <Link to="/" className="mb-6 inline-flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-hairline bg-canvas">
              <span className="text-sm font-medium text-primary">R</span>
            </div>
          </Link>
          <h1 className="text-2xl font-medium text-ink tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-mute">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-mute">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-deep transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
