import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Clock, 
  User, 
  TrendingUp, 
  Compass,
  ArrowRight,
  Loader
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (newProj) => {
    setProjects((prev) => [newProj, ...prev]);
    navigate(`/project/${newProj.id}`);
  };

  const filteredProjects = projects.filter(proj => 
    proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proj.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-indigo-500/5 blur-[80px] rounded-full"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-zinc-400 mt-2 max-w-md">
            Track your tasks, collaborate with your team, and complete milestones efficiently on your Kanban boards.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap self-start md:self-center"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Projects</p>
            <h3 className="text-2xl font-bold text-zinc-200 mt-1">{projects.length}</h3>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Activity Status</p>
            <h3 className="text-2xl font-bold text-zinc-200 mt-1">Healthy</h3>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-850 p-6 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Organization Role</p>
            <h3 className="text-2xl font-bold text-zinc-200 mt-1">Administrator</h3>
          </div>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-zinc-200">Active Workspaces</h2>
          
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 pl-10 pr-4 py-2 rounded-xl transition duration-200 outline-none text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm text-zinc-500">Loading your projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <FolderGit2 className="w-12 h-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">No projects found</h3>
            <p className="text-zinc-500 text-sm max-w-sm mt-1">
              {searchQuery ? "Try refining your search query." : "Get started by creating your first collaborative workspace project!"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-6 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-semibold px-4 py-2.5 rounded-xl border border-indigo-500/20 transition duration-200 flex items-center gap-2 cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <div 
                key={proj.id}
                onClick={() => navigate(`/project/${proj.id}`)}
                className="group bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 p-6 rounded-2xl shadow-lg transition duration-200 cursor-pointer flex flex-col justify-between h-56 relative overflow-hidden"
              >
                {/* Accent line on hover */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs bg-zinc-800 text-zinc-400 font-mono px-2 py-0.5 rounded border border-zinc-750">
                      {proj.key}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {new Date(proj.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-200 mt-4 group-hover:text-white transition-colors truncate">
                    {proj.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-850 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <User className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Owner: </span>
                    <span className="font-semibold text-zinc-400">{proj.owner?.username || 'System'}</span>
                  </div>
                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs font-semibold">
                    Open Board
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
