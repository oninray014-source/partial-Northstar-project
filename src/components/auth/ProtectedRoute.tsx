import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F7F5] flex flex-col items-center justify-center p-6 text-[#102A2A]">
        <div className="w-12 h-12 rounded-2xl bg-[#063B35] flex items-center justify-center mb-4 shadow-sm">
          <Shield className="w-6 h-6 text-[#00B86B] animate-pulse" />
        </div>
        <div className="text-sm font-bold text-[#063B35] tracking-wide uppercase">
          Verifying Session
        </div>
        <p className="text-xs text-[#617070] mt-1">
          Connecting to Northstar Operations Center...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect unauthenticated visitors to /login, preserving target URL in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
