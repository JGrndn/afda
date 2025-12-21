'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LucideIcon, Menu, X } from 'lucide-react';

const navItems:{
    href: string;
    label: string;
    icon: LucideIcon;
}[] = [
];

export function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-md transition text-sm xl:text-base ${
                    isActive
                      ? 'bg-blue-700 font-semibold'
                      : 'hover:bg-blue-800'
                  }`}
                >
                  <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                  {item.label}
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
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition ${
                      isActive
                        ? 'bg-blue-700 font-semibold'
                        : 'hover:bg-blue-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
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