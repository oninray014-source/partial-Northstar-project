import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, Building2, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { getLeads } from '../../services/leadsService';
import { getCurrentUserRole } from '../../services/workOrdersService';
import { CRMLead } from '../../types';

export const WorkspacePipeline: React.FC = () => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'technician' | 'anon' | null>(null);

  const fetchPipelineData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Verify user role first
    const { role } = await getCurrentUserRole();
    setCurrentUserRole(role);

    if (role === 'technician') {
      // Technicians have zero leads access by architecture and RLS
      setLeads([]);
      setIsLoading(false);
      return;
    }

    // 2. Fetch leads from Supabase via leadsService
    const { data, error: fetchErr } = await getLeads();
    if (fetchErr) {
      setError(fetchErr.message || 'Failed to load pipeline leads from database.');
      setLeads([]);
    } else {
      setLeads(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPipelineData();

    const handleUpdate = () => {
      fetchPipelineData();
    };
    window.addEventListener('northstar_leads_updated', handleUpdate);
    return () => window.removeEventListener('northstar_leads_updated', handleUpdate);
  }, [fetchPipelineData]);

  const formatLeadDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const datePart = dateStr.split(' ')[0];
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return datePart;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIndex = parseInt(month, 10) - 1;
    const dNum = parseInt(day, 10);
    if (mIndex >= 0 && mIndex < 12 && !isNaN(dNum)) {
      return `${monthNames[mIndex]} ${dNum}`;
    }
    return datePart;
  };

  const formatTechnicianName = (raw?: string): string => {
    if (!raw || !raw.trim()) return 'Unassigned';
    const trimmed = raw.trim();
    if (trimmed.toLowerCase().startsWith('unassigned')) return 'Unassigned';
    const nameOnly = trimmed.replace(/\s*\([^)]*\)/g, '').trim();
    return nameOnly || trimmed;
  };

  const stages: { key: CRMLead['status']; label: string; countColor: string }[] = [
    { key: 'new', label: '1. New Inquiries', countColor: 'bg-emerald-500' },
    { key: 'assessing', label: '2. Property Assessment', countColor: 'bg-amber-500' },
    { key: 'scheduled', label: '3. Work Scheduled', countColor: 'bg-blue-500' },
    { key: 'dispatched', label: '4. Dispatched On-Site', countColor: 'bg-purple-500' },
    { key: 'closed', label: '5. Completed / Closed', countColor: 'bg-slate-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#063B35] tracking-tight uppercase">
            Facility Service Pipeline
          </h1>
          <p className="text-xs text-[#617070]">
            Lifecycle flow: Website Inquiry → Property Assessment → Work Scheduled → On-Site Dispatch → Completion
          </p>
        </div>

        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Inquiry</span>
        </Link>
      </div>

      {/* Role / Access Restriction for Field Technicians */}
      {currentUserRole === 'technician' ? (
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[#063B35]">
              CRM Pipeline is reserved for Operations &amp; Management.
            </h2>
            <p className="text-xs text-[#617070] leading-relaxed max-w-md mx-auto">
              Lead intake, commercial valuations, and inquiry stage workflows are restricted to Operations Coordinators and Management. Field specialists can view and manage their assigned dispatch tasks directly in Work Orders.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/workspace/tasks"
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors shadow-xs"
            >
              <span>Go to Work Orders</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00B86B]" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Inline Error State with Retry Action */}
          {!isLoading && error && (
            <div className="bg-white p-8 rounded-3xl border border-red-200 text-center space-y-3 shadow-xs max-w-xl mx-auto">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-[#063B35]">Unable to Load Pipeline Leads</h3>
              <p className="text-xs text-[#617070] max-w-sm mx-auto">
                {error} Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={fetchPipelineData}
                className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Kanban Pipeline Columns */}
          <div className="flex xl:grid xl:grid-cols-5 gap-4 overflow-x-auto pb-4 pt-1 -mx-2 px-2">
            {stages.map((stage) => {
              const stageLeads = leads.filter((l) => l.status === stage.key);

              return (
                <div
                  key={stage.key}
                  className="bg-white/80 rounded-2xl border border-[#E1EBE7] p-4 flex flex-col min-h-[480px] w-[280px] sm:w-[300px] xl:w-auto min-w-[260px] flex-shrink-0 xl:flex-shrink shadow-xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE7] mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.countColor}`} />
                      <span className="text-xs font-bold text-[#063B35] uppercase tracking-tight">{stage.label}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7]">
                      {isLoading ? '...' : stageLeads.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {isLoading ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-28 bg-[#F3F7F5] rounded-xl border border-[#E1EBE7]/50" />
                        <div className="h-24 bg-[#F3F7F5] rounded-xl border border-[#E1EBE7]/50" />
                      </div>
                    ) : (
                      <>
                        {stageLeads.map((lead) => {
                          const isCritical = lead.priority === 'critical' || lead.serviceNeeded === 'emergency-services';
                          const isHigh = lead.priority === 'high' && !isCritical;
                          const serviceName = lead.serviceNeeded ? lead.serviceNeeded.replace(/-/g, ' ') : '';
                          const technicianDisplay = formatTechnicianName(lead.assignedTechnician);
                          const estimatedDisplay = lead.estimatedValue && lead.estimatedValue.trim()
                            ? lead.estimatedValue
                            : 'Pending';
                          const dateDisplay = formatLeadDate(lead.createdAt);

                          return (
                            <Link
                              key={lead.id}
                              to={`/workspace/leads/${lead.id}`}
                              className="block bg-white p-3.5 rounded-xl border border-[#E1EBE7] hover:border-[#00B86B]/60 hover:shadow-sm transition-all text-xs space-y-2.5 focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                            >
                              {/* Top Row: Priority Badges & Lead ID */}
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isCritical && (
                                    <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wider">
                                      <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                                      <span>EMERGENCY</span>
                                    </span>
                                  )}
                                  {isHigh && (
                                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 tracking-wider">
                                      HIGH PRIORITY
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#00B86B] font-mono font-bold shrink-0">{lead.id}</span>
                              </div>

                              {/* Company & Property Context */}
                              <div className="space-y-0.5">
                                <span className="font-bold text-[#063B35] leading-tight line-clamp-1 block text-sm">
                                  {lead.company}
                                </span>
                                {lead.propertyType && (
                                  <div className="flex items-center gap-1 text-[11px] text-[#617070]">
                                    <Building2 className="w-3 h-3 text-[#00B86B] shrink-0" />
                                    <span className="truncate">{lead.propertyType}</span>
                                  </div>
                                )}
                              </div>

                              {/* Scope Snippet */}
                              <p className="text-[11px] text-[#617070] line-clamp-2 leading-relaxed">
                                {lead.message || lead.propertyAddress}
                              </p>

                              {/* Primary Service Discipline */}
                              {serviceName && (
                                <div className="text-[11px] font-semibold text-[#063B35] capitalize">
                                  {serviceName}
                                </div>
                              )}

                              {/* Operational Assignment & Valuation Metadata */}
                              <div className="pt-2 border-t border-[#E1EBE7] space-y-1 text-[11px]">
                                {/* Line 1: Assigned Specialist */}
                                <div className="text-[#617070] truncate" title={technicianDisplay}>
                                  Assigned: <span className="font-semibold text-[#063B35]">{technicianDisplay}</span>
                                </div>

                                {/* Line 2: Estimated Value and Date */}
                                <div className="text-[#617070] text-[10px] font-medium truncate">
                                  <span className="font-semibold text-[#063B35]">Est. {estimatedDisplay}</span>
                                  {dateDisplay && <span> · {dateDisplay}</span>}
                                </div>
                              </div>
                            </Link>
                          );
                        })}

                        {stageLeads.length === 0 && (
                          <div className="h-32 border-2 border-dashed border-[#E1EBE7] rounded-xl flex items-center justify-center text-center p-4 text-[11px] text-[#617070]/50">
                            No active tickets in this stage
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
