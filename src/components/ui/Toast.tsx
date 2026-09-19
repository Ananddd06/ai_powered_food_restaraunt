import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  title: string;
  message?: string;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onDismiss,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-destructive shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-accent shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-500/5',
    error: 'border-destructive/30 bg-destructive/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    info: 'border-accent/30 bg-accent/5',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border bg-card text-foreground shadow-xl max-w-sm w-full animate-in slide-in-from-top duration-200',
        borders[type]
      )}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {message && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
