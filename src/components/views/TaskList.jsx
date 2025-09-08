import { useState, useEffect } from 'react';
import { listTasksByDateRange, deleteTask as deleteLocalTask, updateTask as updateLocalTask, subscribe as subscribeStorage, createMany } from '../../storage';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import './TaskList.styles.css';

export const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', project: 'Project 1', title: '', description: '', assignedBy: '' });

  useEffect(() => {
    const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
    const load = () => setTasks(listTasksByDateRange(startDate, endDate));
    load();
    const unsubscribe = subscribeStorage(load);
    return () => unsubscribe();
  }, [selectedMonth, selectedYear]);

  const exportToExcel = () => {
    const grouped = tasks.reduce((acc, t) => {
      const key = t.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      return acc;
    }, {});

    const exportRows = Object.entries(grouped)
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
      .map(([date, items]) => {
        const tasksCell = items
          .map((t) => {
            const parts = [];
            if (t.project) parts.push(`${t.project}`);
            if (t.title) parts.push(`"${t.title}"`);
            if (t.assignedBy) parts.push(`by ${t.assignedBy}`);
            const head = parts.join(' - ');
            return t.description ? `${head}: ${t.description}` : head;
          })
          .join(' | ');
        return { Date: date, Tasks: tasksCell };
      });
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Tasks');
    XLSX.writeFile(workbook, `tasks_${selectedMonth}_${selectedYear}.xlsx`);
  };

  // Hours removed; totals not used anymore

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) return;
    try {
      deleteLocalTask(taskId);
      toast.success('Task deleted');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete task');
    }
  };

  const openEdit = (task) => {
    setEditTask(task);
    setEditForm({
      date: task.date || new Date().toISOString().split('T')[0],
      project: task.project || 'Project 1',
      title: task.title || '',
      description: task.description || '',
      assignedBy: task.assignedBy || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editTask) return;
    try {
      updateLocalTask(editTask.id, { ...editForm });
      toast.success('Task updated');
      setEditTask(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update task');
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const parsed = [];
      for (const row of rows) {
        const date = (row.Date || row.date || '').toString().slice(0, 10);
        if (!date) continue;
        if (row.Tasks) {
          const parts = row.Tasks.split(' | ').map(s => s.trim()).filter(Boolean);
          for (const p of parts) {
            const projectMatch = p.match(/^([^\-]+)-/);
            const titleMatch = p.match(/\"([^\"]+)\"/);
            const byMatch = p.match(/ by ([^:]+)(:|$)/i);
            const descMatch = p.includes(':') ? p.split(':').slice(1).join(':').trim() : '';
            parsed.push({
              date,
              project: projectMatch ? projectMatch[1].trim() : '',
              title: titleMatch ? titleMatch[1].trim() : '',
              description: descMatch,
              assignedBy: byMatch ? byMatch[1].trim() : '',
            });
          }
        } else {
          parsed.push({
            date,
            project: (row.Project || row.project || '').toString(),
            title: (row.Title || row.title || '').toString(),
            description: (row.Description || row.description || '').toString(),
            assignedBy: (row.AssignedBy || row.assignedBy || '').toString(),
          });
        }
      }

      if (parsed.length === 0) {
        toast.info('No tasks found in file');
        e.target.value = '';
        return;
      }
      const { added } = createMany(parsed);
      const skipped = parsed.length - added;
      toast.success(`Imported ${added} tasks` + (skipped ? `, skipped ${skipped} duplicates` : ''));
      e.target.value = '';
    } catch (err) {
      console.error(err);
      toast.error('Failed to import file');
      e.target.value = '';
    }
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2 className="task-list-title">Monthly Tasks</h2>
        <div className="task-list-actions">
          <div className="task-list-filters">
            <div className="filter-group">
              <span className="filter-label">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="form-select"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <span className="filter-label">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="form-select"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={exportToExcel}
            className="form-button button-primary"
          >
            Export to Excel
          </button>
          <label className="form-button button-secondary" style={{ cursor: 'pointer' }}>
            Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          {null}
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No tasks found</h3>
          <p className="empty-state-description">
            There are no tasks for the selected month and year. Start by adding a new task.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="task-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(
                tasks.reduce((acc, task) => {
                  const key = task.date;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(task);
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
                .map(([date, items]) => (
                  <tr key={date}>
                    <td>{new Date(date).toLocaleDateString()}</td>
                    <td>
                      {items.map((task) => (
                        <div key={task.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border, #e5e7eb)' }}>
                          <div className="task-name">{task.title || '-'}</div>
                          <div className="task-description">
                            <strong>Project:</strong> {task.project || '-'}{task.assignedBy ? ` · Assigned By: ${task.assignedBy}` : ''}
                          </div>
                          {task.description && (
                            <div className="task-description">{task.description}</div>
                          )}
                          <div className="task-actions" style={{ marginTop: '0.25rem' }}>
                            <button className="action-button" onClick={() => openEdit(task)}>Edit</button>
                            <button className="action-button" onClick={() => handleDelete(task.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {editTask && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Task</h3>
              <button className="modal-close" onClick={() => setEditTask(null)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" name="date" value={editForm.date} onChange={handleEditChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select name="project" value={editForm.project} onChange={handleEditChange} className="form-select">
                  <option value="AceCam">AceCam</option>
                  <option value="Bfile">Bfile</option>
                  <option value="Box Tracking">Box Tracking</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" value={editForm.title} onChange={handleEditChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" rows="3" value={editForm.description} onChange={handleEditChange} className="form-textarea" />
              </div>
              <div className="form-group">
                <label className="form-label">Assigned By</label>
                <input type="text" name="assignedBy" value={editForm.assignedBy} onChange={handleEditChange} className="form-input" />
              </div>
              <div className="modal-footer">
                <button type="button" className="form-button button-secondary" onClick={() => setEditTask(null)}>Cancel</button>
                <button type="submit" className="form-button button-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
