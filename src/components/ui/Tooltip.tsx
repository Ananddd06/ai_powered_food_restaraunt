import React, { useState } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: '-top-9 left-1/2 -translate-x-1/2',
    bottom: '-bottom-9 left-1/2 -translate-x-1/2',
    left: 'top-1/2 -translate-y-1/2 -left-2 -translate-x-full',
    right: 'top-1/2 -translate-y-1/2 -right-2 translate-x-full',
  }[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={cn(
            'absolute z-50 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground bg-primary rounded-lg shadow-md whitespace-nowrap pointer-events-none transition-opacity duration-150 animate-in fade-in-0',
            positionClasses
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
