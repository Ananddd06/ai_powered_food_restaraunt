import React from 'react';
import { cn } from '@/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  onValueChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 10,
  step = 0.5,
  label,
  unit = '',
  onValueChange,
  className,
  disabled,
  ...props
}) => {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex justify-between items-center text-xs">
        {label && <span className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>}
        <span className="font-bold text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-md">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
    </div>
  );
};
