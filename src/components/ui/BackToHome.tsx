import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackToHomeProps {
  className?: string;
}

export const BackToHome: React.FC<BackToHomeProps> = ({ className = '' }) => {
  return (
    <div className={`py-10 sm:py-12 flex justify-center items-center ${className}`}>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#E1EBE7] text-[#063B35] font-semibold text-sm hover:border-[#00B86B] hover:text-[#00B86B] hover:bg-[#F3F7F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B86B] focus-visible:ring-offset-2 transition-all shadow-xs min-h-[44px]"
        aria-label="Back to Home page"
      >
        <ArrowLeft className="w-4 h-4 text-[#00B86B]" aria-hidden="true" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
};
