import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/api/auth/register', form);
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    }
  };

  return (
    <div className="min-h-screen bg-surface-alt px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">Start organizing work with a real account.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div> : null}
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Email</span>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-text-secondary">Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm" required />
            </label>
            <button type="submit" className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-white">Create account</button>
          </form>
          <div className="mt-4 text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="text-primary">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
