import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { AvatarCircle } from '@/components/ui/AvatarCircle';
import { AVATAR_COLORS } from '@/types';

export default function ProfilePage() {
  const { profile, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color || AVATAR_COLORS[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      await updateProfile({ name, avatar_color: avatarColor });
      setMessage('Profile updated!');
      setTimeout(() => setMessage(''), 2000);
    } catch { setMessage('Failed to update'); }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setMessage(''), 2000);
    } catch (e: any) { setMessage(e.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px] px-4 lg:px-8 max-w-lg mx-auto pb-12">
        <h1 className="text-2xl font-bold text-foreground mt-8 mb-6" style={{ lineHeight: '1.2' }}>Profile</h1>
        {message && <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">{message}</div>}
        <section className="bento-card p-5 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <AvatarCircle name={name || 'U'} color={avatarColor} size="lg" />
            <div>
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Avatar Color</label>
              <div className="flex gap-2">
                {AVATAR_COLORS.map(c => (
                  <button key={c} onClick={() => setAvatarColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${avatarColor === c ? 'ring-2 ring-offset-2 ring-foreground/30 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium active:scale-[0.97]">Save</button>
          </div>
        </section>
        <section className="bento-card p-5">
          <h2 className="font-semibold text-foreground mb-4">Change Password</h2>
          <div className="space-y-3">
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password"
              className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button onClick={handleChangePassword} className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium active:scale-[0.97]">Change Password</button>
          </div>
        </section>
      </main>
    </div>
  );
}
