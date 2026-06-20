import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Loader, Trash2, Send, MessageSquare, Calendar, User,
  CircleDot, PlayCircle, AlertCircle, FileCheck2, GitPullRequest,
  HelpCircle, Eye, CheckCircle2, ArrowUpCircle, ArrowRightCircle,
  ArrowDownCircle, Save, Activity as ActivityIcon, CheckSquare, Plus, Tag
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

const TaskDetailModal = ({ task, users, onClose, onTaskUpdated, onTaskDeleted }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id?.toString() || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [labels, setLabels] = useState(task.labels || []);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  // Input states for subtasks and labels
  const [newSubtask, setNewSubtask] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const assigneeOptions = [
    { value: '', label: 'Unassigned', icon: null, color: null },
    ...users.map((u) => ({ value: u.id.toString(), label: u.username, icon: null, color: null }))
  ];

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/api/comments?task_id=${task.id}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const res = await api.get(`/api/tasks/${task.id}/activity`);
      setActivities(res.data);
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    fetchActivities();
    
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assignee?.id?.toString() || '');
    setDueDate(task.due_date || '');
    setLabels(task.labels || []);
    setSubtasks(task.subtasks || []);
  }, [task]);

  const handleSaveAllChanges = async () => {
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.put(`/api/tasks/${task.id}`, {
        title,
        description,
        status,
        priority,
        assignee_id: assigneeId ? parseInt(assigneeId) : null,
        due_date: dueDate || null,
        labels: labels
      });
      onTaskUpdated(res.data);
      setSubtasks(res.data.subtasks || []);
      setLabels(res.data.labels || []);
      fetchActivities(); // Refresh history
      setSuccessMsg('Task changes saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task details');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/api/tasks/${task.id}`);
      onTaskDeleted(task.id);
      onClose();
    } catch (err) {
      setError('Failed to delete task');
      setDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSaving(true);
    try {
      const res = await api.post('/api/comments', {
        task_id: task.id,
        content: newComment.trim()
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to save comment', err);
    } finally {
      setCommentSaving(false);
    }
  };

  // Subtask Methods
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      const res = await api.post(`/api/tasks/${task.id}/subtasks`, { title: newSubtask.trim() });
      setSubtasks([...subtasks, res.data]);
      setNewSubtask('');
      fetchActivities();
    } catch (err) {
      console.error('Failed to add subtask', err);
    }
  };

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const res = await api.patch(`/api/tasks/subtasks/${subtaskId}`, { is_completed: !currentStatus });
      setSubtasks(subtasks.map(s => s.id === subtaskId ? res.data : s));
      fetchActivities();
    } catch (err) {
      console.error('Failed to toggle subtask', err);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await api.delete(`/api/tasks/subtasks/${subtaskId}`);
      setSubtasks(subtasks.filter(s => s.id !== subtaskId));
      fetchActivities();
    } catch (err) {
      console.error('Failed to delete subtask', err);
    }
  };

  // Label Methods
  const handleAddLabel = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const text = newLabel.trim();
      if (text && !labels.includes(text)) {
        setLabels([...labels, text]);
        setNewLabel('');
      }
    }
  };

  const handleRemoveLabel = (label) => {
    setLabels(labels.filter(l => l !== label));
  };

  const completedSubtasks = subtasks.filter(s => s.is_completed).length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row h-[90vh]"
        >
          {/* Main Details Panel (Left) */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 border-b md:border-b-0 md:border-r border-zinc-850">
            {/* Header: Key & Delete */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <span className="text-xs bg-zinc-800 text-zinc-400 font-mono px-2.5 py-1 rounded border border-zinc-750 font-bold">
                {task.key}
              </span>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition duration-150 cursor-pointer"
                  title="Delete Task"
                >
                  {deleting ? <Loader className="w-4.5 h-4.5 animate-spin" /> : <Trash2 className="w-4.5 h-4.5" />}
                </button>
                <button
                  onClick={onClose}
                  className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 p-2 rounded-xl transition duration-150 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg">
                {successMsg}
              </div>
            )}

            {/* Editable Title */}
            <div className="space-y-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent hover:bg-zinc-950/40 focus:bg-zinc-950/60 border border-transparent focus:border-indigo-500 text-2xl font-bold text-zinc-100 px-3 py-1.5 rounded-xl transition duration-150 outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2">Description</label>
              <RichTextEditor 
                content={description}
                onChange={setDescription}
                placeholder="Add a detailed description..."
              />
            </div>

            {/* Subtasks Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" /> Subtasks
                </label>
                {subtasks.length > 0 && (
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {completedSubtasks} / {subtasks.length} ({Math.round((completedSubtasks/subtasks.length)*100)}%)
                  </span>
                )}
              </div>

              {/* Subtasks Progress Bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-2 mx-2">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center justify-between group hover:bg-zinc-800/50 p-2 rounded-lg transition-colors">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input 
                        type="checkbox"
                        checked={st.is_completed}
                        onChange={() => handleToggleSubtask(st.id, st.is_completed)}
                        className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-500 focus:ring-indigo-500/20 focus:ring-offset-0 transition-all cursor-pointer"
                      />
                      <span className={`text-sm transition-all ${st.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                        {st.title}
                      </span>
                    </label>
                    <button 
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} className="flex gap-2 px-2 mt-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-zinc-200 px-3 py-1.5 rounded-lg text-sm outline-none transition-colors"
                />
                <button type="submit" disabled={!newSubtask.trim()} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>

            {/* Tabs: Comments / Activity */}
            <div className="border-t border-zinc-850 pt-6 mt-auto">
              <div className="flex gap-4 border-b border-zinc-800 mb-4 px-2">
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={`pb-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'comments' ? 'border-indigo-500 text-zinc-200' : 'border-transparent text-zinc-500 hover:text-zinc-400'}`}
                >
                  <MessageSquare className="w-4 h-4" /> Comments
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className={`pb-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'activity' ? 'border-indigo-500 text-zinc-200' : 'border-transparent text-zinc-500 hover:text-zinc-400'}`}
                >
                  <ActivityIcon className="w-4 h-4" /> History
                </button>
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-2 rounded-xl transition duration-200 outline-none text-sm"
                    />
                    <button
                      type="submit"
                      disabled={commentSaving || !newComment.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white p-2 rounded-xl shadow-lg transition duration-150 flex items-center justify-center cursor-pointer"
                    >
                      {commentSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>

                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="w-4 h-4 animate-spin text-zinc-600" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic px-2">No comments yet.</p>
                  ) : (
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                      {comments.map((comm) => (
                        <div key={comm.id} className="bg-zinc-800/30 border border-zinc-800/50 p-3.5 rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-300">{comm.author?.username}</span>
                            <span className="text-zinc-500">{new Date(comm.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed">{comm.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {activitiesLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="w-4 h-4 animate-spin text-zinc-600" />
                    </div>
                  ) : activities.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic px-2">No activity recorded.</p>
                  ) : (
                    <div className="relative border-l border-zinc-800 ml-3 space-y-4 pb-2">
                      {activities.map((act) => (
                        <div key={act.id} className="relative pl-6">
                          <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-900" />
                          <p className="text-sm text-zinc-300">
                            <span className="font-semibold text-zinc-200">{act.user?.username || 'System'}</span> {act.action}
                            {act.new_value && <span className="font-mono text-xs ml-1 bg-zinc-800 px-1 py-0.5 rounded text-indigo-300">{act.new_value}</span>}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">{new Date(act.created_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Configuration sidebar (Right) */}
          <div className="w-full md:w-80 bg-zinc-900/60 p-6 md:p-8 flex flex-col gap-5 justify-start border-l border-zinc-850 overflow-y-auto">
            <h3 className="text-sm font-bold text-zinc-200 border-b border-zinc-850 pb-4">Task Details</h3>

            {/* Labels setting */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Labels
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {labels.map(l => (
                  <span key={l} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    {l}
                    <button onClick={() => handleRemoveLabel(l)} className="hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={handleAddLabel}
                  placeholder="Add label..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 text-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none transition-colors"
                />
                <button onClick={handleAddLabel} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status setting */}
            <div className="space-y-2 mt-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status</label>
              <CustomSelect
                options={statusOptions}
                value={status}
                onChange={setStatus}
              />
            </div>

            {/* Priority setting */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Priority</label>
              <CustomSelect
                options={priorityOptions}
                value={priority}
                onChange={setPriority}
              />
            </div>

            {/* Assignee setting */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Assignee</label>
              <CustomSelect
                options={assigneeOptions}
                value={assigneeId}
                onChange={setAssigneeId}
                placeholder="Unassigned"
              />
            </div>

            {/* Due Date setting */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 text-zinc-200 pl-9 pr-3 py-2.5 rounded-xl transition duration-150 outline-none text-xs cursor-pointer"
                />
              </div>
            </div>

            {/* Audit details */}
            <div className="space-y-3.5 border-t border-zinc-850 pt-5 mt-4 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Reporter:
                </span>
                <span className="font-bold text-zinc-400 normal-case">{task.reporter?.username || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Created:
                </span>
                <span className="normal-case">{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            {/* Dedicated Save Changes Button */}
            <button
              type="button"
              onClick={handleSaveAllChanges}
              disabled={saving}
              className="w-full mt-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskDetailModal;
