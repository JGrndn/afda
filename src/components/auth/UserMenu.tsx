'use client';

import { signOut, useSession } from 'next-auth/react';
import { LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { USER_ROLE_TRANSLATIONS } from '@/lib/i18n/translations';
import { USER_ROLE_COLORS } from '@/components/ui/StatusBadge';
import { UserRole } from '@/lib/domain/enums/user-role.enum';

// Tailwind classes indexed by ColorKey
const BADGE_CLASSES: Record<string, string> = {
  red:  'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
};

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/signin' });
  };

  const role = session.user.role as UserRole;
  const roleLabel = USER_ROLE_TRANSLATIONS[role] ?? role;
  const roleColorKey = USER_ROLE_COLORS[role] ?? 'gray';
  const roleBadgeClass = BADGE_CLASSES[roleColorKey] ?? BADGE_CLASSES.gray;
  const avatarLetter = session.user.name?.[0]?.toUpperCase() ?? 'U';

  const menuItems = (
    <div className="py-1">
      <Link
        href="/profile"
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4" />
        Mon profil
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  );

  const userInfo = (
    <div className="px-4 py-3 border-b border-gray-200">
      <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
      <div className="mt-2">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClass}`}>
          {roleLabel}
        </span>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
          title={session.user.name || 'Menu utilisateur'}
        >
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {avatarLetter}
          </div>
        </button>

        {isOpen && (
          <div className="absolute left-full bottom-0 ml-2 w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
            {userInfo}
            {menuItems}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
          {avatarLetter}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
          <p className="text-xs text-blue-200 truncate">{roleLabel}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-blue-200 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {userInfo}
          {menuItems}
        </div>
      )}
    </div>
  );
}