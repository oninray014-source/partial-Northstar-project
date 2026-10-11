import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Wrench, 
  Search, 
  Layers, 
  Inbox, 
  ArrowRight, 
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { getProperties } from '../../services/propertiesService';
import { getLeads } from '../../services/leadsService';
import { getCurrentUserRole } from '../../services/workOrdersService';
import { CommercialProperty, CRMLead, PropertyType } from '../../types';

export const WorkspaceProperties: React.FC = () => {
  const [properties, setProperties] = useState<CommercialProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'technician' | 'anon'>('technician');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [onboardingNotice, setOnboardingNotice] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);

    // 1. Fetch properties from Supabase
    const { data, error: err } = await getProperties();
    if (err) {
      setError(err.message || 'Unable to load commercial properties.');
      setProperties([]);
      setIsLoading(false);
      return;
    }
    setProperties(data || []);
    setIsLoading(false);

    // 2. Role-gated Leads query (Admins only)
    try {
      const { role: resolvedRole } = await getCurrentUserRole();
      setUserRole(resolvedRole);

      if (resolvedRole === 'admin') {
        const { data: leadsData, error: leadsErr } = await getLeads();
        if (!leadsErr && leadsData) {
          setLeads(leadsData);
        } else {
          setLeads([]);
        }
      } else {
        setLeads([]);
      }
    } catch {
      setLeads([]);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleLeadsUpdate = async () => {
      try {
        const { role: resolvedRole } = await getCurrentUserRole();
        if (!isMounted) return;
        if (resolvedRole === 'admin') {
          const { data: leadsData, error: leadsErr } = await getLeads();
          if (!isMounted) return;
          if (!leadsErr && leadsData) {
            setLeads(leadsData);
          }
        }
      } catch {
        // fail safely
      }
    };

    window.addEventListener('northstar_leads_updated', handleLeadsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('northstar_leads_updated', handleLeadsUpdate);
    };
  }, []);

  const propertyTypes: (PropertyType | 'All')[] = [
    'All',
    'Office Buildings',
    'Retail Spaces',
    'Healthcare Facilities',
    'Hospitality',
    'Industrial / Flex Space',
    'Other Commercial',
  ];

  const filteredProperties = properties.filter((prop) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [
      prop.name,
      prop.clientCompany,
      prop.address,
      prop.id
    ].some((val) => val.toLowerCase().includes(term));

    const matchesType = selectedType === 'All' || prop.propertyType === selectedType;

    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: CommercialProperty['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Active Care
          </span>
        );
      case 'under-assessment':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            Under Assessment
          </span>
        );
      case 'inactive':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#063B35] tracking-tight uppercase">
            Commercial Properties Under Care
          </h1>
          <p className="text-xs text-[#617070]">
            Linked physical facilities, mechanical equipment tags, and service history.
          </p>
        </div>

        {/* Action Button: Clearly intentional foundation control with 44px min-height */}
        <button
          type="button"
          onClick={() => {
            setOnboardingNotice(
              'Commercial facility creation is scheduled for the next portfolio onboarding release. Contact operations desk for new account enrollment.'
            );
          }}
          className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2 self-start sm:self-auto shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
          title="Onboard New Commercial Facility"
        >
          <Plus className="w-4 h-4 text-[#00C875]" />
          <span>Add Commercial Facility</span>
        </button>
      </div>

      {/* Onboarding Notice Banner */}
      {onboardingNotice && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-[#063B35]/5 border border-[#063B35]/15 text-[#063B35] text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#00B86B] shrink-0" />
            <span>{onboardingNotice}</span>
          </div>

          <button
            type="button"
            onClick={() => setOnboardingNotice(null)}
            className="text-[#617070] hover:text-[#063B35] p-1 text-xs font-bold"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E1EBE7] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#617070] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by property name, client company, or address..."
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs bg-[#F3F7F5] rounded-xl border border-transparent focus:border-[#00B86B] focus:bg-white focus:outline-none transition-all placeholder:text-[#617070]"
          />
        </div>

        {/* Property Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <label htmlFor="property-type-filter" className="text-[11px] font-bold text-[#617070] uppercase shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#00B86B]" />
            <span>Type:</span>
          </label>
          <select
            id="property-type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs font-semibold px-3 py-2 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
          >
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-[#E1EBE7] p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-2/3">
                  <div className="h-3 bg-[#F3F7F5] rounded w-20"></div>
                  <div className="h-5 bg-[#F3F7F5] rounded-md w-4/5"></div>
                  <div className="h-3 bg-[#F3F7F5] rounded w-1/2"></div>
                </div>
                <div className="h-5 bg-[#F3F7F5] rounded-full w-20"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 bg-[#F3F7F5] rounded w-full"></div>
                <div className="h-3 bg-[#F3F7F5] rounded w-3/4"></div>
                <div className="h-3 bg-[#F3F7F5] rounded w-5/6"></div>
              </div>
              <div className="pt-3 border-t border-[#E1EBE7] flex justify-between">
                <div className="h-3 bg-[#F3F7F5] rounded w-24"></div>
                <div className="h-3 bg-[#F3F7F5] rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-white p-8 rounded-3xl border border-red-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
            !
          </div>
          <h3 className="font-bold text-[#063B35]">Unable to load commercial properties</h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            {error} Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={fetchProperties}
            className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Property Cards Grid */}
      {!isLoading && !error && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => {
            // Compute linked open service requests from live Supabase leads (Admin only)
            const linkedLeads = userRole === 'admin' ? leads.filter((l) => l.propertyId === prop.id) : [];
            const openRequestCount = linkedLeads.filter((l) => l.status !== 'closed').length;

            return (
              <Link
                key={prop.id}
                to={`/workspace/properties/${prop.id}`}
                className="group bg-white rounded-3xl border border-[#E1EBE7] p-6 space-y-4 hover:border-[#00B86B]/60 hover:shadow-md transition-all flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
              >
                <div className="space-y-3">
                  {/* Top Row: Type & Status Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#00B86B]">{prop.id}</span>
                        <span className="text-[#617070] text-[10px]">·</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#063B35]">
                          {prop.propertyType}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#063B35] group-hover:text-[#00B86B] transition-colors leading-snug">
                        {prop.name}
                      </h3>
                      <p className="text-[11px] font-medium text-[#617070] truncate">
                        {prop.clientCompany}
                      </p>
                    </div>
                    {getStatusBadge(prop.status)}
                  </div>

                  {/* Facility Details */}
                  <div className="space-y-2 text-xs text-[#617070] pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                      <span className="truncate" title={prop.address}>{prop.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                      <span>{prop.squareFootage}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Wrench className="w-3.5 h-3.5 text-[#00B86B] shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">
                        {prop.equipmentTags.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: PM Cycle, Open Tickets, Navigation */}
                <div className="pt-3 border-t border-[#E1EBE7] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#617070]">
                    <span>PM Cycle: <strong className="text-[#063B35] font-semibold">{prop.pmCycle || 'Quarterly'}</strong></span>
                    {userRole === 'admin' ? (
                      openRequestCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <Inbox className="w-3 h-3 text-[#00B86B]" />
                          <span>{openRequestCount} Active {openRequestCount === 1 ? 'Ticket' : 'Tickets'}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#617070]">0 Active Tickets</span>
                      )
                    ) : (
                      <span className="text-[11px] text-[#617070]">—</span>
                    )}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-[#063B35] group-hover:text-[#00B86B] transition-colors min-h-[32px]">
                    <span>View Property</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredProperties.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-[#E1EBE7] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F3F7F5] flex items-center justify-center mx-auto text-[#617070]">
            <Building2 className="w-6 h-6 text-[#617070]/60" />
          </div>
          <h3 className="font-bold text-[#063B35]">No Commercial Properties Found</h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            {searchTerm ? (
              <>No properties matched your search query &ldquo;{searchTerm}&rdquo; or selected filter.</>
            ) : (
              <>No commercial facilities are currently registered under care.</>
            )}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('All');
              }}
              className="px-4 py-2 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors"
            >
              Clear Search &amp; Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
