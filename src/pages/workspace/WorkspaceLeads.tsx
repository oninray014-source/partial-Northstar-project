import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  ChevronRight, 
  Building2, 
  MapPin, 
  Plus,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { getLeads } from '../../services/leadsService';
import { CRMLead } from '../../types';

export const WorkspaceLeads: React.FC = () => {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'emergency'>('all');

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await getLeads();
    if (err) {
      setError(err.message || 'Unable to load service leads.');
      setLeads([]);
    } else {
      setLeads(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      fetchLeads();
    };
    window.addEventListener('northstar_leads_updated', handleUpdate);
    return () => window.removeEventListener('northstar_leads_updated', handleUpdate);
  }, []);

  // Summary Metrics (dynamic)
  const totalCount = leads.length;
  const newCount = leads.filter((l) => l.status === 'new').length;
  const emergencyCount = leads.filter(
    (l) => (l.priority === 'critical' || l.serviceNeeded === 'emergency-services') && l.status !== 'closed'
  ).length;

  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.trim().toLowerCase();
    const serviceName = lead.serviceNeeded ? lead.serviceNeeded.replace(/-/g, ' ') : '';
    
    const searchDigits = search.replace(/\D/g, '');
    const phoneDigits = lead.phone ? lead.phone.replace(/\D/g, '') : '';
    const matchesPhoneDigits = Boolean(searchDigits && searchDigits.length >= 3 && phoneDigits.includes(searchDigits));
    
    const matchesSearch = !search || matchesPhoneDigits || [
      lead.company,
      lead.name,
      lead.propertyAddress,
      lead.serviceNeeded,
      serviceName,
      lead.id,
      lead.phone,
      lead.email,
      lead.propertyType,
      lead.assignedTechnician,
      lead.propertyId,
    ].some((field) => typeof field === 'string' && field.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    const isEmergency = lead.priority === 'critical' || lead.serviceNeeded === 'emergency-services';
    const matchesUrgency = urgencyFilter === 'all' || (isEmergency && (statusFilter === 'closed' ? true : lead.status !== 'closed'));

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const statusColors: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    assessing: 'bg-amber-100 text-amber-800 border-amber-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    dispatched: 'bg-purple-100 text-purple-800 border-purple-200',
    closed: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#063B35] tracking-tight uppercase">
            Inquiry &amp; CRM Leads
          </h1>
          <p className="text-xs text-[#617070]">
            Track service requests submitted via website form through assessment and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Public Submission</span>
          </Link>
        </div>
      </div>

      {/* Compact Operational Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#E1EBE7] px-4 py-3 flex items-center justify-between shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#617070]">Total Leads</span>
          <span className="text-lg font-extrabold text-[#063B35]">{totalCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-[#E1EBE7] px-4 py-3 flex items-center justify-between shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#617070]">New / Needs Triage</span>
          <span className="text-lg font-extrabold text-[#00B86B]">{newCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-[#E1EBE7] px-4 py-3 flex items-center justify-between shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#617070]">Priority Emergency</span>
          <span className={`text-lg font-extrabold ${emergencyCount > 0 ? 'text-red-700' : 'text-[#063B35]'}`}>
            {emergencyCount}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#617070]" />
          <input
            type="text"
            placeholder="Search company, address, trade, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] text-xs rounded-xl bg-[#F3F7F5] border border-[#E1EBE7] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
          />
        </div>

        {/* Status Filter Tabs & Emergency Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'new', 'assessing', 'scheduled', 'dispatched', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-semibold capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-[#063B35] text-white'
                  : 'bg-[#F3F7F5] text-[#617070] hover:text-[#063B35]'
              }`}
            >
              {status}
            </button>
          ))}

          <div className="h-6 w-px bg-[#E1EBE7] hidden sm:block mx-1" aria-hidden="true" />

          {/* Emergency Filter Toggle */}
          <button
            onClick={() => setUrgencyFilter(urgencyFilter === 'emergency' ? 'all' : 'emergency')}
            className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5 rounded-full text-xs font-bold transition-colors ${
              urgencyFilter === 'emergency'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency{emergencyCount > 0 ? ` (${emergencyCount})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#E1EBE7] p-5 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-3 space-y-2">
                    <div className="h-4 bg-[#F3F7F5] rounded w-28"></div>
                    <div className="h-4 bg-[#F3F7F5] rounded w-40"></div>
                    <div className="h-3 bg-[#F3F7F5] rounded w-24"></div>
                  </div>
                  <div className="lg:col-span-4 space-y-2">
                    <div className="h-4 bg-[#F3F7F5] rounded w-36"></div>
                    <div className="h-3 bg-[#F3F7F5] rounded w-48"></div>
                  </div>
                  <div className="lg:col-span-3 space-y-2">
                    <div className="h-4 bg-[#F3F7F5] rounded w-32"></div>
                    <div className="h-3 bg-[#F3F7F5] rounded w-24"></div>
                  </div>
                  <div className="lg:col-span-2 flex justify-end">
                    <div className="w-7 h-7 rounded-full bg-[#F3F7F5]"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="bg-white p-8 rounded-3xl border border-red-200 text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
              !
            </div>
            <h3 className="font-bold text-[#063B35]">Unable to load service leads</h3>
            <p className="text-xs text-[#617070] max-w-sm mx-auto">
              {error} Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={fetchLeads}
              className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredLeads.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-12 text-center space-y-3 shadow-xs">
            <Inbox className="w-10 h-10 text-[#617070]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#063B35]">
              {urgencyFilter === 'emergency' ? 'No Emergency Requests Found' : 'No Leads Found'}
            </h3>
            <p className="text-xs text-[#617070] max-w-sm mx-auto">
              {urgencyFilter === 'emergency'
                ? 'No active critical or emergency service requests match the current filters.'
                : 'No service inquiries match your search or filter. Try clearing the filter or submitting a test request on the public contact page.'}
            </p>
            {(searchTerm || statusFilter !== 'all' || urgencyFilter !== 'all') && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setUrgencyFilter('all');
                  }}
                  className="text-xs font-bold text-[#063B35] underline hover:text-[#00B86B] transition-colors min-h-[44px] inline-flex items-center"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Populated List */}
        {!isLoading && !error && filteredLeads.length > 0 && (
          filteredLeads.map((lead) => {
            const isCritical = lead.priority === 'critical' || lead.serviceNeeded === 'emergency-services';
            const isHigh = lead.priority === 'high' && !isCritical;

            return (
              <Link
                key={lead.id}
                to={`/workspace/leads/${lead.id}`}
                className="block bg-white rounded-2xl border border-[#E1EBE7] p-5 hover:border-[#00B86B]/60 hover:shadow-sm transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  
                  {/* Lead ID, Priority & Status */}
                  <div className="lg:col-span-3 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-black text-[#063B35] tracking-tight">{lead.id}</span>
                      
                      {/* Priority Badges */}
                      {isCritical && (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wider">
                          EMERGENCY
                        </span>
                      )}
                      {isHigh && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 tracking-wider">
                          HIGH PRIORITY
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusColors[lead.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {lead.status}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-[#063B35] truncate">{lead.company}</h3>
                    <p className="text-xs text-[#617070] truncate">{lead.name}</p>
                  </div>

                  {/* Property Environment & Location */}
                  <div className="lg:col-span-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#063B35]">
                      <Building2 className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                      <span className="truncate">{lead.propertyType}</span>
                      {lead.propertyId && (
                        <span className="font-mono text-[10px] text-[#00B86B] font-bold">
                          ({lead.propertyId})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#617070] truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#617070]/60 shrink-0" />
                      <span className="truncate">{lead.propertyAddress}</span>
                    </div>
                  </div>

                  {/* Trade, Value & Technician Assignment */}
                  <div className="lg:col-span-3 space-y-1 text-xs">
                    <span className="font-semibold text-[#063B35] capitalize block">
                      {lead.serviceNeeded.replace(/-/g, ' ')}
                    </span>
                    <div className="text-[11px] text-[#617070] space-y-0.5">
                      <span className="block">
                        Est. {lead.estimatedValue || 'Pending'}
                      </span>
                      <span className="block truncate">
                        Assigned: <span className="font-medium text-[#063B35]">{lead.assignedTechnician || 'Unassigned'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions & Timestamp */}
                  <div className="lg:col-span-2 flex items-center justify-end gap-2 text-xs font-bold text-[#063B35]">
                    <span className="text-[11px] text-[#617070] hidden sm:inline">{lead.createdAt}</span>
                    <div className="w-7 h-7 rounded-full bg-[#F3F7F5] flex items-center justify-center text-[#063B35] group-hover:bg-[#063B35] group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              </Link>
            );
          })
        )}
      </div>

    </div>
  );
};
