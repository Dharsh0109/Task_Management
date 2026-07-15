import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import AnalyticsCharts from '../components/AnalyticsCharts';

const AnalyticsPage = () => {
  const [project, setProject] = useState('');
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/api/projects');
      return response.data;
    },
    staleTime: 10000,
  });

  const { data: analytics = { summary: { totalTasks: 0, completedThisWeek: 0, overdueCount: 0, completionRate: 0 }, completionSeries: [], statusBreakdown: [], priorityBreakdown: [], burndownSeries: [] } } = useQuery({
    queryKey: ['analytics', project],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (project) params.set('project', project);
      const response = await api.get(`/api/tasks/analytics?${params.toString()}`);
      return response.data;
    },
    staleTime: 10000,
  });

  return (
    <div className="min-h-screen bg-surface-alt p-4 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-semibold text-text-primary">Analytics</h1>
              <p className="mt-1 text-sm text-text-secondary">Track completion, urgency, and workload trends.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to="/dashboard" className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">Back to dashboard</Link>
              <Link to="/settings" className="rounded-md border border-border px-3 py-2 text-sm text-text-secondary">Settings</Link>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-4">
          <label className="mb-3 block text-sm text-text-secondary">
            <span className="mb-1 block">Project focus</span>
            <select value={project} onChange={(event) => setProject(event.target.value)} className="w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-text-primary">
              <option value="">All projects</option>
              {projects.map((item) => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </label>

          <AnalyticsCharts
            summary={analytics.summary}
            completionSeries={analytics.completionSeries}
            statusBreakdown={analytics.statusBreakdown}
            priorityBreakdown={analytics.priorityBreakdown}
            burndownSeries={analytics.burndownSeries}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
