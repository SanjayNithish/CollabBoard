import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  KanbanSquare, 
  LayoutDashboard, 
  FolderGit2, 
  LogOut, 
  User as UserIcon,
  Plus,
  Loader
} from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await api.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProjectCreated = (newProj) => {
    setProjects((prev) => [newProj, ...prev]);
    navigate(`/project/${newProj.id}`);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full z-20">
        {/* Brand */}
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <KanbanSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            CollabBoard
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-7 overflow-y-auto">
          {/* Main Links */}
          <div className="space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-200 ${
                location.pathname === '/' 
                  ? 'bg-zinc-800 text-white font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Quick-links for Projects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>My Projects</span>
              <button 
                onClick={() => setIsCreateProjectOpen(true)}
                className="hover:text-indigo-400 transition-colors p-0.5 rounded hover:bg-zinc-800"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {projectsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-4 h-4 animate-spin text-zinc-600" />
              </div>
            ) : projects.length === 0 ? (
              <p className="px-4 text-xs text-zinc-500 italic">No projects yet. Create one!</p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {projects.map((proj) => {
                  const projectPath = `/project/${proj.id}`;
                  const isActive = location.pathname === projectPath;
                  return (
                    <Link
                      key={proj.id}
                      to={projectPath}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm transition duration-200 ${
                        isActive
                          ? 'bg-indigo-600/10 text-indigo-400 font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <FolderGit2 className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                        {proj.key}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 space-y-4">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <h4 className="text-sm font-semibold text-zinc-200 truncate">{user.username}</h4>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            {/* Can display search bar or status breadcrumbs */}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 font-medium">Workspace Active</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-zinc-950 relative">
          <Outlet context={{ fetchProjects }} />
        </main>
      </div>

      {/* Create Project Modal */}
      {isCreateProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default Layout;
