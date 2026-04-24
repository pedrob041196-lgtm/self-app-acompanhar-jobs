import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, ExternalLink, Edit2, Trash2, Zap, ChevronDown, ChevronRight } from 'lucide-react';

export default function JobTracker({ jobs, setJobs, resumeData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('self_categories');
    return saved ? JSON.parse(saved) : ['Translation', 'Proofreading', 'AI Evaluation'];
  });

  const [langOpen, setLangOpen] = useState(false);
  const availableLangs = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian', 'Other'];

  const [newCatModal, setNewCatModal] = useState(false);
  const [newCatValue, setNewCatValue] = useState('');

  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [expandedJobs, setExpandedJobs] = useState([]);

  const defaultForm = {
    id: '', link: '', company: '', title: '', requirements: '', responsibilities: '', languages: '',
    tools: '', category: categories[0] || '', status: 'Saved', difficulty: 0, lastAction: new Date().toISOString().split('T')[0]
  };

  const [form, setForm] = useState(defaultForm);

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (newCatValue && newCatValue.trim()) {
      const updated = [...categories, newCatValue.trim()];
      setCategories(updated);
      localStorage.setItem('self_categories', JSON.stringify(updated));
      setForm(prev => ({ ...prev, category: newCatValue.trim() }));
    }
    setNewCatModal(false);
    setNewCatValue('');
  };

  const handleStatusChange = (id, newStatus) => {
    setJobs(jobs.map(j => {
      if (j.id === id && j.status !== newStatus) {
        return { ...j, status: newStatus, lastAction: new Date().toISOString().split('T')[0] };
      }
      return j;
    }));
  };

  const calcDifficulty = (f) => {
    let score = 20; 
    if(f.requirements?.length > 100) score += 10;
    if(f.requirements?.length > 300) score += 15;
    if(f.responsibilities?.length > 100) score += 10;
    if(f.responsibilities?.length > 300) score += 15;
    
    const langs = f.languages ? f.languages.split(',').filter(Boolean).length : 0;
    score += langs * 5;
    
    const tools = f.tools ? f.tools.split(',').filter(Boolean).length : 0;
    score += tools * 5;

    return Math.min(100, score);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalForm = { ...form, difficulty: calcDifficulty(form) };
    
    if (editingJob) {
      const original = jobs.find(j => j.id === finalForm.id);
      const isChanged = Object.keys(finalForm).some(k => k !== 'lastAction' && finalForm[k] !== original[k]);
      if (isChanged) finalForm.lastAction = new Date().toISOString().split('T')[0];
      
      setJobs(jobs.map(j => j.id === finalForm.id ? finalForm : j));
    } else {
      finalForm.lastAction = new Date().toISOString().split('T')[0];
      setJobs([{ ...finalForm, id: uuidv4() }, ...jobs]);
    }
    setIsModalOpen(false);
    setForm(defaultForm);
    setEditingJob(null);
  };

  const toggleLang = (l) => {
    setForm(prev => {
      let arr = prev.languages ? prev.languages.split(',').filter(Boolean) : [];
      if (arr.includes(l)) arr = arr.filter(x => x !== l);
      else arr.push(l);
      return { ...prev, languages: arr.join(',') };
    });
  };

  const handleDelete = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const openEdit = (job) => {
    setForm(job);
    setEditingJob(true);
    setIsModalOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };


  const filteredJobs = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' ? true : j.status === filterStatus;
    const matchType = filterType === 'All' ? true : j.category === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const getCompatibility = (job) => {
    if (!resumeData || (!resumeData.skills && !resumeData.summary && (!resumeData.experiences || resumeData.experiences.length === 0))) return null;

    const resumeText = [
      resumeData.skills,
      resumeData.summary,
      ...(resumeData.experiences || []).map(e => e.title + ' ' + e.description)
    ].join(' ').toLowerCase();

    const jobText = [job.title, job.requirements, job.tools, job.languages].join(' ').toLowerCase();
    const jobWords = jobText.split(/\W+/).filter(w => w.length > 4);

    if (jobWords.length === 0) return null;

    let matches = 0;
    const uniqueJobWords = [...new Set(jobWords)];
    uniqueJobWords.forEach(word => {
      if (resumeText.includes(word)) matches++;
    });

    const score = Math.min(100, Math.round((matches / uniqueJobWords.length) * 100 * 1.5)); // Boost score slightly for fairness
    return score;
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="heading-lg">Job Opportunities</h2>
          <p className="text-muted">Track and manage your applications.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setForm(defaultForm); setEditingJob(null); setIsModalOpen(true); }}
        >
          <Plus size={18} /> Add Job
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
           <option value="All">All Statuses</option>
           <option value="Saved">Saved</option>
           <option value="Applied">Applied</option>
           <option value="In process">In process</option>
           <option value="Rejected">Rejected</option>
           <option value="Accepted">Accepted</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
           <option value="All">All Types</option>
           {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredJobs.length === 0 ? (
          <div className="card text-muted flex-center" style={{ minHeight: '150px' }}>
            No jobs found. Add yours above.
          </div>
        ) : filteredJobs.map(job => (
          <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <button 
                  onClick={() => toggleExpand(job.id)} 
                  className="btn btn-ghost" 
                  style={{ padding: '0.25rem', marginTop: '0.1rem' }}
                >
                  {expandedJobs.includes(job.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                <div>
                  <h3 className="heading-md">{job.title} <span className="text-muted" style={{ fontSize: '1rem', fontWeight: 400 }}>at {job.company}</span></h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select 
                      value={job.status} 
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className={`status-badge status-${job.status.toLowerCase().replace(' ', '-')}`}
                      style={{ fontSize: '0.85rem', padding: '0.25rem 0.6rem', border: 'none', outline: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <option value="Saved">Saved</option>
                      <option value="Applied">Applied</option>
                      <option value="In process">In process</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted">Accepted</option>
                    </select>
                    
                    <span className="status-badge" style={{ background: 'var(--bg-hover)' }}>{job.category}</span>
                    <span className="status-badge" style={{ background: '#f8fafc', border: '1px solid var(--border-color)' }}>Diff: {job.difficulty}/100</span>

                    {getCompatibility(job) !== null && (
                      <span className="status-badge" style={{ background: '#e0e7ff', color: '#4f46e5', display: 'flex', gap: '0.2rem' }}>
                        <Zap size={12} /> Match: {getCompatibility(job)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {job.link && (
                  <a href={job.link} target="_blank" rel="noreferrer" className="btn btn-ghost" title="Open Link">
                    <ExternalLink size={18} />
                  </a>
                )}
                <button onClick={() => openEdit(job)} className="btn btn-ghost" title="Edit"><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(job.id)} className="btn btn-ghost" style={{ color: 'var(--danger)' }} title="Delete"><Trash2 size={18} /></button>
              </div>
            </div>

            {expandedJobs.includes(job.id) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div><strong>Type:</strong> <span className="text-muted">{job.category}</span></div>
                <div><strong>Languages:</strong> <span className="text-muted">{job.languages || 'N/A'}</span></div>
                
                <div><strong>Tools:</strong> <span className="text-muted">{job.tools || 'N/A'}</span></div>
                <div><strong>Last Action Date:</strong> <span className="text-muted">{job.lastAction}</span></div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Requirements:</strong> <div className="text-muted" style={{ marginTop: '0.25rem' }}>{job.requirements || 'N/A'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Responsibilities:</strong> <div className="text-muted" style={{ marginTop: '0.25rem' }}>{job.responsibilities || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1.5rem' }}>{editingJob ? 'Edit Job' : 'Add New Job'}</h3>


            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}><input required type="text" placeholder="Job Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%' }} /></div>
              <div><input required type="text" placeholder="Company *" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} style={{ width: '100%' }} /></div>
              <div><input type="url" placeholder="Job Link" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} style={{ width: '100%' }} /></div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ flex: 1 }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button type="button" className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => setNewCatModal(true)} title="Add Category">
                  <Plus size={16} />
                </button>
              </div>
              <div>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%' }}>
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="In process">In process</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <div 
                   onClick={() => setLangOpen(!langOpen)} 
                   style={{ border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--bg-card)', fontSize: '0.9rem', color: form.languages ? 'var(--text-main)' : 'var(--text-muted)' }}
                >
                  {form.languages || 'Required Languages...'}
                </div>
                {langOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid var(--border-color)', zIndex: 10, maxHeight: '150px', overflowY: 'auto', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                    {availableLangs.map(l => (
                      <label key={l} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={form.languages.split(',').includes(l)} onChange={() => toggleLang(l)} />
                        {l}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div><input type="text" placeholder="Tools (e.g., Trados, Figma)" value={form.tools} onChange={e => setForm({ ...form, tools: e.target.value })} style={{ width: '100%' }} /></div>

              <div style={{ gridColumn: '1 / -1' }}>
                <textarea rows={2} placeholder="Key requirements" value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} style={{ width: '100%' }} />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <textarea rows={2} placeholder="Job responsibilities (optional)" value={form.responsibilities || ''} onChange={e => setForm({ ...form, responsibilities: e.target.value })} style={{ width: '100%' }} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* New Category Modal */}
      {newCatModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div className="card" style={{ width: '100%', maxWidth: '300px' }}>
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>New Category</h3>
            <form onSubmit={handleAddCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                 autoFocus 
                 required 
                 type="text" 
                 placeholder="E.g., Localization" 
                 value={newCatValue} 
                 onChange={e => setNewCatValue(e.target.value)} 
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setNewCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
