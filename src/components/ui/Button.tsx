import { LucideIcon } from 'lucide-react';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghostdanger' | 'soft' | 'softdanger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: ReactNode;
  isLoading?: boolean;
  Icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconClassName?: string;
}

/**
 * Système de boutons :
 *
 *   primary    → outlined bleu  (bordure + texte bleu)
 *   secondary  → outlined gris  (bordure + texte gris)
 *   danger     → outlined rouge (bordure + texte rouge)
 *
 *   soft       → filled léger bleu  (fond bleu pâle, sans bordure)
 *   softdanger → filled léger rouge (fond rouge pâle, sans bordure)
 *
 *   ghost      → transparent bleu, sans bordure
 *   ghostdanger→ transparent rouge, sans bordure
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  Icon,
  iconPosition = 'left',
  isLoading,
  disabled,
  className = '',
  iconClassName = '',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    // Fond blanc → outlined
    primary:     'bg-transparent text-blue-600 border border-blue-500 hover:bg-blue-50 active:scale-[0.98]',
    secondary:   'bg-transparent text-gray-500 border border-gray-300 hover:bg-gray-50 active:scale-[0.98]',
    danger:      'bg-transparent text-red-600 border border-red-400 hover:bg-red-50 active:scale-[0.98]',
    // Cards / tables → filled léger
    soft:        'bg-blue-50 text-blue-700 border-none hover:bg-blue-100 active:scale-[0.98]',
    softdanger:  'bg-red-50 text-red-700 border-none hover:bg-red-100 active:scale-[0.98]',
    // Ghost
    ghost:       'bg-transparent text-blue-600 border-none hover:bg-blue-50 active:scale-[0.98]',
    ghostdanger: 'bg-transparent text-red-600 border-none hover:bg-red-50 active:scale-[0.98]',
  };

  const sizes = {
    sm:   'px-3 py-1.5 text-xs',
    md:   'px-4 py-2 text-sm',
    lg:   'px-5 py-2.5 text-sm',
    icon: 'p-1.5',
  };

  const iconSize = `flex-shrink-0 ${size === 'icon' || size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'} ${iconClassName}`;

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className={iconSize} />
      )}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className={iconSize} />}
    </button>
  );
}