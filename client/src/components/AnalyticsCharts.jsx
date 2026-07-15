import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['#2563eb', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

const Card = ({ label, value, hint }) => (
  <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
    <div className="text-sm text-text-secondary">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-text-primary">{value}</div>
    {hint ? <div className="mt-1 text-xs text-text-secondary">{hint}</div> : null}
  </div>
);

const AnalyticsCharts = ({ summary, completionSeries, statusBreakdown, priorityBreakdown, burndownSeries }) => {
  const statusData = statusBreakdown.map((item) => ({ name: item._id || 'unknown', value: item.count }));
  const priorityData = priorityBreakdown.map((item) => ({ name: item._id || 'unknown', value: item.count }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Total tasks" value={summary.totalTasks} hint="All tasks in the selected scope" />
        <Card label="Completed this week" value={summary.completedThisWeek} hint="Finished in the last 7 days" />
        <Card label="Overdue" value={summary.overdueCount} hint="Open tasks past due date" />
        <Card label="Completion rate" value={`${summary.completionRate}%`} hint="Completed vs total tasks" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-text-primary">Completion trend</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-text-primary">Status breakdown</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2}>
                  {statusData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-text-primary">Priority breakdown</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-text-primary">Burndown</div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="remaining" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
