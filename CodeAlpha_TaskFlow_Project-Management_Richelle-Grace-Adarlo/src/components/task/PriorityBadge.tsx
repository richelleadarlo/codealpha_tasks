import React from 'react';
import { PRIORITY_CONFIG, type Priority } from '@/types';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  if (priority === 'none') return null;
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}
