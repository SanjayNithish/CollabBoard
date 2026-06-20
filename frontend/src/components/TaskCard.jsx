import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { AlignLeft, ArrowUpCircle, ArrowRightCircle, ArrowDownCircle, Calendar, CheckSquare } from 'lucide-react';

const priorityConfig = {
  high: {
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    icon: ArrowUpCircle,
    label: 'High'
  },
  medium: {
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: ArrowRightCircle,
    label: 'Medium'
  },
  low: {
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: ArrowDownCircle,
    label: 'Low'
  }
};

const isDueToday = (dueDateStr) => {
  if (!dueDateStr) return false;
  
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  
  return dueDateStr === todayStr;
};

const TaskCard = ({ task, index, onClick }) => {
  const priority = priorityConfig[task.priority?.toLowerCase()] || priorityConfig.medium;
  const PriorityIcon = priority.icon;
  const dueToday = isDueToday(task.due_date);
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.is_completed).length;
  const labels = task.labels || [];

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-zinc-900 p-4 rounded-xl shadow-md select-none cursor-pointer transition duration-150 border ${
            dueToday 
              ? 'border-red-500/80 shadow-lg shadow-red-950/20' 
              : 'border-zinc-800'
          } ${
            snapshot.isDragging 
              ? 'dragging-card bg-zinc-850 border-zinc-700' 
              : 'hover:bg-zinc-850 hover:border-zinc-750'
          }`}
        >
          {/* Card Content */}
          <div className="space-y-3.5">
            {/* Header / Key & Priority */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-500 font-mono tracking-wider font-semibold">
                {task.key}
              </span>
              
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${priority.color}`}>
                <PriorityIcon className="w-3 h-3" />
                {priority.label}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-relaxed">
              {task.title}
            </h4>

            {/* Labels */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {labels.slice(0, 3).map(l => (
                  <span key={l} className="bg-zinc-800 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded border border-zinc-700">
                    {l}
                  </span>
                ))}
                {labels.length > 3 && (
                  <span className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded border border-zinc-700">
                    +{labels.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Icons: Description Indicator & Subtasks */}
            <div className="flex items-center gap-3 text-zinc-500">
              {task.description && (
                <div className="flex items-center gap-1">
                  <AlignLeft className="w-3.5 h-3.5" />
                </div>
              )}
              {subtasks.length > 0 && (
                <div className={`flex items-center gap-1 text-[11px] ${completedSubtasks === subtasks.length ? 'text-emerald-500' : ''}`}>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{completedSubtasks}/{subtasks.length}</span>
                </div>
              )}
            </div>

            {/* Bottom details / Divider */}
            <div className="border-t border-zinc-850 pt-3 flex items-center justify-between">
              {/* Due Date Indicator */}
              {task.due_date ? (
                <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  dueToday 
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              ) : (
                <div />
              )}

              {/* Assignee Avatar */}
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <div 
                    className="w-6 h-6 rounded-full bg-indigo-600 border border-indigo-500 text-[10px] text-white font-bold flex items-center justify-center"
                    title={`Assigned to ${task.assignee.username}`}
                  >
                    {task.assignee.username.substring(0, 2).toUpperCase()}
                  </div>
                ) : (
                  <div 
                    className="w-6 h-6 rounded-full bg-zinc-800 border border-dashed border-zinc-700 text-[10px] text-zinc-500 flex items-center justify-center"
                    title="Unassigned"
                  >
                    --
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
