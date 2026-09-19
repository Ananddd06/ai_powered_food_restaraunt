import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 top-0 bottom-0 w-full sm:w-96 border-r animate-in slide-in-from-left duration-200',
    right: 'right-0 top-0 bottom-0 w-full sm:w-96 border-l animate-in slide-in-from-right duration-200',
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl border-t animate-in slide-in-from-bottom duration-200',
  }[position];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed z-50 bg-card border-border p-6 shadow-2xl flex flex-col',
          positionClasses
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          {title ? (
            <h2 className="text-lg font-bold font-heading text-foreground">{title}</h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
