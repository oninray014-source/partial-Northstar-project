import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  CheckSquare, 
  Search, 
  Layers, 
  Building2, 
  User, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  ChevronDown,
  Loader2,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { 
  getWorkOrders, 
  updateWorkOrderStatus, 
  getWorkOrderNotes, 
  addWorkOrderNote,
  getAssignableTechnicians,
  assignWorkOrderTechnician,
  getCurrentUserRole,
  WorkOrderJobNote,
  AssignableTechnician 
} from '../../services/workOrdersService';
import { getProperties } from '../../services/propertiesService';
import { FacilityTask, CommercialProperty } from '../../types';

const SERVICE_LABELS: Record<string, string> = {
  'commercial-hvac': 'Commercial HVAC',
  'electrical': 'Electrical',
  'plumbing': 'Plumbing',
  'general-maintenance': 'General Maintenance',
  'preventive-maintenance': 'Preventive Maintenance',
  'emergency-services': 'Emergency Services'
};

const KNOWN_SPECIALISTS = [
  'Derrick Miller',
  'Robert Ramos',
  'Michael Torres',
  'Sarah Jenkins'
];

/**
 * Validates technician URL parameter against known specialists or 'unassigned'.
 * Unknown values fall back safely to 'all' to prevent broken UI states.
 */
function getValidTechnicianFilter(param: string | null): string {
  if (!param) return 'all';
  const trimmed = param.trim();
  if (trimmed.toLowerCase() === 'all') return 'all';
  if (trimmed.toLowerCase() === 'unassigned') return 'unassigned';
  const matched = KNOWN_SPECIALISTS.find(
    (s) => s.toLowerCase() === trimmed.toLowerCase()
  );
  return matched || 'all';
}

/**
 * Format timestamp into user-friendly localized string: "Oct 3, 2026 · 10:45 AM"
 */
function formatNoteTimestamp(isoStr: string | null | undefined): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const datePart = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${datePart} · ${timePart}`;
  } catch {
    return isoStr || '';
  }
}

/**
 * Normalizes role labels strictly to the two official Northstar workspace roles:
 * 1. Admin / Manager
 * 2. Staff / Technician
 */
function formatRoleLabel(role: string | null | undefined): string {
  const normalized = (role || '').trim().toLowerCase();
  if (normalized === 'admin') {
    return 'Admin / Manager';
  }
  return 'Staff / Technician';
}

export const WorkspaceTasks: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<FacilityTask[]>([]);
  const [properties, setProperties] = useState<CommercialProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<{ taskId: string; message: string } | null>(null);
  const [mutationNotice, setMutationNotice] = useState<{ taskId: string; message: string } | null>(null);

  // Job Notes State (Lazy-loaded, single-expanded accordion cache)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [notesCache, setNotesCache] = useState<Record<string, WorkOrderJobNote[]>>({});
  const [loadingNotes, setLoadingNotes] = useState<Record<string, boolean>>({});
  const [notesError, setNotesError] = useState<Record<string, string | null>>({});
  const [submittingNotes, setSubmittingNotes] = useState<Record<string, boolean>>({});
  const [newNoteBody, setNewNoteBody] = useState<Record<string, string>>({});
  const [noteSubmitError, setNoteSubmitError] = useState<Record<string, string | null>>({});
  const [noteSubmitNotice, setNoteSubmitNotice] = useState<Record<string, string | null>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>(() =>
    getValidTechnicianFilter(searchParams.get('technician'))
  );

  // Role & Technician Assignment State
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'technician' | 'anon'>('technician');
  const [assignableTechnicians, setAssignableTechnicians] = useState<AssignableTechnician[]>([]);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);

  // Synchronize technician filter if URL search parameters change while mounted
  useEffect(() => {
    const paramVal = searchParams.get('technician');
    const validVal = getValidTechnicianFilter(paramVal);
    setTechnicianFilter(validVal);
  }, [searchParams]);

  const handleTechnicianChange = (newTech: string) => {
    setTechnicianFilter(newTech);
    const newParams = new URLSearchParams(searchParams);
    if (newTech === 'all') {
      newParams.delete('technician');
    } else {
      newParams.set('technician', newTech);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTradeFilter('all');
    setTechnicianFilter('all');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('technician');
    setSearchParams(newParams, { replace: true });
  };

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: fetchError } = await getWorkOrders();
    if (fetchError) {
      setError(fetchError.message || 'Failed to load work orders from database.');
    } else {
      setTasks(data || []);
    }

    const { data: propData, error: propError } = await getProperties();
    if (propError) {
      console.error('Error loading commercial properties in WorkspaceTasks:', propError.message);
    } else {
      setProperties(propData || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchWorkOrders();

    // Check user role for assignment controls
    getCurrentUserRole().then(({ role }) => {
      if (role) {
        setCurrentUserRole(role);
      }
    });

    // Load active technician profiles from database
    getAssignableTechnicians().then(({ data }) => {
      if (data) {
        setAssignableTechnicians(data);
      }
    });

    // Synchronize properties from Supabase
    getProperties().then(({ data, error: propError }) => {
      if (propError) {
        console.error('Error fetching commercial properties from Supabase:', propError.message);
        setProperties([]);
      } else {
        setProperties(data || []);
      }
    });
  }, []);

  const handleTechnicianAssignment = async (task: FacilityTask, newTechProfileId: string) => {
    if (assigningTaskId) return;

    setAssigningTaskId(task.id);
    setMutationError(null);
    setMutationNotice(null);

    const techUuidOrNull = !newTechProfileId || newTechProfileId === 'unassigned' ? null : newTechProfileId;

    const { data: updated, error: assignError } = await assignWorkOrderTechnician(
      task.id,
      techUuidOrNull
    );

    if (assignError || !updated) {
      setMutationError({
        taskId: task.id,
        message: assignError ? assignError.message : 'Failed to update work order assignment.'
      });
    } else {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setMutationNotice({
        taskId: updated.id,
        message: updated.assignedTechnician
          ? `Assigned to ${updated.assignedTechnician}`
          : 'Assignment cleared (Unassigned)'
      });
      setTimeout(() => {
        setMutationNotice((current) => (current?.taskId === updated.id ? null : current));
      }, 3000);
    }

    setAssigningTaskId(null);
  };

  // Map property IDs to property records for quick lookup
  const propertyMap = React.useMemo(() => {
    const map = new Map<string, CommercialProperty>();
    properties.forEach((p) => map.set(p.id, p));
    return map;
  }, [properties]);

  const handleStatusChange = async (task: FacilityTask, newStatus: FacilityTask['status']) => {
    if (task.status === newStatus) return;

    setUpdatingTaskId(task.id);
    setMutationError(null);
    setMutationNotice(null);

    const nowIso = new Date().toISOString();
    const completedAt = newStatus === 'completed' ? nowIso : undefined;

    const { data: updated, error: updateError } = await updateWorkOrderStatus(
      task.id,
      newStatus,
      completedAt
    );

    if (updateError || !updated) {
      setMutationError({
        taskId: task.id,
        message: updateError ? updateError.message : 'Failed to update work order status.'
      });
    } else {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setMutationNotice({
        taskId: updated.id,
        message: `Status updated to ${newStatus}`
      });
      setTimeout(() => {
        setMutationNotice((current) => (current?.taskId === updated.id ? null : current));
      }, 3000);
    }

    setUpdatingTaskId(null);
  };

  /**
   * Lazily loads notes for a specific Work Order and caches them.
   */
  const loadNotes = async (taskId: string, force = false) => {
    if (notesCache[taskId] && !force) return;

    setLoadingNotes((prev) => ({ ...prev, [taskId]: true }));
    setNotesError((prev) => ({ ...prev, [taskId]: null }));

    const { data, error: fetchErr } = await getWorkOrderNotes(taskId);

    if (fetchErr) {
      setNotesError((prev) => ({
        ...prev,
        [taskId]: fetchErr.message || 'Failed to load job notes.'
      }));
    } else {
      setNotesCache((prev) => ({
        ...prev,
        [taskId]: data || []
      }));
    }

    setLoadingNotes((prev) => ({ ...prev, [taskId]: false }));
  };

  /**
   * Accordion toggle: expands the chosen Work Order notes panel, collapsing any other.
   */
  const toggleJobNotes = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      if (!notesCache[taskId]) {
        loadNotes(taskId);
      }
    }
  };

  /**
   * Appends a new Job Note to the target Work Order via the service adapter.
   */
  const handleAddNote = async (taskId: string) => {
    const rawBody = newNoteBody[taskId];
    if (!rawBody || !rawBody.trim()) {
      setNoteSubmitError((prev) => ({
        ...prev,
        [taskId]: 'Please enter a note before submitting.'
      }));
      return;
    }
    const trimmed = rawBody.trim();

    setSubmittingNotes((prev) => ({ ...prev, [taskId]: true }));
    setNoteSubmitError((prev) => ({ ...prev, [taskId]: null }));

    const { data: createdNote, error: addErr } = await addWorkOrderNote(taskId, trimmed);

    if (addErr || !createdNote) {
      setNoteSubmitError((prev) => ({
        ...prev,
        [taskId]: addErr?.message || 'Failed to add job note.'
      }));
    } else {
      // Append returned note to existing cache
      setNotesCache((prev) => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), createdNote]
      }));
      // Clear composer textarea
      setNewNoteBody((prev) => ({ ...prev, [taskId]: '' }));
      // Display brief confirmation notice
      setNoteSubmitNotice((prev) => ({
        ...prev,
        [taskId]: 'Job note added to record.'
      }));
      setTimeout(() => {
        setNoteSubmitNotice((prev) => (prev[taskId] ? { ...prev, [taskId]: null } : prev));
      }, 3000);
    }

    setSubmittingNotes((prev) => ({ ...prev, [taskId]: false }));
  };

  // Current ISO date string (YYYY-MM-DD) for overdue calculation
  const todayStr = '2026-09-26';

  const filteredTasks = tasks.filter((t) => {
    const term = searchTerm.trim().toLowerCase();
    const prop = t.propertyId ? propertyMap.get(t.propertyId) : undefined;
    const propName = prop ? prop.name : '';
    const propClient = prop ? prop.clientCompany : '';
    const techName = t.assignedTechnician || '';
    const tradeLabel = SERVICE_LABELS[t.serviceCategory] || t.serviceCategory;

    const matchesSearch = !term || [
      t.id,
      t.title,
      t.description || '',
      propName,
      propClient,
      techName,
      tradeLabel
    ].some((val) => val.toLowerCase().includes(term));

    const matchesTechnician = (() => {
      if (technicianFilter === 'all') return true;
      if (technicianFilter === 'unassigned') {
        return !t.assignedTechnician || !t.assignedTechnician.trim();
      }
      if (!t.assignedTechnician) return false;
      return t.assignedTechnician.toLowerCase().includes(technicianFilter.toLowerCase());
    })();

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesTrade = tradeFilter === 'all' || t.serviceCategory === tradeFilter;

    return matchesSearch && matchesTechnician && matchesStatus && matchesTrade;
  });

  const tradeCategories: { key: string; label: string }[] = [
    { key: 'all', label: 'All Trades' },
    { key: 'commercial-hvac', label: 'Commercial HVAC' },
    { key: 'electrical', label: 'Electrical' },
    { key: 'plumbing', label: 'Plumbing' },
    { key: 'preventive-maintenance', label: 'Preventive Maintenance' },
    { key: 'general-maintenance', label: 'General Maintenance' },
    { key: 'emergency-services', label: 'Emergency Services' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#063B35] tracking-tight uppercase">
            Work Order Tasks
          </h1>
          <p className="text-xs text-[#617070]">
            Actionable work orders generated from leads and preventive service requirements.
          </p>
        </div>

        {/* Informational Action Header Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-2 min-h-[44px] rounded-xl bg-[#F3F7F5] border border-[#E1EBE7] text-xs font-semibold text-[#063B35] flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#00B86B]" />
            <span>
              {isLoading
                ? 'Loading tasks...'
                : `${tasks.filter((t) => t.status !== 'completed').length} Active / ${tasks.length} Total`}
            </span>
          </span>
          <button
            type="button"
            onClick={fetchWorkOrders}
            disabled={isLoading}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-[#F3F7F5] border border-[#E1EBE7] text-[#063B35] hover:bg-[#E1EBE7] transition-colors flex items-center justify-center disabled:opacity-50"
            title="Refresh work orders from database"
            aria-label="Refresh work orders from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00B86B]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Mutation Error Banner */}
      {mutationError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Error on {mutationError.taskId}:</strong> {mutationError.message}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setMutationError(null)}
            className="text-red-700 hover:text-red-900 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E1EBE7] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#617070] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by task ID, title, property, technician, or trade..."
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] text-xs bg-[#F3F7F5] rounded-xl border border-transparent focus:border-[#00B86B] focus:bg-white focus:outline-none transition-all placeholder:text-[#617070]"
          />
        </div>

        {/* Filter Dropdowns: Specialist, Status, Trade */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specialist Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="task-technician-filter" className="text-[11px] font-bold text-[#617070] uppercase shrink-0 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#00B86B]" />
              <span>Specialist:</span>
            </label>
            <select
              id="task-technician-filter"
              value={technicianFilter}
              onChange={(e) => handleTechnicianChange(e.target.value)}
              className="text-xs font-semibold px-3 py-2 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              <option value="all">All Specialists</option>
              <option value="Derrick Miller">Derrick Miller</option>
              <option value="Robert Ramos">Robert Ramos</option>
              <option value="Michael Torres">Michael Torres</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="unassigned">Unassigned Tasks</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="task-status-filter" className="text-[11px] font-bold text-[#617070] uppercase shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#00B86B]" />
              <span>Status:</span>
            </label>
            <select
              id="task-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          {/* Trade Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="task-trade-filter" className="text-[11px] font-bold text-[#617070] uppercase shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#00B86B]" />
              <span>Trade:</span>
            </label>
            <select
              id="task-trade-filter"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer"
            >
              {tradeCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List / Operational Work Order Container */}
      <div className="bg-white rounded-3xl border border-[#E1EBE7] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#00B86B] animate-spin mx-auto" />
            <h3 className="font-bold text-[#063B35]">Loading Work Orders...</h3>
            <p className="text-xs text-[#617070]">Retrieving operational tasks from Supabase.</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-red-800">Unable to Load Work Orders</h3>
              <p className="text-xs text-red-600 max-w-md mx-auto mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchWorkOrders}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="divide-y divide-[#E1EBE7]">
            {filteredTasks.map((t) => {
              const prop = t.propertyId ? propertyMap.get(t.propertyId) : undefined;
              const isOverdue = Boolean(
                t.dueDate && t.status !== 'completed' && t.dueDate < todayStr
              );
              const tradeName = SERVICE_LABELS[t.serviceCategory] || t.serviceCategory;
              const isUpdating = updatingTaskId === t.id;
              const isAssigning = assigningTaskId === t.id;
              const isAdmin = currentUserRole === 'admin';

              return (
                <div key={t.id} className="transition-colors">
                  <div className="p-5 sm:p-6 hover:bg-[#F3F7F5]/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Column: ID, Priority, Title, Scope, Facility & Tech */}
                    <div className="space-y-2 flex-1">
                      {/* Meta Row: Task ID, Priority, Trade, Due Date */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#063B35] bg-[#F3F7F5] px-2.5 py-0.5 rounded-md border border-[#E1EBE7]">
                          {t.id}
                        </span>

                        {/* Priority Badges */}
                        {t.priority === 'critical' && (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wider">
                            <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                            <span>EMERGENCY</span>
                          </span>
                        )}
                        {t.priority === 'high' && (
                          <span className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 tracking-wider">
                            HIGH PRIORITY
                          </span>
                        )}

                        {/* Trade Badge */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35]">
                          {tradeName}
                        </span>

                        {/* Overdue Badge if applicable */}
                        {isOverdue && (
                          <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border bg-red-100 text-red-800 border-red-300 tracking-wider">
                            OVERDUE
                          </span>
                        )}

                        {/* Success notice */}
                        {mutationNotice?.taskId === t.id && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-fade-in">
                            {mutationNotice.message}
                          </span>
                        )}
                      </div>

                      {/* Task Title */}
                      <h3 className="text-sm sm:text-base font-bold text-[#063B35] leading-snug">
                        {t.title}
                      </h3>

                      {/* Task Description if present */}
                      {t.description && (
                        <p className="text-xs text-[#617070] line-clamp-2 max-w-3xl leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      {/* Location, Tech, Due Date Subline */}
                      <div className="flex items-center gap-4 text-xs text-[#617070] flex-wrap pt-1">
                        {/* Property Link */}
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                          {prop ? (
                            <Link
                              to={`/workspace/properties/${prop.id}`}
                              className="font-semibold text-[#063B35] hover:text-[#00B86B] underline flex items-center gap-1"
                              title="View Commercial Property Profile"
                            >
                              <span>{prop.name}</span>
                              <span className="text-[10px] font-mono text-[#617070]">({prop.id})</span>
                            </Link>
                          ) : (
                            <span className="font-semibold text-[#617070] italic">Unassigned Facility</span>
                          )}
                        </div>

                        {/* Assigned Specialist */}
                        {isAdmin ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                            <label
                              htmlFor={`task-assign-tech-${t.id}`}
                              className="text-[10px] font-bold text-[#617070] uppercase shrink-0"
                            >
                              Tech:
                            </label>
                            <div className="relative inline-flex items-center">
                              <select
                                id={`task-assign-tech-${t.id}`}
                                aria-label={`Assign technician for task ${t.id}`}
                                disabled={isAssigning}
                                value={
                                  assignableTechnicians.find(
                                    (at) => at.fullName.toLowerCase() === (t.assignedTechnician || '').toLowerCase()
                                  )?.id || ''
                                }
                                onChange={(e) => handleTechnicianAssignment(t, e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1.5 pr-7 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-white text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] appearance-none shadow-2xs transition-opacity ${
                                  isAssigning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                <option value="">
                                  Unassigned{assignableTechnicians.length === 0 ? ' (No specialists available)' : ''}
                                </option>
                                {assignableTechnicians.map((tech) => (
                                  <option key={tech.id} value={tech.id}>
                                    {tech.fullName}{tech.jobTitle ? ` (${tech.jobTitle})` : ''}
                                  </option>
                                ))}
                              </select>
                              {isAssigning ? (
                                <Loader2 className="w-3.5 h-3.5 text-[#00B86B] absolute right-2 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-[#617070] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                            <span>
                              Tech: <strong className="text-[#063B35] font-semibold">{t.assignedTechnician || 'Unassigned'}</strong>
                            </span>
                          </div>
                        )}

                        {/* Due Date */}
                        {t.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                            <span>
                              Target: <span className="font-mono text-[#063B35] font-semibold">{t.dueDate}</span>
                            </span>
                          </div>
                        )}

                        {/* Completed At Timestamp if closed */}
                        {t.completedAt && (
                          <div className="flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00B86B] shrink-0" />
                            <span>
                              Resolved: <span className="font-mono text-[11px]">{t.completedAt.split('T')[0]}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Interactive Status Controller & Job Notes Toggle */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E1EBE7]">
                      {/* Status Controller */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-[#617070]">
                          Status:
                        </span>
                        <div className="relative">
                          <select
                            value={t.status}
                            aria-label={`Update status for task ${t.id}`}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(t, e.target.value as FacilityTask['status'])}
                            className={`text-xs font-semibold px-3 py-2 pr-8 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-white text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] appearance-none shadow-xs transition-opacity ${
                              isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on-hold">On Hold</option>
                          </select>
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 text-[#00B86B] absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#617070] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          )}
                        </div>
                      </div>

                      {/* Compact Job Notes Button */}
                      <button
                        type="button"
                        onClick={() => toggleJobNotes(t.id)}
                        aria-expanded={expandedTaskId === t.id}
                        aria-label={`Job Notes for ${t.id}${notesCache[t.id] !== undefined ? ` (${notesCache[t.id].length})` : ''}`}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98] ${
                          expandedTaskId === t.id
                            ? 'bg-[#063B35] text-white border-[#063B35]'
                            : 'bg-[#F3F7F5] text-[#063B35] border-[#E1EBE7] hover:bg-[#E1EBE7] hover:border-[#CBDCD5]'
                        }`}
                      >
                        <MessageSquare className={`w-3.5 h-3.5 ${expandedTaskId === t.id ? 'text-[#00B86B]' : 'text-[#00B86B]'}`} />
                        <span>Job Notes</span>
                        {notesCache[t.id] !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              expandedTaskId === t.id
                                ? 'bg-white/20 text-white'
                                : 'bg-[#063B35]/10 text-[#063B35]'
                            }`}
                          >
                            {notesCache[t.id].length}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            expandedTaskId === t.id ? 'rotate-180 text-white' : 'text-[#617070]'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Inline Expandable Accordion: Job Notes Panel */}
                  {expandedTaskId === t.id && (
                    <div className="border-t border-[#E1EBE7] bg-[#FAFDFB] p-5 sm:p-7 space-y-5 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-[#E1EBE7] pb-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#00B86B]" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#063B35]">
                            Job Notes &amp; Field History
                          </h4>
                          <span className="font-mono text-[11px] text-[#617070]">
                            ({t.id})
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-[#617070]">
                          {notesCache[t.id]?.length || 0} {notesCache[t.id]?.length === 1 ? 'note' : 'notes'}
                        </span>
                      </div>

                      {/* Timeline List / Loading / Error States */}
                      {loadingNotes[t.id] ? (
                        <div className="py-8 text-center space-y-2">
                          <Loader2 className="w-5 h-5 text-[#00B86B] animate-spin mx-auto" />
                          <p className="text-xs font-semibold text-[#063B35]">Loading job notes...</p>
                        </div>
                      ) : notesError[t.id] ? (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>
                              <strong>Unable to load job notes:</strong> {notesError[t.id]}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => loadNotes(t.id, true)}
                            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold transition-colors cursor-pointer"
                          >
                            Retry
                          </button>
                        </div>
                      ) : notesCache[t.id] && notesCache[t.id].length > 0 ? (
                        <div className="space-y-3">
                          {notesCache[t.id].map((note) => (
                            <div
                              key={note.id}
                              className="p-4 rounded-2xl bg-white border border-[#E1EBE7] shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-[#063B35]">
                                    {note.authorName}
                                  </span>
                                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border tracking-wider ${
                                    note.authorRole?.toLowerCase() === 'admin'
                                      ? 'bg-[#063B35]/10 text-[#063B35] border-[#063B35]/20'
                                      : 'bg-[#00B86B]/15 text-[#063B35] border-[#00B86B]/30'
                                  }`}>
                                    {formatRoleLabel(note.authorRole)}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#617070] font-mono">
                                  {formatNoteTimestamp(note.createdAt)}
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-[#102A2A] whitespace-pre-wrap leading-relaxed">
                                {note.body}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 px-4 text-center rounded-2xl bg-[#F3F7F5] border border-dashed border-[#CBDCD5] space-y-1">
                          <p className="text-xs font-bold text-[#063B35]">No job notes yet.</p>
                          <p className="text-[11px] text-[#617070]">
                            Document field observations, client communications, parts required, or reason for delay below.
                          </p>
                        </div>
                      )}

                      {/* Add Job Note Composer */}
                      <div className="space-y-3 pt-3 border-t border-[#E1EBE7]">
                        {noteSubmitError[t.id] && (
                          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>
                                <strong>Error:</strong> {noteSubmitError[t.id]}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNoteSubmitError((prev) => ({ ...prev, [t.id]: null }))}
                              className="text-red-700 hover:text-red-900 font-bold px-1"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}

                        {noteSubmitNotice[t.id] && (
                          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs animate-fade-in">
                            <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0" />
                            <span>{noteSubmitNotice[t.id]}</span>
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor={`job-note-textarea-${t.id}`}
                            className="block text-[11px] font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                          >
                            Add Job Note
                          </label>
                          <textarea
                            id={`job-note-textarea-${t.id}`}
                            rows={3}
                            value={newNoteBody[t.id] || ''}
                            onChange={(e) => {
                              setNewNoteBody((prev) => ({ ...prev, [t.id]: e.target.value }));
                              if (noteSubmitError[t.id]) {
                                setNoteSubmitError((prev) => ({ ...prev, [t.id]: null }));
                              }
                            }}
                            placeholder="Record diagnostic findings, client communications, parts required, or reason for delay..."
                            disabled={submittingNotes[t.id]}
                            className="w-full p-3.5 text-xs sm:text-sm bg-white rounded-xl border border-[#CBDCD5] focus:border-[#00B86B] focus:ring-2 focus:ring-[#00B86B]/20 focus:outline-none transition-all placeholder:text-[#617070] text-[#063B35] leading-relaxed resize-y"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <p className="text-[11px] text-[#617070]">
                            Chronological &amp; append-only. Attribution is recorded from your active session.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleAddNote(t.id)}
                            disabled={submittingNotes[t.id] || !newNoteBody[t.id]?.trim()}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-[#063B35] hover:bg-[#042925] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer self-start sm:self-auto"
                          >
                            {submittingNotes[t.id] ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00B86B]" />
                                <span>Adding Note...</span>
                              </>
                            ) : (
                              <span>Add Job Note</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F7F5] flex items-center justify-center mx-auto text-[#617070]">
              <CheckSquare className="w-6 h-6 text-[#617070]/60" />
            </div>
            <h3 className="font-bold text-[#063B35]">No Work Order Tasks Found</h3>
            <p className="text-xs text-[#617070] max-w-sm mx-auto">
              No tasks matched your search query &ldquo;{searchTerm}&rdquo; or the selected specialist, status, and trade filters.
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 min-h-[44px] rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors cursor-pointer"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
