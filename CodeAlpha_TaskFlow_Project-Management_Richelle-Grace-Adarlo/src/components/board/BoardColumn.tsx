import React, { useState } from 'react';
import type { Column, Task, Profile } from '@/types';
import { TaskCard } from './TaskCard';
import { Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';

interface BoardColumnProps {
  column: Column;
  tasks: (Task & { assignees: Profile[]; comment_count: number })[];
  onAddTask: (title: string) => void;
  onClickTask: (task: Task) => void;
  onRenameColumn: (name: string) => void;
  onDeleteColumn: () => void;
}

export function BoardColumn({ column, tasks, onAddTask, onClickTask, onRenameColumn, onDeleteColumn }: BoardColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleRename = () => {
    if (editName.trim() && editName.trim() !== column.name) {
      onRenameColumn(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col w-[280px] min-w-[280px] max-h-[calc(100vh-140px)] bento-card">
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-3 py-3.5">
        {isEditing ? (
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditing(false); }}
            className="mr-2 w-full rounded-xl border border-border/70 bg-card px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        ) : (
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-semibold text-foreground cursor-pointer"
              onDoubleClick={() => { setIsEditing(true); setEditName(column.name); }}
            >
              {column.name}
            </h3>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        )}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="rounded-xl border border-border/60 bg-card/60 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full z-20 mt-2 w-40 rounded-2xl border border-border/70 bg-card/95 p-1 shadow-[0_20px_50px_-32px_rgba(10,16,28,0.9)] dark:shadow-[0_20px_50px_-32px_rgba(255,255,255,0.34)] backdrop-blur-xl animate-fade-in">
              <button
                onClick={() => { setIsEditing(true); setEditName(column.name); setShowMenu(false); }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
              <button
                onClick={() => {
                  if (tasks.length > 0) {
                    alert('Remove all tasks from this column first');
                  } else {
                    onDeleteColumn();
                  }
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`scrollbar-thin flex-1 overflow-y-auto px-2 pb-2 pt-2 min-h-[60px] rounded-[1.2rem] transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/6' : 'bg-background/25'
            }`}
          >
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} onClick={() => onClickTask(task)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add Task */}
      <div className="px-2 pb-2">
        {isAdding ? (
          <div className="rounded-[1.2rem] border border-border/65 bg-background/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsAdding(false); }}
              placeholder="Task title..."
              className="mb-2 w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="px-4 py-1.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-xs font-semibold rounded-lg hover:shadow-md hover:from-blue-500 hover:to-blue-600 transition-all active:scale-95">Add</button>
              <button onClick={() => setIsAdding(false)} className="rounded-lg px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted">Cancel</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-1 rounded-xl border border-dashed border-border/65 bg-background/25 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/35 hover:bg-muted hover:text-foreground"
          >
            <Plus className="w-4 h-4" /> Add task
          </button>
        )}
      </div>
    </div>
  );
}
