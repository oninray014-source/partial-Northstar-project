import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  GitBranch, 
  Building2, 
  CheckSquare, 
  Calendar, 
  Users, 
  Activity, 
  Settings, 
  ArrowLeft,
  Shield,
  Search,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { getLeads } from '../../services/leadsService';
import { getCurrentUserRole } from '../../services/workOrdersService';

export const WorkspaceLayout: React.FC = () => {
  const { signOut } = useAuth();
  const [leadCount, setLeadCount] = useState<number | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    let activeRole: 'admin' | 'technician' | 'anon' = 'anon';

    const loadData = async () => {
      try {
        const { role } = await getCurrentUserRole();
        if (!isMounted) return;
        activeRole = role;

        if (role === 'admin') {
          const { data, error } = await getLeads();
          if (!isMounted) return;
          if (error || !data) {
            setLeadCount(undefined);
          } else {
            setLeadCount(data.length);
          }
        } else {
          setLeadCount(undefined);
        }
      } catch {
        if (isMounted) setLeadCount(undefined);
      }
    };

    loadData();

    const handleUpdate = async () => {
      if (activeRole === 'admin') {
        const { data, error } = await getLeads();
        if (!isMounted) return;
        if (!error && data) {
          setLeadCount(data.length);
        }
      }
    };

    window.addEventListener('northstar_leads_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('northstar_leads_updated', handleUpdate);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/workspace/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/workspace/leads', icon: Inbox, count: leadCount },
    { name: 'Pipeline', path: '/workspace/pipeline', icon: GitBranch },
    { name: 'Properties', path: '/workspace/properties', icon: Building2 },
    { name: 'Tasks', path: '/workspace/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/workspace/calendar', icon: Calendar },
    { name: 'Team', path: '/workspace/team', icon: Users },
    { name: 'Activity', path: '/workspace/activity', icon: Activity },
    { name: 'Settings', path: '/workspace/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F3F7F5] flex flex-col lg:flex-row text-[#102A2A]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#063B35] text-white flex flex-col justify-between shrink-0 border-r border-[#063B35]/20">
        
        {/* Sidebar Header */}
        <div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="focus:outline-none" title="Return to Public Website">
              <Logo variant="light" size="sm" />
            </Link>
          </div>

          <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C875] animate-pulse" />
              <span className="font-semibold text-white/90">Austin Ops Center</span>
            </div>
            <span className="text-[10px] text-white/60 uppercase">Internal</span>
          </div>

          {/* Nav items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/workspace/leads' && location.pathname.startsWith('/workspace/leads'));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#00B86B] text-[#063B35]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-[#063B35] text-white' : 'bg-white/20 text-white'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Back to Public Website */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/75">
            <p className="font-bold text-[#00C875] uppercase tracking-wider mb-0.5">Core Architecture</p>
            <p className="text-[10px] text-white/60">
              Inquiry → CRM Lead → Property → Task → Completion
            </p>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#00C875]" />
            <span>Back to Public Website</span>
          </Link>
        </div>

      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Operational Bar */}
        <header className="bg-white border-b border-[#E1EBE7] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#617070]">
              <Link to="/workspace/dashboard" className="hover:text-[#063B35] font-semibold">
                Northstar OS
              </Link>
              <ChevronRight className="w-3 h-3 text-[#617070]" />
              <span className="text-[#063B35] font-bold capitalize">
                {location.pathname.replace('/workspace/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="text-xs text-[#063B35] bg-[#F3F7F5] hover:bg-[#E1EBE7] px-3 py-1.5 rounded-full font-semibold border border-[#E1EBE7] transition-colors"
            >
              + Simulate New Website Inquiry
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#063B35] text-white text-xs font-bold flex items-center justify-center">
              NS
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-xs text-[#617070] hover:text-[#063B35] bg-[#F3F7F5] hover:bg-[#E1EBE7] px-3 py-1.5 rounded-full font-semibold border border-[#E1EBE7] transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};
