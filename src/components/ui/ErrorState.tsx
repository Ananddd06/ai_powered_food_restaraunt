import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred while loading spatial restaurant data. Please check your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-destructive/30 bg-destructive/5 my-6">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold font-heading text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="destructive" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
