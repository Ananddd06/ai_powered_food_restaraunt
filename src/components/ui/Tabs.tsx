import React from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'pills' && 'bg-muted/70 p-1 rounded-2xl border border-border/50',
        variant === 'underline' && 'border-b border-border',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all select-none whitespace-nowrap cursor-pointer',
              variant === 'pills' &&
                (isActive
                  ? 'bg-card text-foreground shadow-xs rounded-xl font-semibold'
                  : 'text-muted-foreground hover:text-foreground rounded-xl'),
              variant === 'underline' &&
                (isActive
                  ? 'text-primary border-b-2 border-primary font-semibold -mb-px'
                  : 'text-muted-foreground hover:text-foreground')
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold',
                  isActive ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
