import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();

  const profile = useMemo(() => ({
    name: user?.name || 'User',
    email: user?.email || 'No email available',
  }), [user]);

  return (
    <div className="min-h-screen bg-surface-alt p-4 md:p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-text-primary">Settings</h1>
              <p className="mt-1 text-sm text-text-secondary">Manage your account and workspace preferences.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/dashboard" className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">Back to dashboard</Link>
              <Link to="/analytics" className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">Analytics</Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-md border border-border bg-surface p-4">
            <h2 className="font-display text-lg font-semibold text-text-primary">Profile</h2>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              <div className="rounded-md border border-border bg-surface-alt p-3">
                <div className="text-xs uppercase tracking-wide text-text-secondary">Name</div>
                <div className="mt-1 font-medium text-text-primary">{profile.name}</div>
              </div>
              <div className="rounded-md border border-border bg-surface-alt p-3">
                <div className="text-xs uppercase tracking-wide text-text-secondary">Email</div>
                <div className="mt-1 font-medium text-text-primary">{profile.email}</div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-4">
            <h2 className="font-display text-lg font-semibold text-text-primary">Account</h2>
            <p className="mt-2 text-sm text-text-secondary">Sign out of your current session whenever you need to switch accounts.</p>
            <button onClick={() => logout()} className="mt-4 rounded-md bg-danger px-3 py-2 text-sm font-medium text-white">Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
