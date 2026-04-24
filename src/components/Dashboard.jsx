import React from 'react';
import { Briefcase, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Dashboard({ jobs }) {
  const stats = {
    total: jobs.length,
    saved: jobs.filter(j => j.status === 'Saved').length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    inProcess: jobs.filter(j => j.status === 'In process').length,
    accepted: jobs.filter(j => j.status === 'Accepted').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  const statCards = [
    { label: 'Total Jobs', value: stats.total, icon: Briefcase, color: 'var(--primary)' },
    { label: 'Saved', value: stats.saved, icon: Clock, color: 'var(--text-muted)' },
    { label: 'Applied', value: stats.applied, icon: CheckCircle2, color: '#3b82f6' },
    { label: 'In Process', value: stats.inProcess, icon: Clock, color: 'var(--warning)' },
    { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, color: 'var(--success)' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'var(--danger)' }
  ];

  return (
    <div>
      <h2 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Dashboard Overview</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>A quick glance at your job hunt progress.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {statCards.map((s, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="flex-between">
              <span className="text-muted">{s.label}</span>
              <s.icon size={20} color={s.color} />
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 600 }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
