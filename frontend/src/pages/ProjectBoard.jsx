import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import KanbanBoard from '../components/KanbanBoard';
import ProjectChart from '../components/ProjectChart';
import { 
  FolderGit2, 
  Plus, 
  Loader, 
  BarChart2, 
  Calendar,
  AlertCircle,
  BarChart3,
  LayoutGrid
} from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

const ProjectBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // View toggle state: 'board' or 'chart'
  const [activeView, setActiveView] = useState('board');

  const fetchProjectData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks?project_id=${id}`),
        api.get('/api/auth/users')
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load project board details. It might have been deleted or you lack permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleDragEnd = async (taskId, srcAssigneeId, destAssigneeId, srcStatus, destStatus, sourceIndex, destIndex) => {
    // Optimistic UI updates
    const updatedTasks = [...tasks];
    const draggedTaskIndex = updatedTasks.findIndex(t => t.id.toString() === taskId.toString());
    if (draggedTaskIndex === -1) return;

    const oldStatus = updatedTasks[draggedTaskIndex].status;
    const oldAssignee = updatedTasks[draggedTaskIndex].assignee;

    // Apply new values in state
    updatedTasks[draggedTaskIndex].status = destStatus;
    if (destAssigneeId === 'unassigned') {
      updatedTasks[draggedTaskIndex].assignee = null;
    } else {
      const newAssignee = users.find(u => u.id.toString() === destAssigneeId);
      updatedTasks[draggedTaskIndex].assignee = newAssignee || null;
    }
    setTasks(updatedTasks);

    try {
      // Save changes to API (we added assignee_id support in backend patch method)
      await api.patch(`/api/tasks/${taskId}/status`, { 
        status: destStatus,
        assignee_id: destAssigneeId === 'unassigned' ? '' : parseInt(destAssigneeId)
      });
    } catch (err) {
      console.error('Failed to update task status in backend', err);
      // Revert state on error
      const revertedTasks = [...tasks];
      const taskIndex = revertedTasks.findIndex(t => t.id.toString() === taskId.toString());
      if (taskIndex !== -1) {
        revertedTasks[taskIndex].status = oldStatus;
        revertedTasks[taskIndex].assignee = oldAssignee;
        setTasks(revertedTasks);
      }
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter(t => t.id !== deletedTaskId));
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading board workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-zinc-200">{error}</h3>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold px-4 py-2 rounded-xl border border-zinc-800 transition duration-200 cursor-pointer text-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col gap-6">
      {/* Board Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Projects</span>
            <span>/</span>
            <span>{project?.key}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 mt-1">{project?.name}</h1>
          {project?.description && (
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {/* Graph/Chart Toggle Button */}
          <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 flex items-center gap-1">
            <button
              onClick={() => setActiveView('board')}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                activeView === 'board' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('chart')}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                activeView === 'chart' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Project Analytics Graph"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <span className="flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
              Completion Rate
            </span>
            <span>{doneTasks} of {totalTasks} tasks ({completionPercentage}%)</span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-4 md:border-l border-zinc-850 md:pl-6 w-full md:w-auto justify-around md:justify-start">
          <div className="text-center md:text-left">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">In Progress</span>
            <h4 className="text-lg font-bold text-amber-400 mt-0.5">{inProgressTasks}</h4>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Created Date</span>
            <h4 className="text-xs font-bold text-zinc-400 mt-1 flex items-center gap-1.5 justify-center md:justify-start">
              <Calendar className="w-3.5 h-3.5" />
              {project && new Date(project.created_at).toLocaleDateString()}
            </h4>
          </div>
        </div>
      </div>

      {/* Conditional Rendering of Views */}
      <div className="flex-1 overflow-hidden min-h-0">
        {activeView === 'board' ? (
          <KanbanBoard
            tasks={tasks}
            users={users}
            onDragEnd={handleDragEnd}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        ) : (
          <div className="max-w-4xl mx-auto overflow-y-auto max-h-[calc(100vh-14rem)] pr-2">
            <ProjectChart tasks={tasks} />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateTaskOpen && (
        <CreateTaskModal
          projectId={id}
          users={users}
          onClose={() => setIsCreateTaskOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default ProjectBoard;
