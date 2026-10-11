import React from 'react';

interface SectionBadgeProps {
  label: string;
  variant?: 'emerald' | 'forest' | 'light' | 'white';
  className?: string;
  withDot?: boolean;
}

export const SectionBadge: React.FC<SectionBadgeProps> = ({
  label,
  variant = 'emerald',
  className = '',
  withDot = true
}) => {
  const variantStyles = {
    emerald: 'bg-[#00B86B]/10 text-[#063B35] border-[#00B86B]/30',
    forest: 'bg-[#063B35] text-white border-[#063B35]',
    light: 'bg-white text-[#063B35] border-[#E1EBE7]',
    white: 'bg-white/10 text-white border-white/20'
  };

  const dotStyles = {
    emerald: 'bg-[#00B86B]',
    forest: 'bg-[#00C875]',
    light: 'bg-[#063B35]',
    white: 'bg-[#00C875]'
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold tracking-wider uppercase select-none ${variantStyles[variant]} ${className}`}>
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      )}
      <span>{label}</span>
    </div>
  );
};
