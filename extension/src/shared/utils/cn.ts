/**
 * Class Name Utility
 *
 * Combines clsx (conditional classes) with tailwind-merge
 * (resolves Tailwind class conflicts).
 *
 * WHY THIS EXISTS:
 * Without this, if you have: className="px-4 px-2"
 * Both would be in the DOM but only one wins (unpredictably).
 * tailwind-merge ensures the LAST one wins, deterministically.
 *
 * USAGE EXAMPLE:
 * cn('px-4 py-2', isLarge && 'px-8', 'text-sm')
 * → 'px-8 py-2 text-sm' (when isLarge is true)
 *
 * cn('bg-blue-500', variant === 'danger' && 'bg-red-500')
 * → 'bg-red-500' (when variant is 'danger') — no conflict!
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}