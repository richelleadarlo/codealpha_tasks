export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';
export type ProjectVisibility = 'private' | 'team';
export type MemberRole = 'owner' | 'member';
export type NotificationType = 'assigned' | 'commented' | 'mentioned' | 'project_invite' | 'task_done' | 'due_date_changed';

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  accent_color: string;
  visibility: ProjectVisibility;
  owner_id: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
  profile?: Profile;
}

export interface Column {
  id: string;
  project_id: string;
  name: string;
  order: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface ActivityLogEntry {
  action: string;
  performed_by: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  project_id: string;
  priority: Priority;
  due_date: string | null;
  labels: string[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  order: number;
  created_by: string;
  activity_log: ActivityLogEntry[];
  created_at: string;
  updated_at: string;
  assignees?: Profile[];
  comment_count?: number;
}

export interface TaskAssignee {
  id: string;
  task_id: string;
  user_id: string;
}

export interface Comment {
  id: string;
  task_id: string;
  project_id: string;
  author_id: string;
  body: string;
  mentions: string[];
  edited: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Notification {
  id: string;
  recipient_id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  project_id: string | null;
  task_id: string | null;
  created_at: string;
}

export const ACCENT_COLORS = [
  '#6366F1', // indigo
  '#10B981', // emerald
  '#F43F5E', // rose
  '#F59E0B', // amber
  '#0EA5E9', // sky
  '#8B5CF6', // violet
];

export const AVATAR_COLORS = [
  '#6366F1', '#10B981', '#F43F5E', '#F59E0B',
  '#0EA5E9', '#8B5CF6', '#EC4899', '#14B8A6',
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  none: { label: 'None', className: 'bg-muted text-muted-foreground' },
  low: { label: 'Low', className: 'bg-priority-low/15 text-priority-low' },
  medium: { label: 'Medium', className: 'bg-priority-medium/15 text-priority-medium' },
  high: { label: 'High', className: 'bg-priority-high/15 text-priority-high' },
  urgent: { label: 'Urgent', className: 'bg-priority-urgent/15 text-priority-urgent' },
};
