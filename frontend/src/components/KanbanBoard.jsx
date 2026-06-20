import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { 
  CircleDot, 
  PlayCircle, 
  AlertCircle, 
  FileCheck2, 
  GitPullRequest, 
  HelpCircle, 
  Eye, 
  Send, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  User as UserIcon,
  Search,
  Filter
} from 'lucide-react';

// The 9 custom statuses config
export const columnsConfig = {
  todo: {
    id: 'todo',
    title: 'TO DO',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    icon: CircleDot,
  },
  in_progress: {
    id: 'in_progress',
    title: 'In Progress',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    icon: PlayCircle,
  },
  blocked: {
    id: 'blocked',
    title: 'Blocked',
    color: 'text-red-400 bg-red-500/10 border-red-500/20',
    icon: AlertCircle,
  },
  dev_done: {
    id: 'dev_done',
    title: 'Dev Done',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    icon: FileCheck2,
  },
  code_review: {
    id: 'code_review',
    title: 'Code Review',
    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
    icon: GitPullRequest,
  },
  ready_for_qa: {
    id: 'ready_for_qa',
    title: 'Ready for QA',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    icon: HelpCircle,
  },
  in_qa: {
    id: 'in_qa',
    title: 'In QA',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    icon: Eye,
  },
  ready_for_release: {
    id: 'ready_for_release',
    title: 'Ready for Release',
    color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    icon: Send,
  },
  done: {
    id: 'done',
    title: 'Done',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    icon: CheckCircle2,
  }
};

const KanbanBoard = ({ tasks, users, onDragEnd, onTaskClick }) => {
  const [expandedUsers, setExpandedUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Initialize expanded users on load: first person open by default
  useEffect(() => {
    if (users && users.length > 0 && Object.keys(expandedUsers).length === 0) {
      setExpandedUsers({ [users[0].id.toString()]: true });
    }
  }, [users]);

  const toggleExpand = (userId) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // source and destination droppable IDs format: ${assigneeId}::${status}
    const [srcAssigneeId, srcStatus] = source.droppableId.split('::');
    const [destAssigneeId, destStatus] = destination.droppableId.split('::');

    onDragEnd(
      draggableId, 
      srcAssigneeId, 
      destAssigneeId, 
      srcStatus, 
      destStatus, 
      source.index, 
      destination.index
    );
  };

  const boardSections = [
    ...(users || []).map((u) => ({ id: u.id.toString(), name: u.username, isUnassigned: false })),
    { id: 'unassigned', name: 'Unassigned Tasks', isUnassigned: true }
  ];

  const filteredTasks = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPriority = priorityFilter ? t.priority === priorityFilter : true;
    return matchSearch && matchPriority;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Board Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500 text-zinc-200 pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-800 focus:border-indigo-500 text-zinc-200 pl-9 pr-8 py-2 rounded-xl text-sm outline-none transition-colors appearance-none"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)] pr-2">
        {boardSections.map((section) => {
          const isExpanded = !!expandedUsers[section.id];
          const sectionTasks = filteredTasks.filter((t) => {
            const taskAssigneeId = t.assignee ? t.assignee.id.toString() : 'unassigned';
            return taskAssigneeId === section.id;
          });

          return (
            <div 
              key={section.id} 
              className="bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Accordion Toggle Bar */}
              <button
                type="button"
                onClick={() => toggleExpand(section.id)}
                className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900/60 hover:bg-zinc-850/80 transition-colors duration-150 outline-none text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-indigo-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-200">{section.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider ml-3">
                      {sectionTasks.length} {sectionTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                )}
              </button>

              {/* Collapsible Kanban Board (Only rendered or displayed when expanded) */}
              {isExpanded && (
                <div className="p-4 overflow-x-auto">
                  <div className="flex gap-4 min-w-[1400px] pb-2">
                    {Object.keys(columnsConfig).map((colKey) => {
                      const col = columnsConfig[colKey];
                      const colTasks = sectionTasks.filter((t) => t.status === colKey);
                      const ColIcon = col.icon;
                      const droppableId = `${section.id}::${colKey}`;

                      return (
                        <div 
                          key={colKey}
                          className="w-80 bg-zinc-950/40 border border-zinc-900 rounded-xl flex flex-col max-h-[450px]"
                        >
                          {/* Column Header */}
                          <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
                            <div className="flex items-center gap-2 truncate">
                              <ColIcon className={`w-3.5 h-3.5 ${col.color.split(' ')[0]}`} />
                              <span className="font-bold text-xs text-zinc-300 truncate">{col.title}</span>
                            </div>
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-full font-bold">
                              {colTasks.length}
                            </span>
                          </div>

                          {/* Droppable Zone */}
                          <Droppable droppableId={droppableId}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`flex-1 overflow-y-auto p-3 space-y-3 min-h-[120px] transition-colors duration-150 ${
                                  snapshot.isDraggingOver ? 'bg-zinc-900/20' : ''
                                }`}
                              >
                                {colTasks.map((task, index) => (
                                  <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={index}
                                    onClick={() => onTaskClick(task)}
                                  />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
