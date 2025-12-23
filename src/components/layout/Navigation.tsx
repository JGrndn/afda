'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Menu, 
  X,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { NavItemContent } from '@/components/ui';

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  subItems?: {
    href: string;
    label: string;
    icon?: LucideIcon;
    badge?: string | number;
  }[];
};

const navItems: NavItem[] = [
  
];

export function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setOpenSubmenu(null);
  };
  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };
  
  const isItemActive = (item: NavItem) => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    // Pour les items avec sous-menus, vérifier si un sous-item est actif
    return item.subItems?.some(sub => 
      pathname === sub.href || pathname.startsWith(sub.href + '/')
    );
  };
  
  return (
    <nav className="bg-blue-900 text-white">
    <div className="container mx-auto px-4 sm:px-6">
    <div className="flex items-center justify-between h-16">
    {/* Logo */}
    <Link href="/" className="text-2xl font-bold flex-shrink-0" onClick={closeMenu}>
    AFDA
    </Link>
    
    {/* Desktop Navigation */}
    <div className="hidden lg:flex gap-1">
    {navItems.map((item) => {
      const isActive = isItemActive(item);
      const Icon = item.icon;
      
      // Item avec sous-menu
      if (item.subItems) {
        return (
          <div key={item.label} className="relative group">
          <button className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md transition text-sm xl:text-base ${ 
            isActive ? 
            'bg-blue-700 font-semibold'
            : 'hover:bg-blue-800'
          }`}
          >
          <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
          {item.label}
          <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4" />
          </button>
          
          {/* Dropdown Desktop */}
          <div className="absolute left-0 mt-1 w-48 bg-blue-900 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
          {item.subItems.map((subItem) => {
            return (
              <Link
              key={subItem.href}
              href={subItem.href}
              className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-blue-800"
              >
              <NavItemContent
              icon={subItem.icon}
              label={subItem.label}
              badge={subItem.badge}
              size="sm"
              />
              </Link>
            );
          })}
          </div>
          </div>
          </div>
        );
      }
      
      // Item simple
      return (
        <Link
        key={item.href}
        href={item.href!}
        className={`flex items-center gap-3 px-3 py-2 rounded-md ${
          isActive ?
          'bg-blue-700 font-semibold'
          : 'hover:bg-blue-800'
        }`}
        >
        <NavItemContent
        icon={item.icon}
        label={item.label}
        badge={item.badge}
        />
        </Link>
      );
    })}
    </div>
    
    {/* Mobile Menu Button */}
    <button
    onClick={toggleMenu}
    className="lg:hidden p-2 rounded-md hover:bg-blue-800 transition"
    aria-label="Toggle menu"
    >
    {isMenuOpen ? (
      <X className="h-6 w-6" />
    ) : (
      <Menu className="h-6 w-6" />
    )}
    </button>
    </div>
    
    {/* Mobile Navigation Dropdown */}
    {isMenuOpen && (
      <div className="lg:hidden pb-4">
      <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const isActive = isItemActive(item);
        const Icon = item.icon;
        const isSubmenuOpen = openSubmenu === item.label;
        
        // Item avec sous-menu
        if (item.subItems) {
          return (
            <div key={item.label}>
            <button
            onClick={() => toggleSubmenu(item.label)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-md transition ${ 
              isActive ? 
              'bg-blue-700 font-semibold' 
              : 'hover:bg-blue-800' 
            }`}
            >
            <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            {item.label}
            </div>
            <ChevronDown 
            className={`w-4 h-4 transition-transform ${
              isSubmenuOpen ? 'rotate-180' : ''
            }`}
            />
            </button>
            
            {/* Sous-menu Mobile */}
            {isSubmenuOpen && (
              <div className="mt-2 ml-8 space-y-2">
              {item.subItems.map((subItem) => {
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');
                return (
                  <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition ${
                    isSubActive ? 
                    'bg-blue-600 font-semibold' 
                    : 'bg-blue-800 hover:bg-blue-700'
                  }`}
                  >
                  <NavItemContent
                  icon={subItem.icon}
                  label={subItem.label}
                  badge={subItem.badge}
                  size="sm"
                  />
                  </Link>
                );
              })}
              </div>
            )}
            </div>
          );
        }
        
        // Item simple
        return (
          <Link
          key={item.href}
          href={item.href!}
          onClick={closeMenu}
          className={`px-4 py-3 rounded-md transition flex items-center gap-3 ${
            isActive ? 
            'bg-blue-700 font-semibold' 
            : 'hover:bg-blue-800'
          }`}
          >
          <NavItemContent
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          />
          </Link>
        );
      })}
      </div>
      </div>
    )}
    </div>
    </nav>
  );
}