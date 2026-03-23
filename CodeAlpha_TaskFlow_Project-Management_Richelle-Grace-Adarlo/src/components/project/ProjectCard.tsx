import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Project, ProjectMember, Profile } from '@/types';
import { AvatarCircle } from '@/components/ui/AvatarCircle';
import { useTheme } from '@/context/ThemeContext';
import { Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project & { members: (ProjectMember & { profile: Profile })[]; task_count: number };
  index: number;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');

  if (normalized.length !== 6) {
    return { r: 99, g: 102, b: 241 };
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function mixWithWhite(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function mixWithBlack(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel * (1 - amount));

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const visibleMembers = project.members.slice(0, 4);
  const overflowCount = project.members.length - 4;
  const accentWash = theme === 'dark'
    ? mixWithBlack(project.accent_color, 0.7)
    : mixWithWhite(project.accent_color, 0.78);
  const accentWashEnd = theme === 'dark'
    ? mixWithBlack(project.accent_color, 0.78)
    : mixWithWhite(project.accent_color, 0.86);
  const accentPanel = theme === 'dark'
    ? mixWithBlack(project.accent_color, 0.58)
    : mixWithWhite(project.accent_color, 0.88);
  const panelBorder = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)';
  const panelInset = theme === 'dark'
    ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
    : 'inset 0 1px 0 rgba(255,255,255,0.24)';

  return (
    <div
      onClick={() => navigate(`/project/${project.id}`)}
      className="bento-card relative overflow-hidden p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_26px_70px_-34px_rgba(15,23,42,0.5)] dark:hover:shadow-[0_26px_70px_-34px_rgba(255,255,255,0.32)] transition-all duration-200 active:scale-[0.98] group animate-fade-in-up"
      style={{
        animationDelay: `${index * 80}ms`,
        background: `linear-gradient(180deg, ${accentWash} 0%, ${accentWashEnd} 100%)`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: project.accent_color }}
      />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Project</p>
          <h3 className="mt-2 font-semibold text-foreground transition-colors group-hover:text-primary">{project.name}</h3>
        </div>
      </div>
      {project.description && (
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{project.description}</p>
      )}

      <div
        className="mt-3 flex items-center justify-between gap-3 rounded-2xl px-3 py-3"
        style={{
          backgroundColor: accentPanel,
          border: `1px solid ${panelBorder}`,
          boxShadow: panelInset,
        }}
      >
        <div className="flex -space-x-2">
          {visibleMembers.map(m => m.profile && (
            <AvatarCircle key={m.id} name={m.profile.name} color={m.profile.avatar_color} size="sm" className="ring-2 ring-card" />
          ))}
          {overflowCount > 0 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">
              +{overflowCount}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 rounded-full bg-card/60 px-2 py-1">
            <CheckSquare className="w-3.5 h-3.5" />
            {project.task_count}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-card/60 px-2 py-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(project.created_at), 'MMM d')}
          </span>
        </div>
      </div>
    </div>
  );
}
