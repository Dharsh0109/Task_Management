import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="mt-2 text-sm text-text-secondary">Sign in to continue managing your work.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm" required />
            </label>
            <button type="submit" className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white">Login</button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-text-secondary">
            <Link to="/register" className="text-primary">Create account</Link>
            <Link to="/forgot-password" className="text-primary">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
