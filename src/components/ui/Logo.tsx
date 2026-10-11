import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  size = 'md',
  showSubtitle = true 
}) => {
  const isLight = variant === 'light';

  const markSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const titleSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-xl font-bold tracking-tight'
  };

  const subtitleSizes = {
    sm: 'text-[9px] tracking-widest font-semibold',
    md: 'text-[10px] tracking-widest font-semibold',
    lg: 'text-[11px] tracking-widest font-semibold'
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Precision Northstar Geometric Icon */}
      <div 
        className={`${markSizes[size]} rounded-xl flex items-center justify-center transition-transform hover:scale-105 ${
          isLight 
            ? 'bg-[#00B86B] text-[#063B35]' 
            : 'bg-[#063B35] text-[#00C875]'
        } shadow-sm shadow-[#063B35]/10`}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5"
        >
          {/* Northstar 4-point compass star with center point */}
          <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" fill="currentColor" fillOpacity="0.2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <line x1="12" y1="2" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="22" />
          <line x1="2" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="22" y2="12" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`${titleSizes[size]} ${isLight ? 'text-white' : 'text-[#063B35]'}`}>
          NORTHSTAR
        </span>
        {showSubtitle && (
          <span className={`${subtitleSizes[size]} uppercase mt-0.5 ${
            isLight ? 'text-[#00B86B]' : 'text-[#617070]'
          }`}>
            FACILITY SERVICES
          </span>
        )}
      </div>
    </div>
  );
};
