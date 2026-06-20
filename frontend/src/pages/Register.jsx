import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KanbanSquare, Loader } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3">
            <KanbanSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Create account</h2>
          <p className="text-sm text-zinc-400 mt-1">Get started with a free collaborative workspace</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-3 rounded-xl transition duration-200 outline-none"
              placeholder="johndoe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-3 rounded-xl transition duration-200 outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 px-4 py-3 rounded-xl transition duration-200 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
