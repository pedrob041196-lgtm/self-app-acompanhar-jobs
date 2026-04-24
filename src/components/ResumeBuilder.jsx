import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Printer, Target } from 'lucide-react';

export default function ResumeBuilder({ resumeData, setResumeData }) {
  const [jobDescription, setJobDescription] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const updateField = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }));

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { id: uuidv4(), title: '', company: '', period: '', description: '' }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  // Adaptação Simples baseada na Job Description
  const getAdaptedData = () => {
    if (!jobDescription.trim()) return resumeData;

    const descLower = jobDescription.toLowerCase();
    
    // Extrai e reordena skills
    const rawSkills = resumeData.skills.split(',').map(s => s.trim()).filter(s => s);
    const sortedSkills = rawSkills.sort((a, b) => {
      const aMatches = descLower.includes(a.toLowerCase()) ? 1 : 0;
      const bMatches = descLower.includes(b.toLowerCase()) ? 1 : 0;
      return bMatches - aMatches;
    });

    return {
      ...resumeData,
      skills: sortedSkills,
      targetJobLength: jobDescription.length
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const adapted = getAdaptedData();

  if (previewMode) {
    return (
      <div className="resume-print-container" style={{ background: 'white', minHeight: '100vh', padding: '2rem', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setPreviewMode(false)}>Back to Editor</button>
          <button className="btn btn-primary" onClick={handlePrint}><Printer size={18} /> Print PDF</button>
        </div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', color: 'black', fontFamily: 'Arial, sans-serif' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem', color: '#111' }}>{adapted.name || 'Your Name'}</h1>
          <h2 style={{ fontSize: '1.25rem', color: '#444', marginBottom: '1rem', fontWeight: 400 }}>{adapted.title || 'Your Professional Title'}</h2>
          
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#555', marginBottom: '2rem' }}>
            {adapted.email && <span>{adapted.email}</span>}
            {adapted.phone && <span>{adapted.phone}</span>}
            {adapted.link && <span>{adapted.link}</span>}
          </div>

          {adapted.summary && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Summary</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{adapted.summary}</p>
            </div>
          )}

          {adapted.skills && adapted.skills.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {Array.isArray(adapted.skills) ? adapted.skills.map((skill, i) => {
                  const isMatch = jobDescription.toLowerCase().includes(skill.toLowerCase());
                  return (
                    <span key={i} style={{ 
                      padding: '0.25rem 0.5rem', 
                      background: '#f1f1f1', 
                      borderRadius: '4px', 
                      fontSize: '0.9rem',
                      fontWeight: isMatch ? 'bold' : 'normal',
                      color: isMatch ? '#000' : '#444'
                    }}>
                      {skill}
                    </span>
                  );
                }) : <span>{adapted.skills}</span>}
              </div>
            </div>
          )}

          {adapted.experiences && adapted.experiences.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {adapted.experiences.map(exp => (
                  <div key={exp.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{exp.title} <span style={{ fontWeight: 400 }}>at {exp.company}</span></strong>
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>{exp.period}</span>
                    </div>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="heading-lg">Resume Builder</h2>
          <p className="text-muted">Create a master resume and adapt it to specific job descriptions.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Formulário do Currículo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="heading-md">Basic Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <input type="text" placeholder="Full Name" value={resumeData.name} onChange={e => updateField('name', e.target.value)} />
               <input type="text" placeholder="Professional Title" value={resumeData.title} onChange={e => updateField('title', e.target.value)} />
               <input type="email" placeholder="Email" value={resumeData.email} onChange={e => updateField('email', e.target.value)} />
               <input type="text" placeholder="Phone" value={resumeData.phone} onChange={e => updateField('phone', e.target.value)} />
               <input type="text" placeholder="Portfolio/LinkedIn Link" value={resumeData.link} onChange={e => updateField('link', e.target.value)} style={{ gridColumn: '1 / -1' }} />
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="heading-md">Summary & Skills</h3>
            <textarea rows={4} placeholder="Professional Summary" value={resumeData.summary} onChange={e => updateField('summary', e.target.value)} />
            <textarea rows={2} placeholder="Skills (comma separated, e.g., React, Translation, Figma)" value={resumeData.skills} onChange={e => updateField('skills', e.target.value)} />
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex-between">
              <h3 className="heading-md">Experiences</h3>
              <button className="btn btn-outline" onClick={addExperience}><Plus size={16} /> Add Experience</button>
            </div>
            
            {resumeData.experiences.map((exp, index) => (
              <div key={exp.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" placeholder="Job Title" value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} style={{ flex: 1 }} />
                  <input type="text" placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" placeholder="Period (e.g., 2021 - Present)" value={exp.period} onChange={e => updateExperience(exp.id, 'period', e.target.value)} style={{ width: '50%' }} />
                  <div style={{ width: '50%', textAlign: 'right' }}>
                    <button className="btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => removeExperience(exp.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
                <textarea rows={3} placeholder="Job Description" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Módulo de Target Vaga (Sticky) */}
        <div className="card" style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
            <Target size={20} />
            <h3 className="heading-md">Target Job Adapter</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Paste the job description below. We will reorder your skills and highlight keywords to match this target job.</p>
          <textarea 
            rows={10} 
            placeholder="Paste Target Job Description here..." 
            value={jobDescription} 
            onChange={e => setJobDescription(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setPreviewMode(true)} style={{ justifyContent: 'center', marginTop: '1rem' }}>
            Review & Print PDF
          </button>
        </div>
      </div>
    </div>
  );
}
