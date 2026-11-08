import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('handles conditional classes properly', () => {
    const isPrimary = true;
    const isSmall = false;
    expect(cn('btn', isPrimary && 'btn-primary', isSmall && 'btn-sm')).toBe('btn btn-primary');
  });

  it('resolves tailwind conflicts using tailwind-merge', () => {
    // px-4 should be overridden by px-8
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8');
  });

  it('handles falsy and undefined values gracefully', () => {
    expect(cn('base-class', null, undefined, false, '')).toBe('base-class');
  });
});

