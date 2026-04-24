import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Copy, Check, Edit2, Trash2 } from 'lucide-react';

export default function Templates({ templates, setTemplates }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const defaultForm = { id: '', title: '', category: 'Cover Letter', content: '' };
  const [form, setForm] = useState(defaultForm);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === form.id ? form : t));
    } else {
      setTemplates([...templates, { ...form, id: uuidv4() }]);
    }
    setIsModalOpen(false);
    setForm(defaultForm);
    setEditingTemplate(null);
  };

  const handleCopy = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['Cover Letter', 'Short Intro', 'Application Answer', 'Other'];

  // Group by category
  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = templates.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="heading-lg">Templates</h2>
          <p className="text-muted">Store reusable text for quick copy-pasting.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => { setForm(defaultForm); setEditingTemplate(null); setIsModalOpen(true); }}
        >
          <Plus size={18} /> Add Template
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {templates.length === 0 ? (
          <div className="card text-muted flex-center" style={{ minHeight: '150px' }}>
            No templates stored. Add some reusable text.
          </div>
        ) : categories.map(cat => grouped[cat].length > 0 && (
          <div key={cat}>
            <h3 className="heading-md" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>{cat}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {grouped[cat].map(temp => (
                <div key={temp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex-between">
                    <h4 style={{ fontWeight: 600 }}>{temp.title}</h4>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn-ghost" title="Copy" onClick={() => handleCopy(temp.id, temp.content)}>
                        {copiedId === temp.id ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                      </button>
                      <button className="btn-ghost" title="Edit" onClick={() => { setForm(temp); setEditingTemplate(true); setIsModalOpen(true); }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-ghost" style={{ color: 'var(--danger)' }} title="Delete" onClick={() => setTemplates(templates.filter(t => t.id !== temp.id))}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem', maxHeight: '100px', overflowY: 'auto', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>
                    {temp.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1.5rem' }}>{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Template Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <textarea 
                required 
                rows={6} 
                placeholder="Template text content..." 
                value={form.content} 
                onChange={e => setForm({...form, content: e.target.value})} 
                style={{ fontFamily: 'monospace' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
