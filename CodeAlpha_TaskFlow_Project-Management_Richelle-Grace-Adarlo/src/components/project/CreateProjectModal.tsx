import React, { useState } from 'react';
import { ACCENT_COLORS } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/sonner';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, accentColor: string, visibility: string) => Promise<any>;
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Unable to create project';
}

export function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState(ACCENT_COLORS[0]);
  const [visibility, setVisibility] = useState('private');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim(), description.trim(), accentColor, visibility);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="bento-card bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">New Workspace</p>
          <h3 className="mt-2 text-xl font-semibold text-foreground">Name the project and set the tone.</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose an accent and visibility now. You can refine details after creation.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="bento-card p-5">
            <label className="mb-2 block text-sm font-medium text-foreground">Project Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="My Project"
            autoFocus
          />
            <label className="mb-2 mt-4 block text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="h-28 w-full resize-none rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="What's this project about?"
          />
          </div>
          <div className="space-y-5">
            <div className="bento-card p-5">
              <label className="mb-3 block text-sm font-medium text-foreground">Accent Color</label>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    className={`h-10 w-10 rounded-2xl border border-white/25 transition-all ${accentColor === c ? 'scale-110 ring-2 ring-foreground/25 ring-offset-2 ring-offset-transparent' : 'hover:-translate-y-0.5 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="bento-card p-5">
              <label className="mb-3 block text-sm font-medium text-foreground">Visibility</label>
              <div className="grid gap-3">
                {['private', 'team'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVisibility(v)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                      visibility === v
                        ? 'border-primary/60 bg-primary/12 text-foreground shadow-[0_12px_32px_-24px_rgba(59,130,246,0.8)]'
                        : 'border-border/70 bg-background/75 text-foreground hover:bg-muted/70'
                    }`}
                  >
                    <span className="block font-semibold">{v === 'private' ? 'Private' : 'Team'}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {v === 'private' ? 'Only invited collaborators can access this project.' : 'Members can work together in a shared project space.'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border/70 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-border/70 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 active:scale-[0.97]"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
