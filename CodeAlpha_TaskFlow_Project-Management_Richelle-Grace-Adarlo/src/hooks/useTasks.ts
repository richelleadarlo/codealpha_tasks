import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Task, Profile, Comment, Priority } from '@/types';

export function useTasks(projectId: string | undefined) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<(Task & { assignees: Profile[], comment_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order');

    if (!tasksData) { setLoading(false); return; }

    const taskIds = tasksData.map(t => t.id);

    const [assigneesRes, commentsRes] = await Promise.all([
      taskIds.length > 0
        ? supabase.from('task_assignees').select('*').in('task_id', taskIds)
        : Promise.resolve({ data: [] as any[] }),
      taskIds.length > 0
        ? supabase.from('comments').select('id, task_id').in('task_id', taskIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    // Fetch profiles for assignees
    const assigneeUserIds = [...new Set((assigneesRes.data || []).map((a: any) => a.user_id))];
    const { data: assigneeProfiles } = assigneeUserIds.length > 0
      ? await supabase.from('profiles').select('*').in('id', assigneeUserIds)
      : { data: [] as any[] };
    const profileMap: Record<string, Profile> = {};
    (assigneeProfiles || []).forEach((p: any) => { profileMap[p.id] = p as Profile; });

    const assigneeMap: Record<string, Profile[]> = {};
    (assigneesRes.data || []).forEach((a: any) => {
      if (!assigneeMap[a.task_id]) assigneeMap[a.task_id] = [];
      if (profileMap[a.user_id]) assigneeMap[a.task_id].push(profileMap[a.user_id]);
    });

    const commentCountMap: Record<string, number> = {};
    (commentsRes.data || []).forEach((c: any) => {
      commentCountMap[c.task_id] = (commentCountMap[c.task_id] || 0) + 1;
    });

    const enriched = tasksData.map(t => ({
      ...t,
      checklist: Array.isArray(t.checklist) ? t.checklist : [],
      attachments: Array.isArray(t.attachments) ? t.attachments : [],
      activity_log: Array.isArray(t.activity_log) ? t.activity_log : [],
      labels: Array.isArray(t.labels) ? t.labels : [],
      assignees: assigneeMap[t.id] || [],
      comment_count: commentCountMap[t.id] || 0,
    }));

    setTasks(enriched as any);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Realtime
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`tasks-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchTasks]);

  const createTask = async (title: string, columnId: string) => {
    if (!user || !projectId) return;
    const maxOrder = tasks.filter(t => t.column_id === columnId).length;
    const { data, error } = await supabase.from('tasks').insert({
      title,
      column_id: columnId,
      project_id: projectId,
      order: maxOrder,
      created_by: user.id,
    }).select().single();
    if (error) throw error;
    await fetchTasks();
    return data;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const { error } = await supabase.from('tasks').update(updates as any).eq('id', taskId);
    if (error) throw error;
    await fetchTasks();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    await fetchTasks();
  };

  const moveTask = async (taskId: string, newColumnId: string, newOrder: number) => {
    await supabase.from('tasks').update({ column_id: newColumnId, order: newOrder }).eq('id', taskId);
  };

  const reorderTasks = async (reorderedTasks: { id: string; column_id: string; order: number }[]) => {
    for (const t of reorderedTasks) {
      await supabase.from('tasks').update({ column_id: t.column_id, order: t.order }).eq('id', t.id);
    }
    await fetchTasks();
  };

  const addAssignee = async (taskId: string, userId: string) => {
    await supabase.from('task_assignees').insert({ task_id: taskId, user_id: userId });
    // Notification
    if (userId !== user?.id) {
      const task = tasks.find(t => t.id === taskId);
      await supabase.from('notifications').insert({
        recipient_id: userId,
        type: 'assigned',
        message: `You were assigned to "${task?.title}"`,
        project_id: projectId!,
        task_id: taskId,
      });
    }
    await fetchTasks();
  };

  const removeAssignee = async (taskId: string, userId: string) => {
    await supabase.from('task_assignees').delete().eq('task_id', taskId).eq('user_id', userId);
    await fetchTasks();
  };

  return { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, moveTask, reorderTasks, addAssignee, removeAssignee };
}

export function useMyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<(Task & { project_name: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: assignees } = await supabase
        .from('task_assignees')
        .select('task_id')
        .eq('user_id', user.id);

      if (!assignees?.length) { setTasks([]); setLoading(false); return; }

      const taskIds = assignees.map(a => a.task_id);
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*, project:projects(name)')
        .in('id', taskIds)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (tasksData) {
        setTasks(tasksData.map((t: any) => ({
          ...t,
          checklist: Array.isArray(t.checklist) ? t.checklist : [],
          attachments: Array.isArray(t.attachments) ? t.attachments : [],
          activity_log: Array.isArray(t.activity_log) ? t.activity_log : [],
          labels: Array.isArray(t.labels) ? t.labels : [],
          project_name: t.project?.name || 'Unknown',
        })) as any);
      }
      setLoading(false);
    })();
  }, [user]);

  return { tasks, loading };
}

export function useComments(taskId: string | undefined) {
  const [comments, setComments] = useState<(Comment & { author: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map(c => c.author_id))];
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', authorIds);
      const profileMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p as Profile; });
      setComments(data.map(c => ({ ...c, author: profileMap[c.author_id] })) as any);
    } else {
      setComments([]);
    }
    setLoading(false);
  }, [taskId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  // Realtime
  useEffect(() => {
    if (!taskId) return;
    const channel = supabase
      .channel(`comments-${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `task_id=eq.${taskId}` }, () => {
        fetchComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [taskId, fetchComments]);

  return { comments, loading, fetchComments };
}
