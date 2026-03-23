import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useMyTasks } from '@/hooks/useTasks';
import { Navbar } from '@/components/layout/Navbar';
import { ProjectCard } from '@/components/project/ProjectCard';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { PriorityBadge } from '@/components/task/PriorityBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/components/ui/sonner';
import { Plus, FolderKanban, ListTodo, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isPast, isToday } from 'date-fns';
import type { Priority } from '@/types';

export default function Home() {
  const { profile } = useAuth();
  const { projects, loading, createProject } = useProjects();
  const { tasks: myTasks, loading: tasksLoading } = useMyTasks();
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (name: string, desc: string, color: string, vis: string) => {
    const project = await createProject(name, desc, color, vis);
    if (project) {
      toast.success('Project created');
      navigate(`/project/${project.id}`);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-[74px] px-4 lg:px-8 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bento-card flex items-center justify-between py-5 px-5 sm:px-6 mt-5 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: '1.2' }}>
              Welcome back, {profile?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Here's what's happening across your projects</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            My Projects
          </h2>
          {loading ? (
            <Spinner className="py-12" />
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start organizing tasks"
              icon={<FolderKanban className="w-12 h-12" />}
              action={
                <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all active:scale-95">
                  Create Project
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
            </div>
          )}
        </section>

        {/* My Tasks */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" />
            My Tasks
          </h2>
          {tasksLoading ? (
            <Spinner className="py-8" />
          ) : myTasks.length === 0 ? (
            <EmptyState
              title="No assigned tasks"
              description="Tasks assigned to you will appear here"
              icon={<ListTodo className="w-12 h-12" />}
            />
          ) : (
            <div className="bento-card divide-y overflow-hidden">
              {myTasks.slice(0, 10).map(task => {
                const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/project/${task.project_id}`)}
                    className="flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="h-9 w-1.5 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{(task as any).project_name}</p>
                    </div>
                    <PriorityBadge priority={task.priority as Priority} />
                    {task.due_date && (
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${isOverdue ? 'bg-destructive/10 text-destructive' : 'bg-muted/55 text-muted-foreground'}`}>
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
    </div>
  );
}
