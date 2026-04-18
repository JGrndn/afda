'use client';

import { useRef, useState, useEffect } from 'react';
import { MoreVertical, LucideIcon } from 'lucide-react';

export type DropdownItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  hidden?: boolean;
};

interface ActionsDropdownProps {
  items: DropdownItem[];
}

/**
 * Dropdown ⋮ visible uniquement sur desktop (hidden sm:block).
 * À combiner avec ActionBar (sm:hidden) pour le mobile.
 */
export function ActionsDropdown({ items }: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const visible = items.filter((i) => !i.hidden);
  if (visible.length === 0) return null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
        aria-label="Actions"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1 overflow-hidden">
          {visible.map((item, i) => {
            const Icon = item.icon;
            const isDanger = item.variant === 'danger';
            return (
              <button
                key={i}
                onClick={() => { item.onClick(); setIsOpen(false); }}
                disabled={item.disabled}
                className={`
                  flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors
                  disabled:opacity-40
                  ${isDanger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'}
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}