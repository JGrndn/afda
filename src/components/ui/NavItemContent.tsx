import { LucideIcon } from "lucide-react";

type NavItemContentProps = {
  icon?: LucideIcon;
  label: string;
  badge?: string | number;
  size?: 'sm' | 'md';
};

export function NavItemContent({
  icon: Icon,
  label,
  badge,
  size = 'md',
}: NavItemContentProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const badgeText =
    typeof badge === 'number' && badge > 99 ? '99+' : badge;

  return (
    <>
      {Icon && (
        <span className="relative shrink-0">
          <Icon className={iconSize} />
          {badge && (
            <span className="absolute -top-1 -right-1 min-w-[12px] h-3 text-[8px] bg-red-500 text-white rounded-full flex items-center justify-center font-medium">
              {badgeText}
            </span>
          )}
        </span>
      )}

      <span className="flex items-center gap-2 whitespace-nowrap">{label}</span>

      {/* Badge inline si pas d’icône */}
      {!Icon && badge && (
        <span className="text-[10px] px-1.5 py-0.5 bg-red-500 text-white rounded-full leading-none">
          {badgeText}
        </span>
      )}
    </>
  );
}