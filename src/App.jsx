import { useState } from 'react';
import { DailyTaskForm } from './components/forms/DailyTaskForm';
import { TaskList } from './components/views/TaskList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ThemeToggle from './components/ThemeToggle';
import './styles/App.styles.css';

function App() {
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Monthly Tasks Tracker</h1>
        </div>
      </header>

      <main className="app-main">
        <div className="tab-container">
          <button
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Task
          </button>
          <button
            className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View Tasks
          </button>
        </div>

        <div className="content-container fade-in">
          {activeTab === 'add' ? (
            <div className="form-container">
              <h2 className="section-title">Add New Task</h2>
              <DailyTaskForm 
                onSuccess={() => {
                  setActiveTab('view');
                }} 
              />
            </div>
          ) : (
            <TaskList />
          )}
        </div>
      </main>

      <ThemeToggle />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
