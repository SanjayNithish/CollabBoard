import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader } from 'lucide-react';
import api from '../utils/api';

const CreateProjectModal = ({ onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    
    // Automatically generate a suggested key from the project name
    if (val.trim()) {
      const words = val.trim().split(/\s+/);
      let suggestedKey = '';
      if (words.length >= 2) {
        suggestedKey = words.map(w => w[0]).join('');
      } else {
        suggestedKey = val.trim().substring(0, 3);
      }
      setKey(suggestedKey.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5));
    } else {
      setKey('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !key.trim()) {
      setError('Project name and key are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/projects', {
        name,
        key: key.toUpperCase(),
        description
      });
      onProjectCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
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
          className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-100">Create new project</h3>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  required
                  placeholder="e.g. Apollo Launchpad"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-2.5 rounded-xl transition duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Project Key
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  required
                  maxLength={10}
                  placeholder="e.g. APO"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-2.5 rounded-xl transition duration-200 outline-none font-mono uppercase"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  A unique code used as a prefix for task IDs. (Max 10 alphanumeric characters)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of what this project aims to accomplish"
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-2.5 rounded-xl transition duration-200 outline-none resize-none"
                />
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
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateProjectModal;
