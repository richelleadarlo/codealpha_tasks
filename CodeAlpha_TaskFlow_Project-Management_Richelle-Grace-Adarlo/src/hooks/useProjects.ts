import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Project, ProjectMember, Profile, Column } from '@/types';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<(Project & { members: (ProjectMember & { profile: Profile })[], task_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: memberData } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    if (!memberData?.length) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const projectIds = memberData.map(m => m.project_id);

    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    if (!projectData) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const { data: allMembersRaw } = await supabase
      .from('project_members')
      .select('*')
      .in('project_id', projectIds);

    // Fetch profiles for all member user_ids
    const memberUserIds = [...new Set((allMembersRaw || []).map(m => m.user_id))];
    const { data: profilesData } = memberUserIds.length > 0
      ? await supabase.from('profiles').select('*').in('id', memberUserIds)
      : { data: [] };
    const profileMap: Record<string, Profile> = {};
    (profilesData || []).forEach(p => { profileMap[p.id] = p as Profile; });
    const allMembers = (allMembersRaw || []).map(m => ({ ...m, profile: profileMap[m.user_id] }));

    const { data: taskCounts } = await supabase
      .from('tasks')
      .select('project_id')
      .in('project_id', projectIds);

    const countMap: Record<string, number> = {};
    taskCounts?.forEach(t => {
      countMap[t.project_id] = (countMap[t.project_id] || 0) + 1;
    });

    const enriched = projectData.map(p => ({
      ...p,
      members: (allMembers?.filter(m => m.project_id === p.id) || []) as (ProjectMember & { profile: Profile })[],
      task_count: countMap[p.id] || 0,
    }));

    setProjects(enriched as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async (name: string, description: string, accentColor: string, visibility: string) => {
    if (!user) return null;

    const projectId = crypto.randomUUID();
    const projectPayload = {
      id: projectId,
      name,
      description: description || null,
      accent_color: accentColor,
      visibility,
      owner_id: user.id,
    };

    const { error: projectError } = await supabase
      .from('projects')
      .insert(projectPayload);

    if (projectError) throw projectError;

    const { error: memberError } = await supabase.from('project_members').insert({
      project_id: projectId,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      await supabase.from('projects').delete().eq('id', projectId);
      throw memberError;
    }

    // Create default columns
    const defaultCols = ['To Do', 'In Progress', 'Done'];
    const { error: columnsError } = await supabase.from('columns').insert(
      defaultCols.map((columnName, index) => ({
        project_id: projectId,
        name: columnName,
        order: index,
      }))
    );

    if (columnsError) {
      await supabase.from('projects').delete().eq('id', projectId);
      throw columnsError;
    }

    const { data: project, error: fetchCreatedError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchCreatedError || !project) throw fetchCreatedError;

    await fetchProjects();
    return project as Project;
  };

  const deleteProject = async (projectId: string) => {
    await supabase.from('projects').delete().eq('id', projectId);
    await fetchProjects();
  };

  const updateProject = async (projectId: string, updates: Partial<Pick<Project, 'name' | 'description' | 'accent_color'>>) => {
    await supabase.from('projects').update(updates).eq('id', projectId);
    await fetchProjects();
  };

  return { projects, loading, fetchProjects, createProject, deleteProject, updateProject };
}

export function useProjectDetail(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<(ProjectMember & { profile: Profile })[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    const [projectRes, membersRes, columnsRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', projectId).single(),
      supabase.from('project_members').select('*').eq('project_id', projectId),
      supabase.from('columns').select('*').eq('project_id', projectId).order('order'),
    ]);

    if (projectRes.data) setProject(projectRes.data as Project);
    if (columnsRes.data) setColumns(columnsRes.data as Column[]);

    // Fetch profiles for members
    if (membersRes.data && membersRes.data.length > 0) {
      const userIds = membersRes.data.map(m => m.user_id);
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
      const profileMap: Record<string, Profile> = {};
      (profiles || []).forEach(p => { profileMap[p.id] = p as Profile; });
      setMembers(membersRes.data.map(m => ({ ...m, profile: profileMap[m.user_id] })) as any);
    } else {
      setMembers([]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  // Realtime for columns
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`columns-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns', filter: `project_id=eq.${projectId}` }, () => {
        fetchProject();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchProject]);

  const inviteMember = async (email: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (!profile) throw new Error('User not found');

    const { error } = await supabase.from('project_members').insert({
      project_id: projectId!,
      user_id: profile.id,
      role: 'member',
    });
    if (error) throw error;

    // Create notification
    await supabase.from('notifications').insert({
      recipient_id: profile.id,
      type: 'project_invite',
      message: `You were added to project "${project?.name}"`,
      project_id: projectId!,
    });

    await fetchProject();
  };

  const removeMember = async (userId: string) => {
    await supabase.from('project_members').delete().eq('project_id', projectId!).eq('user_id', userId);
    await fetchProject();
  };

  const addColumn = async (name: string) => {
    const maxOrder = columns.length > 0 ? Math.max(...columns.map(c => c.order)) + 1 : 0;
    await supabase.from('columns').insert({ project_id: projectId!, name, order: maxOrder });
    await fetchProject();
  };

  const updateColumn = async (columnId: string, name: string) => {
    await supabase.from('columns').update({ name }).eq('id', columnId);
    await fetchProject();
  };

  const deleteColumn = async (columnId: string) => {
    await supabase.from('columns').delete().eq('id', columnId);
    await fetchProject();
  };

  const reorderColumns = async (reordered: Column[]) => {
    setColumns(reordered);
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('columns').update({ order: i }).eq('id', reordered[i].id);
    }
  };

  return {
    project, members, columns, loading,
    fetchProject, inviteMember, removeMember,
    addColumn, updateColumn, deleteColumn, reorderColumns,
  };
}
