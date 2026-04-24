import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Check, Clock, Edit2, Trash2 } from 'lucide-react';

export default function TaskPlanner({ tasks, setTasks }) {
  const [dailyTime, setDailyTime] = useState(240); // 4 hours in minutes
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const defaultTask = { id: '', name: '', duration: 30, priority: 'Medium', category: 'General', completed: false, date: new Date().toISOString().split('T')[0] };
  const [form, setForm] = useState(defaultTask);
  const [editingTask, setEditingTask] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(t => t.id === form.id ? form : t));
    } else {
      setTasks([...tasks, { ...form, id: uuidv4() }]);
    }
    setIsModalOpen(false);
    setForm(defaultTask);
    setEditingTask(null);
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const autoSchedule = () => {
    const uncompleted = [...tasks.filter(t => !t.completed)];
    const completed = tasks.filter(t => t.completed);
    
    // Sort by priority (High -> Medium -> Low)
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    uncompleted.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    let currentDayStr = new Date().toISOString().split('T')[0];
    let timeUsedToday = 0;

    const rescheduled = uncompleted.map(task => {
      if (timeUsedToday + Number(task.duration) > dailyTime) {
        // Move to next day
        const d = new Date(currentDayStr);
        d.setDate(d.getDate() + 1);
        currentDayStr = d.toISOString().split('T')[0];
        timeUsedToday = 0;
      }
      timeUsedToday += Number(task.duration);
      return { ...task, date: currentDayStr };
    });

    setTasks([...completed, ...rescheduled]);
    alert('Tasks grouped logically based on available daily time and priority.');
  };

  // Group by date
  const groupedTasks = tasks.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});

  const dates = Object.keys(groupedTasks).sort();

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="heading-lg">Smart Task Planning</h2>
          <p className="text-muted">Plan your job search activities.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label className="text-muted" style={{ fontSize: '0.8rem' }}>Daily Lim. (min):</label>
            <input type="number" style={{ width: '80px' }} value={dailyTime} onChange={(e) => setDailyTime(Number(e.target.value))} />
          </div>
          <button className="btn btn-outline" onClick={autoSchedule}>Auto Schedule</button>
          <button className="btn btn-primary" onClick={() => { setForm(defaultTask); setEditingTask(null); setIsModalOpen(true); }}><Plus size={18} /> Add Task</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {dates.length === 0 ? (
           <div className="card text-muted flex-center" style={{ minHeight: '150px' }}>
             No tasks planned.
           </div>
        ) : dates.map(date => {
          const dayTasks = groupedTasks[date];
          const totalDuration = dayTasks.reduce((s, t) => s + Number(t.duration), 0);
          const isOver = totalDuration > dailyTime;
          
          return (
            <div key={date}>
              <h3 className="heading-md" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                {date === new Date().toISOString().split('T')[0] ? 'Today' : date}
                <span className="text-muted" style={{ fontSize: '0.875rem', color: isOver ? 'var(--danger)' : '' }}>
                   {totalDuration}m / {dailyTime}m
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dayTasks.map(task => (
                  <div key={task.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: task.completed ? 0.6 : 1 }}>
                    <button 
                      onClick={() => toggleComplete(task.id)}
                      style={{ 
                        width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)',
                        background: task.completed ? 'var(--primary)' : 'transparent', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      {task.completed && <Check size={16} />}
                    </button>
                    
                    <div style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>
                      <div style={{ fontWeight: 500 }}>{task.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                        <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{task.duration}m</span>
                        <span style={{ color: task.priority === 'High' ? 'var(--danger)' : task.priority === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                          Priority: {task.priority}
                        </span>
                        <span>Cat: {task.category}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-ghost" onClick={() => { setForm(task); setEditingTask(true); setIsModalOpen(true); }}><Edit2 size={16} /></button>
                      <button className="btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 className="heading-lg" style={{ marginBottom: '1.5rem' }}>{editingTask ? 'Edit Task' : 'New Task'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required type="text" placeholder="Task Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Duration (min)</label>
                  <input required type="number" min="1" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} style={{ width: '100%' }}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Category</label>
                  <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                   <label className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Date</label>
                   <input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={{ width: '100%' }} />
                </div>
              </div>

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
