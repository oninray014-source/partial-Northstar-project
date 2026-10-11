import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Building2, 
  ArrowRight, 
  AlertTriangle,
  RefreshCw,
  Wrench,
  CheckSquare,
  ShieldCheck
} from 'lucide-react';
import { getLeads } from '../../services/leadsService';
import { getCurrentUserRole } from '../../services/workOrdersService';
import { CRMLead } from '../../types';

export const WorkspaceDashboard: React.FC = () => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'technician' | 'anon' | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Verify user role first
    const { role } = await getCurrentUserRole();
    setCurrentUserRole(role);

    if (role === 'technician') {
      // Technicians must have zero leads access by architecture and RLS
      setLeads([]);
      setIsLoading(false);
      return;
    }

    // 2. Fetch live leads for Admin/Manager from Supabase
    const { data, error: fetchErr } = await getLeads();
    if (fetchErr) {
      setError(fetchErr.message || 'Failed to load operational dashboard data.');
      setLeads([]);
    } else {
      setLeads(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('northstar_leads_updated', handleUpdate);
    return () => window.removeEventListener('northstar_leads_updated', handleUpdate);
  }, [fetchDashboardData]);

  // Card 1: Active / Open Inquiries (all leads not closed)
  const openLeads = leads.filter((lead) => lead.status !== 'closed');

  // Card 3: Priority Emergency Requests (emergency-services and still active/not closed)
  const activeEmergencyRequests = leads.filter(
    (lead) => lead.serviceNeeded === 'emergency-services' && lead.status !== 'closed'
  );

  const recentLeads = leads.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Welcome & System Status */}
      <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00B86B]">
            {currentUserRole === 'technician' ? 'Field Operations Center' : 'Commercial Operating System'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase mt-1">
            {currentUserRole === 'technician' ? 'Technician Dispatch Workspace' : 'Northstar Operations Workspace'}
          </h1>
          <p className="text-xs sm:text-sm text-[#617070] mt-1 max-w-xl">
            {currentUserRole === 'technician'
              ? 'Assigned commercial work order queue, equipment service logging, diagnostic checklists, and site completion audit trails.'
              : 'Centralized hub bridging public website service requests with internal property-maintenance workflow dispatch and tenant resolution.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUserRole === 'technician' ? (
            <Link
              to="/workspace/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors shadow-xs"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#00B86B]" />
              <span>Review Assigned Work Orders</span>
            </Link>
          ) : (
            <Link
              to="/workspace/leads"
              className="px-4 py-2.5 rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors"
            >
              Review Incoming Leads ({isLoading ? '...' : openLeads.length})
            </Link>
          )}
        </div>
      </div>

      {/* Product Architecture Blueprint Banner */}
      <div className="bg-[#063B35] text-white rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[#00C875]">
            Northstar Operating Architecture
          </span>
          <span className="text-[11px] text-white/50">Core Business Logic</span>
        </div>

        <h3 className="text-lg font-bold text-white">
          Digital Operating System Workflow
        </h3>

        {/* Visual Workflow Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {[
            { step: '1', title: 'Website Inquiry', desc: 'Public /contact submission' },
            { step: '2', title: 'CRM Lead', desc: 'Triage & qualification' },
            { step: '3', title: 'Property', desc: 'Asset link & site specs' },
            { step: '4', title: 'Assignment', desc: 'Trade specialist dispatch' },
            { step: '5', title: 'Task', desc: 'Actionable work order' },
            { step: '6', title: 'Status', desc: 'Live execution tracking' },
            { step: '7', title: 'Completion', desc: 'Audit photo & signoff' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/10 border border-white/10 rounded-2xl p-3 text-center flex flex-col justify-between">
              <span className="w-5 h-5 rounded-full bg-[#00C875] text-[#063B35] text-[10px] font-black mx-auto mb-1 flex items-center justify-center">
                {item.step}
              </span>
              <p className="text-xs font-bold text-white">{item.title}</p>
              <p className="text-[10px] text-white/60 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inline Error State with Retry Action */}
      {!isLoading && error && (
        <div className="bg-white p-8 rounded-3xl border border-red-200 text-center space-y-3 shadow-xs max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-bold text-[#063B35]">Unable to Load Dashboard Data</h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            {error} Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Role-Specific Content */}
      {currentUserRole === 'technician' ? (
        /* Field Technician Operational Console */
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-10 space-y-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00B86B]/15 text-[#063B35] flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#00B86B]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#063B35] uppercase tracking-tight">
                Field Technician Operational Console
              </h2>
              <p className="text-xs text-[#617070]">
                Operational work, on-site diagnostics, and maintenance dispatch are managed through Work Orders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#063B35]">
                <CheckSquare className="w-4 h-4 text-[#00B86B]" />
                <span>Assigned Work Orders</span>
              </div>
              <p className="text-xs text-[#617070]">
                Review your scheduled property tickets, update work order status, and add timestamped field job notes.
              </p>
              <div className="pt-2">
                <Link
                  to="/workspace/tasks"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B86B] hover:text-[#063B35] transition-colors"
                >
                  <span>Open Work Orders Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#063B35]">
                <ShieldCheck className="w-4 h-4 text-[#00B86B]" />
                <span>Role &amp; Data Governance</span>
              </div>
              <p className="text-xs text-[#617070]">
                Lead intake, commercial valuations, and client CRM management are reserved for Operations Coordinators and Management.
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-[#617070] bg-white px-2.5 py-1 rounded-full border border-[#E1EBE7]">
                  Field Access Level Active
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Admin / Manager CRM Operational Overview */
        <>
          {/* Operational Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card 1: Open Inquiries */}
            <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#617070]">Open Inquiries</span>
                <Inbox className="w-4 h-4 text-[#00B86B]" />
              </div>
              <div className="text-3xl font-extrabold text-[#063B35]">
                {isLoading ? '...' : openLeads.length}
              </div>
              <p className="text-xs text-[#617070]">Active leads submitted through website form</p>
            </div>

            {/* Card 2: Active Properties */}
            <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#617070]">Active Properties</span>
                <Building2 className="w-4 h-4 text-[#00B86B]" />
              </div>
              <div className="text-3xl font-extrabold text-[#063B35]">142</div>
              <p className="text-xs text-[#617070]">Demo portfolio assets</p>
            </div>

            {/* Card 3: Priority Emergency Requests */}
            <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#617070]">Priority Emergency Requests</span>
                <AlertTriangle className="w-4 h-4 text-[#00B86B]" />
              </div>
              <div className="text-3xl font-extrabold text-[#063B35]">
                {isLoading ? '...' : activeEmergencyRequests.length}
              </div>
              <p className="text-xs text-[#617070]">Active emergency requests requiring coordination</p>
            </div>

          </div>

          {/* Recent Leads Feed */}
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#063B35] uppercase tracking-tight">
                  Recent Website Inquiries (CRM Leads)
                </h3>
                <p className="text-xs text-[#617070]">Submissions captured from public website contact form</p>
              </div>
              <Link
                to="/workspace/leads"
                className="text-xs font-bold text-[#00B86B] hover:text-[#063B35] inline-flex items-center gap-1"
              >
                <span>View All Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 bg-[#F3F7F5] rounded-2xl border border-[#E1EBE7]/50" />
                  ))}
                </div>
              ) : recentLeads.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] text-center text-xs text-[#617070]">
                  No incoming website inquiries awaiting review.
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/workspace/leads/${lead.id}`}
                    className="block p-4 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] hover:border-[#00B86B]/50 hover:bg-white transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#063B35]">{lead.company}</span>
                          <span className="text-[11px] text-[#617070]">• {lead.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35] font-semibold uppercase">
                            {lead.status}
                          </span>
                          {lead.serviceNeeded === 'emergency-services' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold uppercase">
                              Emergency
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#617070] mt-1 truncate max-w-xl">
                          {lead.propertyAddress} — {lead.message}
                        </p>
                      </div>

                      <div className="text-xs text-right shrink-0">
                        <span className="font-semibold text-[#063B35] block">{lead.serviceNeeded.replace('-', ' ')}</span>
                        <span className="text-[11px] text-[#617070]">{lead.createdAt}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
