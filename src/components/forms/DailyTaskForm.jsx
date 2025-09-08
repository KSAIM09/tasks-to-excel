import { useState } from 'react';
import { createTask } from '../../storage';
import { toast } from 'react-toastify';
import './DailyTaskForm.styles.css';

export const DailyTaskForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    project: 'AceCam',
    title: '',
    description: '',
    assignedBy: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      createTask({
        ...formData,
      });
      toast.success('Task saved');
      onSuccess?.();
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        project: 'Project 1',
        title: '',
        description: '',
        assignedBy: '',
      });
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to save task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Project</label>
        <select
          name="project"
          value={formData.project}
          onChange={handleChange}
          className="form-select"
        >
          <option value="AceCam">AceCam</option>
          <option value="Bfile">Bfile</option>
          <option value="Box Tracking">Box Tracking</option>
          <option value="Box Tracking">Others</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter title"
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task details"
          rows="3"
          className="form-textarea"
        ></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Assigned By</label>
        <input
          type="text"
          name="assignedBy"
          value={formData.assignedBy}
          onChange={handleChange}
          placeholder="Who assigned this task?"
          className="form-input"
        />
      </div>

      <div className="button-group">
        <button
          type="button"
          onClick={() => {
            setFormData({
              date: new Date().toISOString().split('T')[0],
              project: 'AceCam',
              title: '',
              description: '',
              assignedBy: '',
            });
          }}
          className="form-button button-secondary"
        >
          Reset
        </button>
        <button
          type="submit"
          className="form-button button-primary"
        >
          Save Task
        </button>
      </div>
    </form>
  );
};
