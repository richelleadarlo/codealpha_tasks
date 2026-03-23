import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectDetail, useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { AvatarCircle } from '@/components/ui/AvatarCircle';
import { Spinner } from '@/components/ui/Spinner';
import { ACCENT_COLORS } from '@/types';
import { ArrowLeft, Trash2, UserMinus, Crown } from 'lucide-react';

export default function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, members, loading, fetchProject, inviteMember, removeMember } = useProjectDetail(id);
  const { updateProject, deleteProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  React.useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setAccentColor(project.accent_color);
    }
  }, [project]);

  if (loading) return <div className="min-h-screen bg-background"><Navbar /><Spinner className="pt-32" /></div>;
  if (!project || project.owner_id !== user?.id) return <div className="min-h-screen bg-background"><Navbar /><div className="pt-32 text-center text-muted-foreground">Access denied</div></div>;

  const handleSave = async () => {
    await updateProject(project.id, { name, description: description || null, accent_color: accentColor });
    await fetchProject();
  };

  const handleDelete = async () => {
    if (deleteConfirm !== project.name) return;
    await deleteProject(project.id);
    navigate('/dashboard');
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteMember(inviteEmail.trim());
      setInviteEmail('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px] px-4 lg:px-8 max-w-2xl mx-auto pb-12">
        <button onClick={() => navigate(`/project/${id}`)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-6 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to board
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-6" style={{ lineHeight: '1.2' }}>Project Settings</h1>

        {/* General */}
        <section className="bento-card p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Accent Color</label>
              <div className="flex gap-2">
                {ACCENT_COLORS.map(c => (
                  <button key={c} onClick={() => setAccentColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${accentColor === c ? 'ring-2 ring-offset-2 ring-foreground/30 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium active:scale-[0.97]">Save Changes</button>
          </div>
        </section>

        {/* Members */}
        <section className="bento-card p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-4">Members</h2>
          <div className="flex gap-2 mb-4">
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address"
              className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }} />
            <button onClick={handleInvite} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium active:scale-[0.97]">Invite</button>
          </div>
          <div className="divide-y">
            {members.map(m => m.profile && (
              <div key={m.id} className="flex items-center gap-3 py-3">
                <AvatarCircle name={m.profile.name} color={m.profile.avatar_color} size="md" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.profile.name}</p>
                  <p className="text-xs text-muted-foreground">{m.profile.email}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {m.role === 'owner' && <Crown className="w-3 h-3" />}
                  {m.role}
                </span>
                {m.role !== 'owner' && (
                  <button onClick={() => removeMember(m.user_id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bento-card border-destructive/30 p-5">
          <h2 className="font-semibold text-destructive mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-3">Permanently delete this project and all its data.</p>
          <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
            placeholder={`Type "${project.name}" to confirm`}
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-destructive/30" />
          <button onClick={handleDelete} disabled={deleteConfirm !== project.name}
            className="px-4 py-2 bg-destructive text-destructive-foreground text-sm rounded-lg font-medium disabled:opacity-50 active:scale-[0.97]">
            Delete Project
          </button>
        </section>
      </main>
    </div>
  );
}
