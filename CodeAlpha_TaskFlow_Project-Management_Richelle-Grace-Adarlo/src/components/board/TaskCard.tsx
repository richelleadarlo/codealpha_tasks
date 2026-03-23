import React from 'react';
import type { Task, Profile, Priority } from '@/types';
import { PriorityBadge } from '@/components/task/PriorityBadge';
import { AvatarCircle } from '@/components/ui/AvatarCircle';
import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Draggable } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task & { assignees: Profile[]; comment_count: number };
  index: number;
  onClick: () => void;
}

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

  const priorityBorderColor: Record<Priority, string> = {
    none: 'transparent',
    low: 'hsl(217, 91%, 60%)',
    medium: 'hsl(38, 92%, 50%)',
    high: 'hsl(25, 95%, 53%)',
    urgent: 'hsl(0, 84%, 60%)',
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bento-card mb-3 cursor-pointer rounded-[1.35rem] p-4 transition-all duration-150 ${
            snapshot.isDragging ? 'scale-[1.03] ring-2 ring-primary/30 shadow-2xl dark:shadow-[0_18px_42px_-14px_rgba(255,255,255,0.3)]' : 'hover:-translate-y-1 hover:shadow-[0_22px_54px_-34px_rgba(15,23,42,0.75)] dark:hover:shadow-[0_22px_54px_-34px_rgba(255,255,255,0.34)]'
          }`}
          style={{
            ...provided.draggableProps.style,
            borderLeft: `4px solid ${priorityBorderColor[task.priority as Priority] || 'transparent'}`,
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
            <div className="mt-0.5 flex -space-x-1.5">
              {task.assignees?.slice(0, 2).map(a => (
                <AvatarCircle key={a.id} name={a.name} color={a.avatar_color} size="sm" className="ring-2 ring-card" />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority as Priority} />
            {task.labels?.slice(0, 2).map(label => (
              <span key={label} className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">{label}</span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.due_date && (
                <span className={`flex items-center gap-1 ${isOverdue ? 'font-medium text-destructive' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  {format(new Date(task.due_date), 'MMM d')}
                </span>
              )}
              {task.comment_count > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {task.comment_count}
                </span>
              )}
              {(task.attachments?.length || 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {task.attachments.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Task</span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
