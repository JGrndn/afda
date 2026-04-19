'use client';

import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export type ActionBarItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  isLoading?: boolean;
  hidden?: boolean;
};

interface ActionBarProps {
  items: ActionBarItem[];
}

/**
 * Barre d'actions sticky en bas d'écran, visible uniquement sur mobile (sm:hidden).
 * À placer en fin de page.
 */
export function ActionBar({ items }: ActionBarProps) {
  const visible = items.filter((i) => !i.hidden);
  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg sm:hidden">
      <div className="flex divide-x divide-gray-100">
        {visible.map((item, i) => {
          const Icon = item.icon;
          const isDanger = item.variant === 'danger';
          return (
            <button
              key={i}
              onClick={item.onClick}
              disabled={item.disabled || item.isLoading}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2
                text-xs font-medium transition-colors
                disabled:opacity-40
                ${isDanger
                  ? 'text-red-600 active:bg-red-50'
                  : 'text-gray-600 active:bg-gray-50'}
              `}
            >
              {item.isLoading
                ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <Icon className="w-5 h-5" />
              }
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area iOS */}
      <div className="h-safe-bottom bg-white" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
}