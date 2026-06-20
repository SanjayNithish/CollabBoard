import React, { useState } from 'react';
import { KanbanSquare, BarChart3, Users, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  todo: { label: 'TO DO', color: '#818cf8', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' }, // indigo
  in_progress: { label: 'In Progress', color: '#fbbf24', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }, // amber
  blocked: { label: 'Blocked', color: '#f87171', bg: 'bg-red-500/10', border: 'border-red-500/20' }, // red
  dev_done: { label: 'Dev Done', color: '#a78bfa', bg: 'bg-violet-500/10', border: 'border-violet-500/20' }, // violet
  code_review: { label: 'Code Review', color: '#f472b6', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' }, // fuchsia
  ready_for_qa: { label: 'Ready for QA', color: '#22d3ee', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' }, // cyan
  in_qa: { label: 'In QA', color: '#38bdf8', bg: 'bg-sky-500/10', border: 'border-sky-500/20' }, // sky
  ready_for_release: { label: 'Ready for Release', color: '#2dd4bf', bg: 'bg-teal-500/10', border: 'border-teal-500/20' }, // teal
  done: { label: 'Done', color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' } // emerald
};

const ProjectChart = ({ tasks }) => {
  const [hoveredStatus, setHoveredStatus] = useState(null);
  const totalTasks = tasks.length;

  // Compute status distributions
  const distributions = Object.keys(statusConfig).map((statusKey) => {
    const count = tasks.filter(t => t.status === statusKey).length;
    const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
    return {
      key: statusKey,
      count,
      percentage,
      ...statusConfig[statusKey]
    };
  });

  // SVG calculations for donut chart
  const r = 70;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r; // ~439.82
  let accumulatedLength = 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Project Status Analytics
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Aggregated statistics of task distribution across 9 workflow pipelines</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total Tasks</span>
          <h3 className="text-2xl font-black text-indigo-400">{totalTasks}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Donut Chart SVG (Left) */}
        <div className="flex items-center justify-center relative">
          {totalTasks > 0 ? (
            <>
              <svg width="240" height="240" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="transparent"
                  stroke="#18181b"
                  strokeWidth={strokeWidth}
                />
                
                {/* Animated status segments */}
                {distributions.map((dist) => {
                  if (dist.count === 0) return null;
                  const segmentLength = (dist.count / totalTasks) * circumference;
                  const currentOffset = -accumulatedLength;
                  accumulatedLength += segmentLength;

                  const isHovered = hoveredStatus === dist.key;

                  return (
                    <circle
                      key={dist.key}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="transparent"
                      stroke={dist.color}
                      strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                      strokeDashoffset={currentOffset}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredStatus(dist.key)}
                      onMouseLeave={() => setHoveredStatus(null)}
                      className="transition-all duration-300 cursor-pointer"
                    />
                  );
                })}
              </svg>

              {/* Inner details block */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                {hoveredStatus ? (
                  <>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {statusConfig[hoveredStatus].label}
                    </span>
                    <span 
                      className="text-2xl font-black mt-0.5" 
                      style={{ color: statusConfig[hoveredStatus].color }}
                    >
                      {Math.round((tasks.filter(t => t.status === hoveredStatus).length / totalTasks) * 100)}%
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">
                      {tasks.filter(t => t.status === hoveredStatus).length} tasks
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Completion</span>
                    <span className="text-3xl font-black text-zinc-100 mt-0.5">
                      {totalTasks > 0 
                        ? Math.round((tasks.filter(t => t.status === 'done').length / totalTasks) * 100) 
                        : 0}%
                    </span>
                    <span className="text-[10px] text-zinc-500">done rate</span>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-xs italic">
              No tasks to analyze
            </div>
          )}
        </div>

        {/* Legend listing (Right) */}
        <div className="space-y-3">
          {distributions.map((dist) => {
            const isHovered = hoveredStatus === dist.key;
            return (
              <div
                key={dist.key}
                onMouseEnter={() => setHoveredStatus(dist.key)}
                onMouseLeave={() => setHoveredStatus(null)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isHovered 
                    ? 'bg-zinc-800/80 border-zinc-700 translate-x-1' 
                    : 'bg-zinc-950/40 border-transparent hover:bg-zinc-850 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-3.5 rounded-full" 
                    style={{ backgroundColor: dist.color }}
                  />
                  <span className="text-xs font-semibold text-zinc-300">{dist.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-zinc-500 font-mono">{dist.count} tasks</span>
                  <span 
                    className="font-bold w-10 text-right"
                    style={{ color: dist.color }}
                  >
                    {dist.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectChart;
