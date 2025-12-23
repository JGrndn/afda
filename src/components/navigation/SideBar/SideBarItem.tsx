'use client'

import { ChevronDown } from "lucide-react";
import { NavItem, NavSubItem, Badge, useNavigation } from "@/components/navigation";
import Link from "next/link";

export function SideBarItem({ item }: { item: NavItem }) {
  const { isCollapsed, activeItemId, expandedItems, toggleExpanded, setActiveItem, closeMobile } = useNavigation();
  const isActive = activeItemId === item.id;
  const isExpanded = expandedItems.has(item.id);
  const hasSubItems = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      toggleExpanded(item.id);
      setActiveItem(item.id);
    } else {
      setActiveItem(item.id);
      // Fermer uniquement en mobile
      if (window.innerWidth < 1024) {
        closeMobile();
      }
    }
  };

  // Vérifier si un sous-item est actif (pour l'état actif en mode collapsed)
  const hasActiveSubItem = hasSubItems && item.children!.some(child => activeItemId === child.id);
  const showAsActive = isActive || hasActiveSubItem;

  const buttonClasses = `
    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative
    ${showAsActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-blue-800/50'}
    ${isCollapsed ? 'justify-center' : ''}
  `;

  const content = (
    <>
      <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
      
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left font-medium">{item.label}</span>
          
          {item.badge && <Badge value={item.badge} />}
          
          {hasSubItems && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </>
      )}

      {isCollapsed && item.badge && <Badge value={item.badge} collapsed />}
    </>
  );

  return (
    <div className="relative group">
      {item.href && !hasSubItems ? (
        <Link
          href={item.href}
          onClick={handleClick}
          className={buttonClasses}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={buttonClasses}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </button>
      )}

      {/* Tooltip avec sous-menus en mode collapsed */}
      {isCollapsed && hasSubItems && (
        <div className="absolute left-full top-0 ml-2 w-56 bg-blue-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {item.label}
            </div>
            <div className="space-y-1">
              {item.children!.map((child) => {
                const isSubActive = activeItemId === child.id;
                return (
                  <Link
                    key={child.id}
                    href={child.href}
                    onClick={() => {
                      setActiveItem(child.id);
                      if (window.innerWidth < 1024) {
                        closeMobile();
                      }
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm
                      ${isSubActive ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:text-white hover:bg-blue-700'}
                    `}
                  >
                    <span className="flex-1 text-left">{child.label}</span>
                    {child.badge && <Badge value={child.badge} />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sous-menus en mode normal */}
      {hasSubItems && isExpanded && !isCollapsed && (
        <div className="mt-1 ml-4 space-y-1 border-l-2 border-blue-800/50 pl-4">
          {item.children!.map((child) => (
            <SubItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SubItem({ item }: { item: NavSubItem }) {
  const { activeItemId, setActiveItem, closeMobile } = useNavigation();
  const isActive = activeItemId === item.id;

  const handleClick = () => {
    setActiveItem(item.id);
    // Fermer uniquement en mobile
    if (window.innerWidth < 1024) {
      closeMobile();
    }
  };

  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm
        ${isActive ? 'bg-blue-700 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-blue-800/30'}
      `}
    >
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && <Badge value={item.badge} />}
    </Link>
  );
}