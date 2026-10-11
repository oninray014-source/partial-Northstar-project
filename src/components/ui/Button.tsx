import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
  arrowType?: 'right' | 'upRight';
  href?: string;
  to?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  arrowType = 'right',
  href,
  to,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-full";

  const sizeStyles = {
    sm: "text-xs px-4 py-2 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5"
  };

  const variantStyles = {
    primary: "bg-[#063B35] text-white hover:bg-[#042925] focus:ring-[#063B35] shadow-sm hover:shadow",
    secondary: "bg-[#00B86B] text-[#063B35] font-semibold hover:bg-[#00C875] focus:ring-[#00B86B] shadow-sm hover:shadow",
    outline: "border border-[#063B35]/25 text-[#063B35] bg-transparent hover:bg-[#063B35]/5 focus:ring-[#063B35]",
    dark: "bg-white text-[#063B35] hover:bg-[#F3F7F5] focus:ring-white shadow-sm",
    ghost: "text-[#063B35] hover:bg-[#063B35]/5 focus:ring-[#063B35]"
  };

  const ArrowIcon = arrowType === 'upRight' ? ArrowUpRight : ArrowRight;

  const content = (
    <>
      <span>{children}</span>
      {withArrow && (
        <span className={`inline-flex items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 ${
          variant === 'primary' 
            ? 'bg-white/15 p-1' 
            : variant === 'secondary' 
            ? 'bg-[#063B35]/15 p-1' 
            : 'p-0.5'
        }`}>
          <ArrowIcon className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
        </span>
      )}
    </>
  );

  const combinedClasses = `group ${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
};
