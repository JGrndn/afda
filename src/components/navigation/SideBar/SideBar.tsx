'use client'

import { navItems, SideBarItem, AppVersion, useNavigation } from "@/components/navigation";
import { UserMenu } from '@/components/auth/UserMenu';
import { Menu } from "lucide-react";
import Link from "next/link";

export function SideBar({ title } : {
  title: string
}) {
  const { isCollapsed, toggleCollapse } = useNavigation();

  return (
    <aside
      className={`
        hidden lg:flex flex-col bg-blue-900 text-white h-screen fixed left-0 top-0 shadow-xl
        transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-800">
        {!isCollapsed && <Link href="/" className="text-xl font-bold">{title}</Link>}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SideBarItem key={item.id} item={item} />
        ))}
      </nav>

      {/* User Menu */}
      <div className="border-t border-blue-800 p-3">
        <UserMenu collapsed={isCollapsed} />
      </div>

      {/* Version */}
      <AppVersion collapsed={isCollapsed}/>
    </aside>
  );
}
