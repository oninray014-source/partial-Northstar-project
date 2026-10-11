import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Building2, 
  CheckSquare, 
  Inbox, 
  User, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  RefreshCw
} from 'lucide-react';
import { 
  getActivityEvents, 
  ActivityEvent, 
  ActivityEntityType, 
  ActivityActionType 
} from '../../services/activityService';
import { getCurrentUserRole } from '../../services/workOrdersService';

type EntityFilterType = 'all' | 'task' | 'lead' | 'property';
type ActionFilterCategory = 'all' | 'status_changes' | 'new_intakes' | 'assignments';

export const WorkspaceActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'technician' | 'anon' | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<EntityFilterType>('all');
  const [actionFilter, setActionFilter] = useState<ActionFilterCategory>('all');

  const fetchActivityData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // 1. Resolve authenticated user role
    const { role } = await getCurrentUserRole();
    setCurrentUserRole(role);

    // 2. Fetch authoritative activity events from Supabase (governed by PostgreSQL RLS)
    const { data, error: fetchErr } = await getActivityEvents();
    if (fetchErr) {
      setError(fetchErr.message || 'Failed to load operational activity logs.');
      setActivities([]);
    } else {
      setActivities(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // Today's local date prefix for "ACTIONS TODAY" metric (YYYY-MM-DD)
  const todayPrefix = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const total = activities.length;
    const taskUpdates = activities.filter((a) => a.entityType === 'task').length;
    const leadActions = activities.filter((a) => a.entityType === 'lead').length;
    const actionsToday = activities.filter((a) => a.timestamp.startsWith(todayPrefix)).length;

    return {
      total,
      taskUpdates,
      leadActions,
      actionsToday
    };
  }, [activities, todayPrefix]);

  // Filter and search logic
  const filteredActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return activities.filter((act) => {
      // 1. Text Search across title, description, entity ID, entity name, actor
      const matchesSearch = !term || [
        act.title,
        act.description || '',
        act.entityId,
        act.entityName || '',
        act.actor
      ].some((val) => val.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // 2. Entity Filter
      if (entityFilter !== 'all' && act.entityType !== entityFilter) {
        return false;
      }

      // 3. Action Filter Category
      if (actionFilter === 'status_changes') {
        const isStatusChange = 
          act.actionType === 'lead_status_updated' ||
          act.actionType === 'task_status_updated' ||
          act.actionType === 'task_completed';
        if (!isStatusChange) return false;
      } else if (actionFilter === 'new_intakes') {
        const isNewIntake = 
          act.actionType === 'lead_created' ||
          act.actionType === 'task_created' ||
          act.actionType === 'property_added';
        if (!isNewIntake) return false;
      } else if (actionFilter === 'assignments') {
        const isAssignment = 
          act.actionType === 'lead_assigned' ||
          act.actionType === 'lead_property_linked';
        if (!isAssignment) return false;
      }

      return true;
    });
  }, [activities, searchTerm, entityFilter, actionFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setEntityFilter('all');
    setActionFilter('all');
  };

  // Render Action Icon
  const getActionIcon = (actionType: ActivityActionType) => {
    switch (actionType) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-[#00B86B]" />;
      case 'task_status_updated':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'task_created':
        return <CheckSquare className="w-4 h-4 text-[#00B86B]" />;
      case 'lead_created':
        return <Inbox className="w-4 h-4 text-emerald-600" />;
      case 'lead_status_updated':
        return <SlidersHorizontal className="w-4 h-4 text-blue-600" />;
      case 'lead_assigned':
        return <UserCheck className="w-4 h-4 text-[#00B86B]" />;
      case 'lead_property_linked':
      case 'property_added':
        return <Building2 className="w-4 h-4 text-[#063B35]" />;
      default:
        return <Activity className="w-4 h-4 text-[#617070]" />;
    }
  };

  const getActionTypeLabel = (actionType: ActivityActionType): string => {
    switch (actionType) {
      case 'lead_created': return 'Inquiry Received';
      case 'lead_status_updated': return 'Lead Status';
      case 'lead_assigned': return 'Specialist Assigned';
      case 'lead_property_linked': return 'Asset Linked';
      case 'task_created': return 'Work Order Created';
      case 'task_status_updated': return 'Work Order Update';
      case 'task_completed': return 'Work Order Signed Off';
      case 'property_added': return 'Facility Enrolled';
      default: return 'Operational Event';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[#00B86B] uppercase mb-1">
            Operational Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-[#00B86B]" />
            <span>Facility Activity &amp; Dispatch Log</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#617070] mt-1 max-w-2xl">
            Chronological record of commercial service inquiries, assignments, work orders, and operational updates across Central Texas.
          </p>
        </div>

        {/* Quick link to Work Orders */}
        <Link
          to="/workspace/tasks"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E1EBE7] text-xs font-bold text-[#063B35] hover:border-[#00B86B] hover:bg-[#F3F7F5] transition-all min-h-[44px] shadow-2xs self-start md:self-auto focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
        >
          <CheckSquare className="w-4 h-4 text-[#00B86B]" />
          <span>Work Order Console</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#617070]" />
        </Link>
      </div>

      {/* Inline Error State with Retry Action */}
      {!isLoading && error && (
        <div className="bg-white p-8 rounded-3xl border border-red-200 text-center space-y-3 shadow-xs max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="font-bold text-[#063B35]">Unable to Load Activity Records</h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            {error} Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={fetchActivityData}
            className="px-5 py-2.5 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* 2. KPI Summary Strip */}
      <div className={`grid gap-3 sm:gap-4 ${currentUserRole === 'technician' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Total Logged Actions
            </div>
            <div className="text-2xl font-black text-[#063B35] mt-0.5">
              {isLoading ? '...' : summaryMetrics.total}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-[#00B86B]" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Work Order Updates
            </div>
            <div className="text-2xl font-black text-blue-700 mt-0.5">
              {isLoading ? '...' : summaryMetrics.taskUpdates}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {currentUserRole !== 'technician' && (
          <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
                CRM Inquiry Actions
              </div>
              <div className="text-2xl font-black text-[#063B35] mt-0.5">
                {isLoading ? '...' : summaryMetrics.leadActions}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F3F7F5] text-[#063B35] flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5 text-[#00B86B]" />
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-[#E1EBE7] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#617070] uppercase tracking-wider">
              Actions Today
            </div>
            <div className="text-2xl font-black text-[#063B35] mt-0.5">
              {isLoading ? '...' : summaryMetrics.actionsToday}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#00B86B]/10 text-[#063B35] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#00B86B]" />
          </div>
        </div>
      </div>

      {/* 3. Search & Operational Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E1EBE7] shadow-2xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <label htmlFor="activity-search-input" className="sr-only">
            Search activity log
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#879B95]" />
          <input
            id="activity-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action title, description, entity ID (e.g. WO-4401, LEAD-1082), facility, or actor..."
            className="w-full h-11 pl-10 pr-4 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl text-xs font-semibold text-[#063B35] placeholder:text-[#879B95] focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
          />
        </div>

        {/* Filter Rows */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-[#E1EBE7]/60">
          {/* Entity Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold text-[#617070] uppercase tracking-wider mr-1 hidden sm:inline">
              Entity:
            </span>
            {[
              { id: 'all', label: 'All Entities' },
              { id: 'task', label: 'Work Orders' },
              ...(currentUserRole !== 'technician' ? [{ id: 'lead', label: 'CRM Leads' }] : []),
              { id: 'property', label: 'Facilities' },
            ].map((tab) => {
              const isActive = entityFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEntityFilter(tab.id as EntityFilterType)}
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

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-extrabold text-[#617070] uppercase tracking-wider mr-1 hidden sm:inline">
              Action:
            </span>
            {[
              { id: 'all', label: 'All Actions' },
              { id: 'status_changes', label: 'Status Changes' },
              { id: 'new_intakes', label: 'New Intakes' },
              { id: 'assignments', label: 'Assignments' },
            ].map((tab) => {
              const isActive = actionFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActionFilter(tab.id as ActionFilterCategory)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00B86B] ${
                    isActive
                      ? 'bg-[#00B86B] text-[#063B35] shadow-2xs'
                      : 'bg-[#F3F7F5] text-[#063B35] hover:bg-[#E1EBE7]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {/* Clear Filters Reset */}
            {(searchTerm || entityFilter !== 'all' || actionFilter !== 'all') && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 rounded-xl border border-dashed border-[#00B86B] text-[#063B35] hover:bg-[#00B86B]/10 text-xs font-bold transition-all min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Chronological Activity Feed */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-[#E1EBE7] shadow-xs divide-y divide-[#E1EBE7] overflow-hidden animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-[#F3F7F5] rounded w-1/4" />
                <div className="h-4 bg-[#F3F7F5] rounded w-1/6" />
              </div>
              <div className="h-5 bg-[#F3F7F5] rounded w-1/2" />
              <div className="h-4 bg-[#F3F7F5] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="bg-white rounded-3xl border border-[#E1EBE7] shadow-xs divide-y divide-[#E1EBE7] overflow-hidden">
          {filteredActivities.map((act) => {
            const isLead = act.entityType === 'lead';
            const canViewLead = currentUserRole !== 'technician' && isLead;

            return (
              <div
                key={act.id}
                className="p-5 sm:p-6 hover:bg-[#F8FAF9] transition-colors space-y-3"
              >
                {/* Top Row: Event Meta, Type Badge, Monospace Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1.5 rounded-lg bg-[#F3F7F5] border border-[#E1EBE7] flex items-center justify-center shrink-0">
                      {getActionIcon(act.actionType)}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35] uppercase tracking-wider">
                      {getActionTypeLabel(act.actionType)}
                    </span>
                    <span className="font-mono text-[10px] text-[#617070] bg-[#F3F7F5] px-2 py-0.5 rounded border border-[#E1EBE7]">
                      {act.id}
                    </span>
                  </div>

                  <span className="font-mono text-xs font-semibold text-[#617070]">
                    {act.timestamp}
                  </span>
                </div>

                {/* Event Title & Narrative Description */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#063B35] leading-snug">
                    {act.title}
                  </h3>
                  {act.description && (
                    <p className="text-xs text-[#617070] mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Entity Badges, Actor Attribution & Deep Links */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-[#E1EBE7]/50">
                  {/* Entity Badges & Cross-module links */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary Entity Link / Badge */}
                    {act.entityType === 'task' ? (
                      <Link
                        to="/workspace/tasks"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F7F5] text-[#063B35] hover:text-[#00B86B] hover:border-[#00B86B] border border-[#E1EBE7] font-bold transition-all min-h-[36px]"
                        title="View Work Order in Console"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-[#00B86B]" />
                        <span className="font-mono">{act.entityId}</span>
                        <ArrowRight className="w-3 h-3 text-[#617070]" />
                      </Link>
                    ) : canViewLead ? (
                      <Link
                        to={`/workspace/leads/${act.entityId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F7F5] text-[#063B35] hover:text-[#00B86B] hover:border-[#00B86B] border border-[#E1EBE7] font-bold transition-all min-h-[36px]"
                        title="View CRM Lead Record"
                      >
                        <Inbox className="w-3.5 h-3.5 text-[#00B86B]" />
                        <span className="font-mono">{act.entityId}</span>
                        <ArrowRight className="w-3 h-3 text-[#617070]" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3F7F5] text-[#617070] border border-[#E1EBE7] font-mono text-[11px]">
                        <FileText className="w-3.5 h-3.5 text-[#879B95]" />
                        <span>{act.entityId}</span>
                      </span>
                    )}

                    {/* Associated Commercial Facility Link */}
                    {act.propertyId ? (
                      <Link
                        to={`/workspace/properties/${act.propertyId}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#063B35] hover:text-[#00B86B] hover:border-[#00B86B] border border-[#E1EBE7] font-semibold transition-all min-h-[36px]"
                        title="View Commercial Facility"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#00B86B]" />
                        <span>{act.entityName || act.propertyId}</span>
                      </Link>
                    ) : act.entityName ? (
                      <span className="text-[11px] text-[#617070] font-medium px-2 py-0.5 bg-[#F3F7F5] rounded border border-[#E1EBE7]">
                        {act.entityName}
                      </span>
                    ) : null}
                  </div>

                  {/* Actor Attribution */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#617070]">
                    <User className="w-3.5 h-3.5 text-[#00B86B]" />
                    <span>Logged by: <strong className="text-[#063B35] font-bold">{act.actor}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. Clean Empty State */
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-12 text-center space-y-3 shadow-xs">
          <Activity className="w-8 h-8 text-[#879B95] mx-auto" />
          <h3 className="text-base font-bold text-[#063B35] uppercase tracking-wide">
            {searchTerm || entityFilter !== 'all' || actionFilter !== 'all'
              ? 'No Activity Matches'
              : currentUserRole === 'technician'
              ? 'No operational work order updates logged for your assigned tickets.'
              : 'No activity records found matching criteria.'}
          </h3>
          <p className="text-xs text-[#617070] max-w-sm mx-auto">
            {searchTerm || entityFilter !== 'all' || actionFilter !== 'all'
              ? 'Adjust the search query or operational filters to view additional recorded events.'
              : currentUserRole === 'technician'
              ? 'Assigned ticket status changes, dispatch notes, and completion milestones will appear here once logged.'
              : 'Operational service events, inquiry triage milestones, and work order transitions will appear here.'}
          </p>
          {(searchTerm || entityFilter !== 'all' || actionFilter !== 'all') && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-all min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#00B86B]" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
