import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Results Found',
  description = 'Try adjusting your search radius, cuisine filters, or budget constraints to discover nearby restaurants.',
  icon = <SearchX className="w-10 h-10 text-muted-foreground/60" />,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border/80 bg-muted/20 my-6">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold font-heading text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
