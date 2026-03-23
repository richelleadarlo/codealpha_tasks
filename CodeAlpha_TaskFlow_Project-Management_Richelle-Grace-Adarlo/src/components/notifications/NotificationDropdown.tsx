import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleClick = async (n: typeof notifications[0]) => {
    if (!n.read) await markAsRead(n.id);
    if (n.task_id && n.project_id) {
      navigate(`/project/${n.project_id}`);
    } else if (n.project_id) {
      navigate(`/project/${n.project_id}`);
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-[1.75rem] border border-border/75 bg-gradient-to-br from-card/96 via-card/88 to-card/76 shadow-[0_24px_70px_-34px_rgba(10,16,28,0.75)] dark:shadow-[0_24px_70px_-34px_rgba(255,255,255,0.34)] backdrop-blur-xl animate-fade-in-up">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Inbox</p>
          <h3 className="mt-1 font-semibold text-sm text-foreground">Notifications</h3>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs text-primary transition-colors hover:bg-primary/15"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">No notifications yet</p>
        ) : (
          notifications.slice(0, 20).map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex w-full items-start gap-3 border-b border-border/60 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-muted/45 ${
                !n.read ? 'bg-primary/6' : ''
              }`}
            >
              {!n.read ? <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" /> : <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
