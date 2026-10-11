import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckSquare, 
  Clock, 
  Inbox, 
  ArrowRight,
  Filter,
  UserCheck,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { getWorkOrders, getCurrentUserRole } from '../../services/workOrdersService';
import { getTeamProfiles, TeamMemberProfile } from '../../services/profilesService';
import { getLeads } from '../../services/leadsService';
import { FacilityTask, CRMLead } from '../../types';

export const WorkspaceTeam: React.FC = () => {
  const [members, setMembers] = useState<TeamMemberProfile[]>([]);
  const [tasks, setTasks] = useState<FacilityTask[]>([]);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'technician' | 'anon'>('technician');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');

  const fetchTeamData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Resolve current user role
      const { role: resolvedRole } = await getCurrentUserRole();
      setUserRole(resolvedRole);

      // 2. Concurrently fetch team profiles and work orders from Supabase
      const [profilesRes, tasksRes] = await Promise.all([
        getTeamProfiles(),
        getWorkOrders()
      ]);

      if (profilesRes.error) {
        setError(profilesRes.error.message || 'Failed to load team directory from database.');
        setIsLoading(false);
        return;
      }

      if (tasksRes.error) {
        setError(tasksRes.error.message || 'Failed to load team work orders from database.');
        setIsLoading(false);
        return;
      }

      setMembers(profilesRes.data || []);
      setTasks(tasksRes.data || []);

      // 3. Role-gated Leads query (Admins only)
      if (resolvedRole === 'admin') {
        const { data: leadsData, error: leadsErr } = await getLeads();
        if (!leadsErr && leadsData) {
          setLeads(leadsData);
        } else {
          setLeads([]);
        }
      } else {
        // Technicians are strictly prohibited from querying public.leads
        setLeads([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'An unexpected error occurred while loading team operations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-time synchronization
  useEffect(() => {
    fetchTeamData();

    const handleTasksRefresh = () => {
      fetchTeamData();
    };

    const handleLeadsRefresh = () => {
      if (userRole === 'admin') {
        getLeads().then(({ data, error: lErr }) => {
          if (!lErr && data) {
            setLeads(data);
          }
        });
      }
    };

    window.addEventListener('northstar_tasks_updated', handleTasksRefresh);
    window.addEventListener('northstar_leads_updated', handleLeadsRefresh);

    return () => {
      window.removeEventListener('northstar_tasks_updated', handleTasksRefresh);
      window.removeEventListener('northstar_leads_updated', handleLeadsRefresh);
    };
  }, [fetchTeamData, userRole]);

  // Safe substring matching helper for technician names
  const matchesTechnicianName = (storedField: string | undefined, memberName: string) => {
    if (!storedField || !memberName) return false;
    return storedField.toLowerCase().includes(memberName.toLowerCase());
  };

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const queuedTasks = tasks.filter((t) => t.status === 'pending').length;

    // Assigned inquiries: CRM leads where status !== 'closed' and assignedTechnician matches any team member
    // Only evaluated for Admin role
    let assignedLeadsCount: number | null = null;
    if (userRole === 'admin') {
      assignedLeadsCount = leads.filter((l) => {
        if (l.status === 'closed') return false;
        return members.some((m) => matchesTechnicianName(l.assignedTechnician, m.name));
      }).length;
    }

    return {
      totalMembers: members.length,
      activeTasks,
      queuedTasks,
      assignedLeadsCount
    };
  }, [members, tasks, leads, userRole]);

  // Per-member workload calculations
  const memberWorkloads = useMemo(() => {
    const map = new Map<string, { activeJobs: number; pendingJobs: number; assignedInquiries: number | null }>();

    members.forEach((m) => {
      const activeJobs = tasks.filter(
        (t) => matchesTechnicianName(t.assignedTechnician, m.name) && t.status === 'in-progress'
      ).length;

      const pendingJobs = tasks.filter(
        (t) => matchesTechnicianName(t.assignedTechnician, m.name) && t.status === 'pending'
      ).length;

      const assignedInquiries = userRole === 'admin'
        ? leads.filter(
            (l) => matchesTechnicianName(l.assignedTechnician, m.name) && l.status !== 'closed'
          ).length
        : null;

      map.set(m.id, { activeJobs, pendingJobs, assignedInquiries });
    });

    return map;
  }, [members, tasks, leads, userRole]);

  // Search and discipline filtering
  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return members.filter((m) => {
      const matchesSearch = !term || [
        m.name,
        m.title,
        m.disciplineLabel,
        m.licenseNumber || '',
        m.territory
      ].some((val) => val.toLowerCase().includes(term));

      const matchesDiscipline = disciplineFilter === 'all' || m.discipline === disciplineFilter;

      return matchesSearch && matchesDiscipline;
    });
  }, [members, searchTerm, disciplineFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[#00B86B] uppercase mb-1">
            Field Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#00B86B]" />
            <span>Trade Specialists &amp; Operations Team</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#617070] mt-1 max-w-2xl">
            Coordinate field specialists, trade expertise, and operational workload across the Northstar service territory.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchTeamData}
            disabled={isLoading}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-[#E1EBE7] text-[#063B35] hover:bg-[#F3F7F5] transition-colors flex items-center justify-center disabled:opacity-50 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
            title="Refresh team directory from database"
            aria-label="Refresh team directory from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00B86B]' : ''}`} />
          </button>
          <Link
            to="/workspace/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E1EBE7] text-xs font-bold text-[#063B35] hover:border-[#00B86B] hover:bg-[#F3F7F5] transition-all min-h-[44px] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
          >
            <CheckSquare className="w-4 h-4 text-[#00B86B]" />
            <span>Work Order Console</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#617070]" />
          </Link>
        </div>
      </div>

      {/* Retryable Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Team Operations Sync Notice:</strong> {error}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchTeamData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800 text-white font-bold hover:bg-red-900 transition-colors shrink-0 self-start sm:self-auto min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* 2. Compact Dynamic Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Team Members
            </div>
            <div className="text-2xl font-black text-[#063B35] mt-0.5">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[#00B86B] animate-spin" />
              ) : (
                summaryMetrics.totalMembers
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#00B86B]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Active Work Orders
            </div>
            <div className="text-2xl font-black text-blue-700 mt-0.5 flex items-center min-h-[32px]">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                summaryMetrics.activeTasks
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Queued Work Orders
            </div>
            <div className="text-2xl font-black text-[#063B35] mt-0.5 flex items-center min-h-[32px]">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[#00B86B] animate-spin" />
              ) : (
                summaryMetrics.queuedTasks
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3F7F5] text-[#063B35] flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 text-[#00B86B]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Assigned Inquiries
            </div>
            <div className="text-2xl font-black text-[#063B35] mt-0.5">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[#00B86B] animate-spin" />
              ) : userRole === 'admin' ? (
                summaryMetrics.assignedLeadsCount !== null ? summaryMetrics.assignedLeadsCount : '—'
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
            <Inbox className="w-5 h-5 text-[#00B86B]" />
          </div>
        </div>
      </div>

      {/* 3. Operational Search & Discipline Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E1EBE7] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#879B95]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, title, license, or territory..."
            className="w-full h-11 pl-10 pr-4 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl text-xs font-semibold text-[#063B35] placeholder:text-[#879B95] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
          />
        </div>

        {/* Discipline Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-extrabold text-[#617070] uppercase tracking-wider mr-1 hidden sm:inline">
            Discipline:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'hvac', label: 'HVAC' },
            { id: 'plumbing', label: 'Plumbing' },
            { id: 'electrical', label: 'Electrical' },
            { id: 'operations', label: 'Operations & Dispatch' },
          ].map((tab) => {
            const isActive = disciplineFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDisciplineFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00B86B] ${
                  isActive
                    ? 'bg-[#063B35] text-white shadow-2xs'
                    : 'bg-[#F3F7F5] text-[#063B35] hover:bg-[#E1EBE7]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Team Member Cards Grid */}
      {isLoading && members.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-16 text-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#00B86B] animate-spin mx-auto" />
          <h3 className="font-bold text-[#063B35]">Loading Team Directory...</h3>
          <p className="text-xs text-[#617070]">Synchronizing specialist profiles and operational workload from Supabase.</p>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMembers.map((member) => {
            const workload = memberWorkloads.get(member.id) || {
              activeJobs: 0,
              pendingJobs: 0,
              assignedInquiries: null
            };

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs hover:border-[#00B86B]/60 transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header: Name, Title & Trade Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-[#063B35] tracking-tight">
                          {member.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35]">
                          {member.disciplineLabel}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#00B86B] mt-0.5">
                        {member.title}
                      </p>
                    </div>

                    <span className="font-mono text-[10px] font-bold text-[#879B95] bg-[#F3F7F5] px-2 py-0.5 rounded border border-[#E1EBE7]">
                      {member.id}
                    </span>
                  </div>

                  {/* Credentials & Territory */}
                  <div className="space-y-2 text-xs pt-1">
                    {/* Trade License (Rendered only when presented in data) */}
                    {member.licenseNumber ? (
                      <div className="flex items-center gap-2 text-[#063B35] font-semibold bg-[#F8FAF9] p-2.5 rounded-xl border border-[#E1EBE7]">
                        <ShieldCheck className="w-4 h-4 text-[#00B86B] shrink-0" />
                        <span className="text-xs">{member.licenseNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#063B35] font-semibold bg-[#F8FAF9] p-2.5 rounded-xl border border-[#E1EBE7]">
                        <UserCheck className="w-4 h-4 text-[#00B86B] shrink-0" />
                        <span className="text-xs">Central Texas Operations &amp; Dispatch Hub</span>
                      </div>
                    )}

                    {/* Territory */}
                    <div className="flex items-center gap-2 text-[#617070]">
                      <MapPin className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                      <span>Territory: <strong className="text-[#063B35] font-semibold">{member.territory}</strong></span>
                    </div>
                  </div>

                  {/* Live Workload Metrics (Without inferring availability) */}
                  <div className="p-3.5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-2">
                    <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
                      Current Operational Workload
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-xl border border-[#E1EBE7]">
                        <div className="text-base font-black text-blue-700 flex items-center justify-center min-h-[24px]">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            workload.activeJobs
                          )}
                        </div>
                        <div className="text-[9px] font-bold text-[#617070] uppercase mt-0.5">
                          {workload.activeJobs === 1 ? 'Active Job' : 'Active Jobs'}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-[#E1EBE7]">
                        <div className="text-base font-black text-[#063B35] flex items-center justify-center min-h-[24px]">
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 text-[#00B86B] animate-spin" />
                          ) : (
                            workload.pendingJobs
                          )}
                        </div>
                        <div className="text-[9px] font-bold text-[#617070] uppercase mt-0.5">
                          {workload.pendingJobs === 1 ? 'Queued Job' : 'Queued Jobs'}
                        </div>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-[#E1EBE7]">
                        <div className="text-base font-black text-[#063B35]">
                          {userRole === 'admin' ? (
                            workload.assignedInquiries !== null ? workload.assignedInquiries : '—'
                          ) : (
                            '—'
                          )}
                        </div>
                        <div className="text-[9px] font-bold text-[#617070] uppercase mt-0.5">
                          {userRole === 'admin'
                            ? (workload.assignedInquiries === 1 ? 'CRM Inquiry' : 'CRM Inquiries')
                            : 'CRM Inquiries'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Phone, Email, and Work Order Console Link */}
                <div className="pt-4 border-t border-[#E1EBE7] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {/* Phone Action */}
                    <a
                      href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                      aria-label={`Call ${member.name} at ${member.phone}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E1EBE7] text-xs font-bold text-[#063B35] hover:border-[#00B86B] hover:bg-[#F3F7F5] transition-all min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                      title={`Call ${member.name}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#00B86B]" />
                      <span className="sm:inline">{member.phone}</span>
                    </a>

                    {/* Email Action */}
                    <a
                      href={`mailto:${member.email}`}
                      aria-label={`Email ${member.name} at ${member.email}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E1EBE7] text-xs font-bold text-[#063B35] hover:border-[#00B86B] hover:bg-[#F3F7F5] transition-all min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                      title={`Email ${member.name}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#00B86B]" />
                      <span className="hidden lg:inline">{member.email}</span>
                      <span className="lg:hidden">Email</span>
                    </a>
                  </div>

                  {/* Link to Tasks Console */}
                  <Link
                    to={`/workspace/tasks?technician=${encodeURIComponent(member.name)}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                  >
                    <span>Work Orders</span>
                    <ArrowRight className="w-3 h-3 text-[#00B86B]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-12 text-center space-y-3">
          <Users className="w-8 h-8 text-[#879B95] mx-auto" />
          <h3 className="text-base font-bold text-[#063B35]">No Team Members Found</h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            No specialists or coordinators match the current search term or discipline filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setDisciplineFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#F3F7F5] text-xs font-bold text-[#063B35] border border-[#E1EBE7] hover:border-[#00B86B] transition-all min-h-[44px]"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
