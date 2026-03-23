import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, children, title, maxWidth = 'max-w-2xl' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-[radial-gradient(circle_at_top,rgba(85,139,255,0.16),transparent_28%),rgba(10,14,24,0.52)] px-4 pt-[4vh] backdrop-blur-md animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={`bento-card w-full ${maxWidth} max-h-[92vh] overflow-y-auto bg-gradient-to-br from-card/95 via-card/86 to-card/78 animate-fade-in-up scrollbar-thin`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/70 bg-card/85 px-6 py-4 backdrop-blur-xl">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Workspace</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-border/70 bg-card/70 p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
