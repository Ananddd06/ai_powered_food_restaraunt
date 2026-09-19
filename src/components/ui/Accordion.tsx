import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AccordionItemProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  defaultOpenId?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, defaultOpenId }) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="rounded-2xl border border-border/70 bg-card overflow-hidden transition-all">
            <button
              onClick={() => toggle(item.id)}
              className="flex w-full items-center justify-between p-4 text-left font-semibold text-foreground hover:bg-muted/40 transition-colors"
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn('w-5 h-5 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180 text-primary')}
              />
            </button>
            {isOpen && (
              <div className="p-4 pt-0 text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/20">
                {item.children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
