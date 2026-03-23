import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDetail } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { BoardColumn } from '@/components/board/BoardColumn';
import { TaskModal } from '@/components/task/TaskModal';
import { AvatarCircle } from '@/components/ui/AvatarCircle';
import { Spinner } from '@/components/ui/Spinner';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Plus, Settings, Search, ArrowLeft, UserPlus } from 'lucide-react';
import type { Task, Profile } from '@/types';

export default function ProjectBoard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, members, columns, loading, addColumn, updateColumn, deleteColumn, inviteMember } = useProjectDetail(id);
  const { tasks, createTask, updateTask, deleteTask, reorderTasks, addAssignee, removeAssignee, fetchTasks } = useTasks(id);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const isOwner = project?.owner_id === user?.id;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    const sourceTasks = tasks
      .filter(t => t.column_id === source.droppableId)
      .sort((a, b) => a.order - b.order);
    const destTasks = source.droppableId === destination.droppableId
      ? sourceTasks
      : tasks.filter(t => t.column_id === destination.droppableId).sort((a, b) => a.order - b.order);

    // Remove from source
    const movedTask = sourceTasks.find(t => t.id === draggableId);
    if (!movedTask) return;

    if (source.droppableId === destination.droppableId) {
      const reordered = [...sourceTasks];
      reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, movedTask);
      await reorderTasks(reordered.map((t, i) => ({ id: t.id, column_id: t.column_id, order: i })));
    } else {
      const newSourceTasks = sourceTasks.filter(t => t.id !== draggableId);
      const newDestTasks = [...destTasks];
      newDestTasks.splice(destination.index, 0, { ...movedTask, column_id: destination.droppableId });

      const updates = [
        ...newSourceTasks.map((t, i) => ({ id: t.id, column_id: source.droppableId, order: i })),
        ...newDestTasks.map((t, i) => ({ id: t.id, column_id: destination.droppableId, order: i })),
      ];
      await reorderTasks(updates);
    }
  };

  const handleAddColumn = async () => {
    if (newColumnName.trim()) {
      await addColumn(newColumnName.trim());
      setNewColumnName('');
      setAddingColumn(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember(inviteEmail.trim());
      setInviteEmail('');
      setShowInvite(false);
    } catch (err: any) {
      alert(err.message || 'Failed to invite');
    }
  };

  const filteredTasks = searchQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><Spinner className="pt-32" /></div>;
  if (!project) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-32 text-center text-muted-foreground">Project not found</div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[64px]">
        {/* Board Header */}
        <div className="px-4 lg:px-6 py-4 bento-card m-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground" style={{ lineHeight: '1.2' }}>{project.name}</h1>
              {project.description && <p className="text-xs text-muted-foreground mt-0.5">{project.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 mr-2">
                {members.slice(0, 5).map(m => m.profile && (
                  <AvatarCircle key={m.id} name={m.profile.name} color={m.profile.avatar_color} size="sm" className="ring-2 ring-card" />
                ))}
              </div>
              {isOwner && (
                <button onClick={() => setShowInvite(!showInvite)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Invite member">
                  <UserPlus className="w-4 h-4" />
                </button>
              )}
              {isOwner && (
                <button onClick={() => navigate(`/project/${id}/settings`)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          {showInvite && (
            <div className="mt-3 flex gap-2 max-w-sm animate-fade-in">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address"
                className="flex-1 px-3 py-1.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
              />
              <button onClick={handleInvite} className="px-4 py-1.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-semibold rounded-lg hover:shadow-md hover:from-blue-500 hover:to-blue-600 transition-all active:scale-95">Invite</button>
            </div>
          )}
        </div>

        {/* Board */}
        <div className="flex gap-4 p-6 overflow-x-auto h-[calc(100vh-200px)] scrollbar-thin">
          <DragDropContext onDragEnd={handleDragEnd}>
            {columns.map(col => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={filteredTasks.filter(t => t.column_id === col.id).sort((a, b) => a.order - b.order)}
                onAddTask={(title) => createTask(title, col.id)}
                onClickTask={(task) => setSelectedTask(task)}
                onRenameColumn={(name) => updateColumn(col.id, name)}
                onDeleteColumn={() => deleteColumn(col.id)}
              />
            ))}
          </DragDropContext>

          {/* Add Column */}
          <div className="min-w-[280px]">
            {addingColumn ? (
              <div className="bento-card p-3">
                <input autoFocus value={newColumnName} onChange={e => setNewColumnName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') setAddingColumn(false); }}
                  placeholder="Column name..." className="w-full px-3 py-2 rounded-lg border bg-card text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <div className="flex gap-2">
                  <button onClick={handleAddColumn} className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md font-medium">Add</button>
                  <button onClick={() => setAddingColumn(false)} className="px-3 py-1.5 text-xs text-muted-foreground">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingColumn(true)}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors bento-card">
                <Plus className="w-4 h-4" /> Add Column
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={id!}
          members={members}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updates) => { await updateTask(selectedTask.id, updates); }}
          onDelete={async () => { await deleteTask(selectedTask.id); setSelectedTask(null); }}
          onAddAssignee={(userId) => addAssignee(selectedTask.id, userId)}
          onRemoveAssignee={(userId) => removeAssignee(selectedTask.id, userId)}
          allTasks={tasks}
        />
      )}
    </div>
  );
}
