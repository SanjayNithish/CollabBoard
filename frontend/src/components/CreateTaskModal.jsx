import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Loader, 
  CircleDot, 
  PlayCircle, 
  AlertCircle, 
  FileCheck2, 
  GitPullRequest, 
  HelpCircle, 
  Eye, 
  Send, 
  CheckCircle2,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  Calendar
} from 'lucide-react';
import api from '../utils/api';
import CustomSelect from './CustomSelect';
import RichTextEditor from './RichTextEditor';

const statusOptions = [
  { value: 'todo', label: 'TO DO', icon: CircleDot, color: 'text-indigo-400' },
  { value: 'in_progress', label: 'In Progress', icon: PlayCircle, color: 'text-amber-400' },
  { value: 'blocked', label: 'Blocked', icon: AlertCircle, color: 'text-red-400' },
  { value: 'dev_done', label: 'Dev Done', icon: FileCheck2, color: 'text-violet-400' },
  { value: 'code_review', label: 'Code Review', icon: GitPullRequest, color: 'text-fuchsia-400' },
  { value: 'ready_for_qa', label: 'Ready for QA', icon: HelpCircle, color: 'text-cyan-400' },
  { value: 'in_qa', label: 'In QA', icon: Eye, color: 'text-sky-400' },
  { value: 'ready_for_release', label: 'Ready for Release', icon: Send, color: 'text-teal-400' },
  { value: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', icon: ArrowDownCircle, color: 'text-emerald-400' },
  { value: 'medium', label: 'Medium', icon: ArrowRightCircle, color: 'text-amber-400' },
  { value: 'high', label: 'High', icon: ArrowUpCircle, color: 'text-red-400' }
];

const CreateTaskModal = ({ projectId, users, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const assigneeOptions = [
    { value: '', label: 'Unassigned', icon: null, color: null },
    ...users.map((u) => ({ value: u.id.toString(), label: u.username, icon: null, color: null }))
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/tasks', {
        project_id: parseInt(projectId),
        title,
        description,
        status,
        priority,
        assignee_id: assigneeId ? parseInt(assigneeId) : null,
        due_date: dueDate || null
      });
      onTaskCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100">Create new task</h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Implement user login flow"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-2.5 rounded-xl transition duration-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <RichTextEditor 
                  content={description}
                  onChange={setDescription}
                  placeholder="Add details, acceptance criteria, or context for this task..."
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Initial Status
                  </label>
                  <CustomSelect
                    options={statusOptions}
                    value={status}
                    onChange={setStatus}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <CustomSelect
                    options={priorityOptions}
                    value={priority}
                    onChange={setPriority}
                  />
                </div>
              </div>

              {/* Assignee and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Assignee
                  </label>
                  <CustomSelect
                    options={assigneeOptions}
                    value={assigneeId}
                    onChange={setAssigneeId}
                    placeholder="Assign to..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl transition duration-150 outline-none text-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-850 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded-xl transition duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white px-5 py-2 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 flex items-center gap-2 cursor-pointer"
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTaskModal;
