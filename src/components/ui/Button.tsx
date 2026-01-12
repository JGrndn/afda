import { LucideIcon } from 'lucide-react';
import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children?: ReactNode;
  isLoading?: boolean;
  Icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconClassName?: string;
}

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
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2'
  };

  const iconClasses = `w-5 h-5 transition-transform group-hover:scale-110 ${iconClassName}`;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={iconClasses} />
      )}
        {children}
      {Icon && iconPosition === 'right' && (
        <Icon className={iconClasses} />
      )}
    </button>
  );
}
