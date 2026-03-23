import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AvatarCircle } from '@/components/ui/AvatarCircle';
import { PriorityBadge } from '@/components/task/PriorityBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useComments } from '@/hooks/useTasks';
import type { Task, Profile, ProjectMember, Column, Priority, ChecklistItem } from '@/types';
import { PRIORITY_CONFIG } from '@/types';
import { Calendar, Trash2, Tag, Paperclip, CheckSquare, MessageSquare, Clock, Send, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TaskModalProps {
  task: Task;
  projectId: string;
  members: (ProjectMember & { profile: Profile })[];
  columns: Column[];
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddAssignee: (userId: string) => Promise<void>;
  onRemoveAssignee: (userId: string) => Promise<void>;
  allTasks: (Task & { assignees: Profile[] })[];
}

export function TaskModal({ task, projectId, members, columns, onClose, onUpdate, onDelete, onAddAssignee, onRemoveAssignee, allTasks }: TaskModalProps) {
  const { user } = useAuth();
  const currentTask = allTasks.find(t => t.id === task.id) || task;
  const assignees = (currentTask as any).assignees || [];
  const { comments, loading: commentsLoading, fetchComments } = useComments(task.id);

  const [title, setTitle] = useState(currentTask.title);
  const [description, setDescription] = useState(currentTask.description || '');
  const [priority, setPriority] = useState(currentTask.priority);
  const [dueDate, setDueDate] = useState(currentTask.due_date ? format(new Date(currentTask.due_date), 'yyyy-MM-dd') : '');
  const [showAssignees, setShowAssignees] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [labels, setLabels] = useState<string[]>(currentTask.labels || []);
  const [checklist, setChecklist] = useState<ChecklistItem[]>((currentTask.checklist || []) as ChecklistItem[]);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editCommentBody, setEditCommentBody] = useState('');

  const handleTitleBlur = () => { if (title !== currentTask.title) onUpdate({ title }); };
  const handleDescBlur = () => { if (description !== (currentTask.description || '')) onUpdate({ description: description || null }); };
  const handlePriorityChange = (p: Priority) => { setPriority(p); onUpdate({ priority: p }); };
  const handleDueDateChange = (d: string) => { setDueDate(d); onUpdate({ due_date: d ? new Date(d).toISOString() : null }); };
  const handleColumnChange = (colId: string) => { onUpdate({ column_id: colId }); };

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      const newLabels = [...labels, labelInput.trim()];
      setLabels(newLabels);
      setLabelInput('');
      onUpdate({ labels: newLabels });
    }
  };

  const handleRemoveLabel = (l: string) => {
    const newLabels = labels.filter(x => x !== l);
    setLabels(newLabels);
    onUpdate({ labels: newLabels });
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    const item: ChecklistItem = { id: crypto.randomUUID(), text: newCheckItem.trim(), completed: false };
    const updated = [...checklist, item];
    setChecklist(updated);
    setNewCheckItem('');
    onUpdate({ checklist: updated as any });
  };

  const handleToggleCheck = (itemId: string) => {
    const updated = checklist.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
    setChecklist(updated);
    onUpdate({ checklist: updated as any });
  };

  const handleRemoveCheck = (itemId: string) => {
    const updated = checklist.filter(i => i.id !== itemId);
    setChecklist(updated);
    onUpdate({ checklist: updated as any });
  };

  const completedCount = checklist.filter(i => i.completed).length;

  const handleAddComment = async () => {
    if (!commentBody.trim() || !user) return;
    await supabase.from('comments').insert({
      task_id: task.id,
      project_id: projectId,
      author_id: user.id,
      body: commentBody.trim(),
    });
    setCommentBody('');
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentBody.trim()) return;
    await supabase.from('comments').update({ body: editCommentBody.trim(), edited: true }).eq('id', commentId);
    setEditingComment(null);
    await fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
    await fetchComments();
  };

  const renderCommentBody = (body: string) => {
    return body
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-muted rounded text-xs">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-5 p-6">
        {/* Title */}
        <div className="bento-card bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 p-5">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="mb-1 w-full rounded-2xl bg-transparent px-1 -ml-1 text-xl font-bold text-foreground focus:bg-muted/40 focus:outline-none"
            style={{ lineHeight: '1.3' }}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              value={currentTask.column_id}
              onChange={e => handleColumnChange(e.target.value)}
              className="rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs focus:outline-none"
            >
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={priority}
              onChange={e => handlePriorityChange(e.target.value as Priority)}
              className="rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs focus:outline-none"
            >
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="date" value={dueDate} onChange={e => handleDueDateChange(e.target.value)}
                className="bg-transparent text-xs focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
        {/* Description */}
        <div className="bento-card p-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Add a description..."
            className="min-h-[104px] w-full resize-none rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Assignees */}
        <div className="bento-card p-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">Assignees</label>
          <div className="flex flex-wrap items-center gap-2">
            {assignees.map((a: Profile) => (
              <div key={a.id} className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 pl-1 pr-2 py-0.5">
                <AvatarCircle name={a.name} color={a.avatar_color} size="sm" />
                <span className="text-xs font-medium">{a.name}</span>
                <button onClick={() => onRemoveAssignee(a.id)} className="text-muted-foreground hover:text-destructive ml-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="relative">
              <button onClick={() => setShowAssignees(!showAssignees)}
                className="rounded-xl border border-dashed border-border/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
                + Add
              </button>
              {showAssignees && (
                <div className="absolute left-0 top-full z-20 mt-2 max-h-48 w-56 overflow-y-auto rounded-2xl border border-border/70 bg-card/95 p-1 shadow-[0_20px_50px_-32px_rgba(10,16,28,0.9)] dark:shadow-[0_20px_50px_-32px_rgba(255,255,255,0.34)] backdrop-blur-xl animate-fade-in">
                  {members.filter(m => m.profile && !assignees.some((a: Profile) => a.id === m.user_id)).map(m => (
                    <button
                      key={m.id}
                      onClick={() => { onAddAssignee(m.user_id); setShowAssignees(false); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                      <AvatarCircle name={m.profile.name} color={m.profile.avatar_color} size="sm" />
                      <span>{m.profile.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="bento-card p-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Labels
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {labels.map(l => (
              <span key={l} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {l}
                <button onClick={() => handleRemoveLabel(l)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddLabel(); }}
              placeholder="Add label..." className="flex-1 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs focus:outline-none" />
            <button onClick={handleAddLabel} className="rounded-xl bg-muted px-3 py-2 text-xs hover:bg-muted/80">Add</button>
          </div>
        </div>
          </div>

          <div className="space-y-5">
        {/* Checklist */}
        <div className="bento-card p-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" /> Checklist
            {checklist.length > 0 && <span className="text-muted-foreground">({completedCount}/{checklist.length})</span>}
          </label>
          {checklist.length > 0 && (
            <div className="w-full bg-muted rounded-full h-1.5 mb-2">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0}%` }} />
            </div>
          )}
          <div className="space-y-1 mb-2">
            {checklist.map(item => (
              <div key={item.id} className="group flex items-center gap-2 rounded-xl bg-background/40 px-2 py-2">
                <input type="checkbox" checked={item.completed} onChange={() => handleToggleCheck(item.id)}
                  className="rounded border-border accent-primary" />
                <span className={`text-sm flex-1 ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</span>
                <button onClick={() => handleRemoveCheck(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newCheckItem} onChange={e => setNewCheckItem(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCheckItem(); }}
              placeholder="Add item..." className="flex-1 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-xs focus:outline-none" />
            <button onClick={handleAddCheckItem} className="rounded-xl bg-muted px-3 py-2 text-xs hover:bg-muted/80">Add</button>
          </div>
        </div>

        {/* Comments */}
        <div className="bento-card p-5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
          </label>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scrollbar-thin">
            {comments.map(c => (
              <div key={c.id} className="flex gap-2.5 rounded-2xl bg-background/40 px-3 py-3">
                {c.author && <AvatarCircle name={c.author.name} color={c.author.avatar_color} size="md" className="mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{c.author?.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                    {c.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
                  </div>
                  {editingComment === c.id ? (
                    <div className="mt-1 flex gap-2">
                      <input value={editCommentBody} onChange={e => setEditCommentBody(e.target.value)}
                        className="flex-1 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm focus:outline-none" />
                      <button onClick={() => handleEditComment(c.id)} className="text-xs text-primary">Save</button>
                      <button onClick={() => setEditingComment(null)} className="text-xs text-muted-foreground">Cancel</button>
                    </div>
                  ) : (
                    <div className="text-sm text-foreground mt-0.5" dangerouslySetInnerHTML={{ __html: renderCommentBody(c.body) }} />
                  )}
                  <div className="flex gap-2 mt-1">
                    {c.author_id === user?.id && (
                      <button onClick={() => { setEditingComment(c.id); setEditCommentBody(c.body); }}
                        className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
                    )}
                    {(c.author_id === user?.id) && (
                      <button onClick={() => handleDeleteComment(c.id)}
                        className="text-xs text-muted-foreground hover:text-destructive">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={commentBody} onChange={e => setCommentBody(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }}}
              placeholder="Write a comment..."
              className="flex-1 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={handleAddComment} disabled={!commentBody.trim()}
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-3 text-primary-foreground hover:shadow-lg hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 active:scale-[0.97]">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/70 pt-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 rounded-full bg-muted/45 px-3 py-2">
            <Clock className="w-3.5 h-3.5" />
            Created {format(new Date(currentTask.created_at), 'MMM d, yyyy')}
          </div>
          <button onClick={onDelete} className="flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-2 text-destructive transition-colors hover:bg-destructive/15">
            <Trash2 className="w-3.5 h-3.5" /> Delete task
          </button>
        </div>
      </div>
    </Modal>
  );
}
