import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/api';

import logo from '../assets/logo-new.png';
import bgImage from '../assets/logo-bg.png';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* dim overlay so the card stays readable against any background */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <img src={logo} alt="CenturyPly" className="mx-auto mb-3 h-12 w-auto" />
          <h1 className="text-2xl font-semibold text-slate-900">CenturyPly</h1>
          <p className="mt-1 text-xs font-medium tracking-wide text-slate-500">
            INTERNAL COMPANY PORTAL
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-slate-700">
            Username or Employee ID
            <div className="relative mt-2">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. CP_12345"
                className="w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
          </label>

          <label className="block text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <span>Password</span>
            </div>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/90 py-3 pl-10 pr-10 text-slate-900"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Stay signed in for 30 days
          </label>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Secure Login'}
            {!submitting && <span aria-hidden>→</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;