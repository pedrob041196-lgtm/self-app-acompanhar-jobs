import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, CalendarCheck, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import JobTracker from './components/JobTracker';
import TaskPlanner from './components/TaskPlanner';
import Templates from './components/Templates';
import ResumeBuilder from './components/ResumeBuilder';
import { User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('self_jobs')) || []);
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('self_tasks')) || []);
  const [templates, setTemplates] = useState(() => JSON.parse(localStorage.getItem('self_templates')) || []);
  const [resumeData, setResumeData] = useState(() => JSON.parse(localStorage.getItem('self_resume')) || {
    name: '', title: '', email: '', phone: '', link: '', summary: '', skills: '', experiences: []
  });

  useEffect(() => { localStorage.setItem('self_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('self_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('self_templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('self_resume', JSON.stringify(resumeData)); }, [resumeData]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>SELF.</h1>
          <p className="text-muted" style={{ fontSize: '0.8rem' }}>Productivity & Jobs</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'jobs', icon: Briefcase, label: 'Job Opportunities' },
            { id: 'resume', icon: User, label: 'Resume Builder' },
            { id: 'tasks', icon: CalendarCheck, label: 'Task Planner' },
            { id: 'templates', icon: FileText, label: 'Templates' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                background: activeTab === item.id ? 'var(--bg-hover)' : 'transparent',
                color: activeTab === item.id ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === item.id ? 500 : 400,
                textAlign: 'left'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && <Dashboard jobs={jobs} tasks={tasks} />}
          {activeTab === 'jobs' && <JobTracker jobs={jobs} setJobs={setJobs} resumeData={resumeData} />}
          {activeTab === 'resume' && <ResumeBuilder resumeData={resumeData} setResumeData={setResumeData} />}
          {activeTab === 'tasks' && <TaskPlanner tasks={tasks} setTasks={setTasks} />}
          {activeTab === 'templates' && <Templates templates={templates} setTemplates={setTemplates} />}
        </div>
      </main>
    </div>
  );
}
