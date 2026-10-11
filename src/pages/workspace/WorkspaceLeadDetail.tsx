import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  UserCheck, 
  FileText,
  Save,
  Check,
  AlertTriangle,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { getLeadById, updateLead } from '../../services/leadsService';
import { getProperties } from '../../services/propertiesService';
import { getWorkOrdersByLeadId } from '../../services/workOrdersService';
import { CRMLead, CommercialProperty, FacilityTask } from '../../types';

// Standard humanized mapping for facility disciplines
const SERVICE_NAMES: Record<string, string> = {
  'commercial-hvac': 'Commercial HVAC',
  'electrical': 'Commercial Electrical',
  'plumbing': 'Commercial Plumbing',
  'preventive-maintenance': 'Preventive Maintenance',
  'general-maintenance': 'Facility Operations & Maintenance',
  'emergency-services': 'Emergency Facility Response'
};

const formatServiceName = (id: string): string => {
  if (SERVICE_NAMES[id]) return SERVICE_NAMES[id];
  return id.replace(/-/g, ' ');
};

export const WorkspaceLeadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<CRMLead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPropertyUpdating, setIsPropertyUpdating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [status, setStatus] = useState<CRMLead['status']>('new');
  const [priority, setPriority] = useState<NonNullable<CRMLead['priority']>>('standard');
  const [technician, setTechnician] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [propertyId, setPropertyId] = useState<string>('');
  const [properties, setProperties] = useState<CommercialProperty[]>([]);
  const [tasks, setTasks] = useState<FacilityTask[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);

  const fetchProperties = async () => {
    const { data, error: propErr } = await getProperties();
    if (propErr) {
      console.error('Error loading commercial properties in WorkspaceLeadDetail:', propErr.message);
      setProperties([]);
    } else {
      setProperties(data || []);
    }
  };

  const fetchLead = async (leadId: string) => {
    setIsLoading(true);
    setError(null);
    setMutationError(null);
    const { data, error: err } = await getLeadById(leadId);
    if (err) {
      setError(err.message || 'Unable to load service lead.');
      setLead(null);
    } else if (data) {
      setLead(data);
      setStatus(data.status);
      setPriority(data.priority || (data.serviceNeeded === 'emergency-services' ? 'critical' : 'standard'));
      setTechnician(data.assignedTechnician || '');
      setEstimatedValue(data.estimatedValue || '');
      setPropertyId(data.propertyId || '');
      const { data: leadTasks } = await getWorkOrdersByLeadId(data.id);
      setTasks(leadTasks || []);
    } else {
      setLead(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
  }, [id]);

  useEffect(() => {
    const handleTasksUpdate = async () => {
      if (id) {
        const { data: leadTasks } = await getWorkOrdersByLeadId(id);
        setTasks(leadTasks || []);
      }
    };

    window.addEventListener('northstar_tasks_updated', handleTasksUpdate);

    return () => {
      window.removeEventListener('northstar_tasks_updated', handleTasksUpdate);
    };
  }, [id]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lead || isSaving) return;
    setIsSaving(true);
    setMutationError(null);
    setSavedNotice(false);

    try {
      const updates = {
        status,
        priority,
        assignedTechnician: technician.trim(),
        estimatedValue: estimatedValue.trim(),
        propertyId: propertyId ? propertyId.trim() : null,
      };

      const { data: updatedLead, error: updateErr } = await updateLead(lead.id, updates);

      if (updateErr) {
        setMutationError(updateErr.message || 'Failed to update lead record.');
      } else if (updatedLead) {
        setLead(updatedLead);
        setStatus(updatedLead.status);
        setPriority(updatedLead.priority || 'standard');
        setTechnician(updatedLead.assignedTechnician || '');
        setEstimatedValue(updatedLead.estimatedValue || '');
        setPropertyId(updatedLead.propertyId || '');
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMutationError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePropertyChange = async (newPropertyId: string) => {
    if (!lead || isPropertyUpdating || isSaving) return;
    const previousPropertyId = propertyId;
    setPropertyId(newPropertyId);
    setIsPropertyUpdating(true);
    setMutationError(null);

    try {
      const { data: updatedLead, error: updateErr } = await updateLead(lead.id, {
        propertyId: newPropertyId ? newPropertyId.trim() : null,
      });

      if (updateErr) {
        setPropertyId(previousPropertyId);
        setMutationError(updateErr.message || 'Failed to link commercial property.');
      } else if (updatedLead) {
        setLead(updatedLead);
        setPropertyId(updatedLead.propertyId || '');
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    } catch (err) {
      setPropertyId(previousPropertyId);
      const msg = err instanceof Error ? err.message : String(err);
      setMutationError(msg);
    } finally {
      setIsPropertyUpdating(false);
    }
  };

  // Loading state placeholder skeleton
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-[#E1EBE7] rounded w-28"></div>
          <div className="h-10 bg-[#E1EBE7] rounded-full w-44"></div>
        </div>
        <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 space-y-6">
          <div className="space-y-3 border-b border-[#E1EBE7] pb-6">
            <div className="h-6 bg-[#F3F7F5] rounded w-32"></div>
            <div className="h-8 bg-[#F3F7F5] rounded w-80"></div>
            <div className="h-4 bg-[#F3F7F5] rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-[#F3F7F5] rounded-2xl"></div>
            <div className="h-40 bg-[#F3F7F5] rounded-2xl"></div>
          </div>
          <div className="h-32 bg-[#F3F7F5] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Error state card
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-lg">
          !
        </div>
        <h2 className="text-xl font-bold text-[#063B35]">Unable to Load Lead Record</h2>
        <p className="text-xs text-[#617070] max-w-md mx-auto">
          {error} Please check your connection and try again.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (id) {
                fetchLead(id);
                fetchProperties();
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#063B35] text-white text-xs font-semibold hover:bg-[#042925] transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <Link
            to="/workspace/leads"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7] text-xs font-bold hover:bg-[#E1EBE7] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Leads</span>
          </Link>
        </div>
      </div>
    );
  }

  // Not found fallback
  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-[#617070] mx-auto flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#063B35]">Lead Record Not Found</h2>
        <p className="text-sm text-[#617070]">
          Lead record <span className="font-mono font-bold text-[#063B35]">{id}</span> does not exist or has been removed.
        </p>
        <div className="pt-2">
          <Link
            to="/workspace/leads"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Leads</span>
          </Link>
        </div>
      </div>
    );
  }

  // Determine current display urgency
  const isEmergency = priority === 'critical' || lead.serviceNeeded === 'emergency-services';
  const isHighPriority = priority === 'high' && !isEmergency;

  const statusColors: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    assessing: 'bg-amber-100 text-amber-800 border-amber-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    dispatched: 'bg-purple-100 text-purple-800 border-purple-200',
    closed: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const isTechnicianAssigned = Boolean(technician && technician.trim() && technician.trim().toLowerCase() !== 'unassigned');
  const linkedProperty = properties.find((p) => p.id === propertyId);
  const leadTask = tasks.length > 0 ? tasks[0] : undefined;
  const getTaskStatusLabel = (taskStatus: FacilityTask['status']) => {
    switch (taskStatus) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const workflowSteps = [
    { title: '1. Website Inquiry', done: true, stage: 'Submitted via public portal' },
    { title: '2. CRM Lead', done: true, stage: 'Triaged in Operations Desk' },
    { 
      title: '3. Property Linked', 
      done: Boolean(linkedProperty), 
      stage: linkedProperty ? `Linked to ${linkedProperty.name}` : 'Pending module link' 
    },
    { title: '4. Trade Assignment', done: isTechnicianAssigned, stage: isTechnicianAssigned ? 'Specialist allocated' : 'Pending specialist' },
    { 
      title: '5. Work Order Task', 
      done: Boolean(leadTask), 
      stage: leadTask 
        ? `Task ${leadTask.id} — ${getTaskStatusLabel(leadTask.status)}` 
        : 'Pending task dispatch' 
    },
    { title: '6. Completion Signoff', done: status === 'closed', stage: status === 'closed' ? 'Resolved & documented' : 'Pending resolution' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/workspace/leads"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#617070] hover:text-[#063B35] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-[#00B86B]" />
          <span>Back to All Leads</span>
        </Link>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-xs text-[#00B86B] font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
              <Check className="w-4 h-4 text-[#00B86B]" />
              <span>Record saved successfully</span>
            </span>
          )}
          <button
            type="button"
            disabled={isSaving || isPropertyUpdating}
            onClick={() => handleSave()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#063B35] hover:bg-[#042925] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors shadow-sm min-h-[44px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 text-[#00C875] animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#00C875]" />
                <span>Save Operational Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mutation Error Notification */}
      {mutationError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{mutationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setMutationError(null)}
            className="text-red-700 hover:text-red-900 font-bold px-2 py-1 min-h-[32px] text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Emergency Callout Banner (when critical / emergency) */}
      {isEmergency && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-[#063B35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>URGENT FACILITY NEED</span>
            </div>
            <p className="text-xs sm:text-sm text-[#102A2A] leading-relaxed max-w-xl">
              Priority coordination required for this commercial facility request. Direct phone dispatch line is available for immediate operational triage.
            </p>
          </div>
          <a
            href="tel:5125550190"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold transition-colors shadow-xs min-h-[44px]"
          >
            <Phone className="w-3.5 h-3.5 text-white" />
            <span>Call Austin Dispatch: (512) 555-0190</span>
          </a>
        </div>
      )}

      {/* Main Lead Header Card */}
      <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Header Row: Identity & Status/Priority Controls */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-[#E1EBE7] pb-6">
          
          {/* Identity */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-extrabold text-[#063B35] bg-[#F3F7F5] px-2.5 py-1 rounded-md border border-[#E1EBE7]">
                {lead.id}
              </span>

              {/* Dynamic Urgency / Priority Badges */}
              {isEmergency && (
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wider">
                  EMERGENCY
                </span>
              )}
              {isHighPriority && (
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 tracking-wider">
                  HIGH PRIORITY
                </span>
              )}

              {/* Status Badge */}
              <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                {status}
              </span>

              <span className="text-xs text-[#617070] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#617070]/70" />
                <span>Received {lead.createdAt}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
              {lead.company}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#617070]">
              <span className="font-semibold text-[#102A2A]">Contact: {lead.name}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[#063B35] font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#00B86B]" />
                {lead.propertyType}
              </span>
            </div>
          </div>

          {/* Operational Controls: Status & Priority Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            
            {/* Priority Control */}
            <div className="w-full sm:w-auto">
              <label 
                htmlFor="operational-priority"
                className="text-[10px] font-bold uppercase tracking-wider text-[#617070] block mb-1"
              >
                Operational Priority
              </label>
              <select
                id="operational-priority"
                value={priority}
                disabled={isSaving}
                onChange={(e) => setPriority(e.target.value as NonNullable<CRMLead['priority']>)}
                className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer disabled:opacity-60"
              >
                <option value="standard">Standard Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical / Emergency</option>
              </select>
            </div>

            {/* Workflow Status Control */}
            <div className="w-full sm:w-auto">
              <label 
                htmlFor="operational-status"
                className="text-[10px] font-bold uppercase tracking-wider text-[#617070] block mb-1"
              >
                Workflow Status
              </label>
              <select
                id="operational-status"
                value={status}
                disabled={isSaving}
                onChange={(e) => setStatus(e.target.value as CRMLead['status'])}
                className="w-full text-xs font-bold px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-[#F3F7F5] text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer disabled:opacity-60"
              >
                <option value="new">New Inquiry</option>
                <option value="assessing">Assessing Property</option>
                <option value="scheduled">Work Scheduled</option>
                <option value="dispatched">Dispatched On-Site</option>
                <option value="closed">Completed / Closed</option>
              </select>
            </div>

          </div>

        </div>

        {/* Lifecycle Progression Bar */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#063B35]">
            <span>Northstar Operating Workflow Progression</span>
            <span className="text-[#00B86B] font-mono">Stage: {status.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {workflowSteps.map((step, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border text-center transition-colors ${
                  step.done 
                    ? 'bg-[#00B86B]/15 border-[#00B86B]/40 text-[#063B35]' 
                    : 'bg-[#F3F7F5] border-[#E1EBE7] text-[#617070]'
                }`}
              >
                <p className="text-[10px] font-bold leading-tight uppercase">{step.title}</p>
                <p className="text-[9px] mt-0.5 opacity-80 truncate">{step.stage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Operational Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          
          {/* Section 1: Property / Facility Information */}
          <div className="p-5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-3.5 text-xs">
            <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#00B86B]" />
              <span>Commercial Property &amp; Facility</span>
            </h3>
            <div className="space-y-2 text-[#102A2A]">
              <div className="flex justify-between border-b border-[#E1EBE7] pb-1.5">
                <span className="text-[#617070]">Account / Property:</span>
                <span className="font-bold text-[#063B35] text-right">{lead.company}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1EBE7] pb-1.5">
                <span className="text-[#617070]">Environment:</span>
                <span className="font-semibold text-[#063B35]">{lead.propertyType}</span>
              </div>
              <div className="flex justify-between border-b border-[#E1EBE7] pb-1.5">
                <span className="text-[#617070]">Location / Address:</span>
                <span className="font-semibold text-[#063B35] text-right max-w-[240px] truncate" title={lead.propertyAddress}>
                  {lead.propertyAddress}
                </span>
              </div>
              {lead.facilitySquareFootage && (
                <div className="flex justify-between border-b border-[#E1EBE7] pb-1.5">
                  <span className="text-[#617070]">Facility Area:</span>
                  <span className="font-semibold text-[#063B35]">{lead.facilitySquareFootage}</span>
                </div>
              )}

              {/* Linked Property Operational Section */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#617070] font-medium">Linked Property:</span>
                  {linkedProperty ? (
                    <Link
                      to={`/workspace/properties/${linkedProperty.id}`}
                      className="font-bold text-[#063B35] hover:text-[#00B86B] underline flex items-center gap-1 group"
                      title="View Commercial Property Record"
                    >
                      <span>{linkedProperty.name}</span>
                      <span className="font-mono text-[10px] text-[#00B86B] font-bold">({linkedProperty.id})</span>
                      <ArrowRight className="w-3 h-3 text-[#00B86B] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#617070] italic">Not Linked</span>
                  )}
                </div>

                {/* Property Linking Selector */}
                <div className="pt-1">
                  <label htmlFor="lead-property-selector" className="text-[10px] uppercase font-bold text-[#617070] block mb-1">
                    {isPropertyUpdating ? 'Updating Linked Facility...' : (linkedProperty ? 'Change Linked Facility:' : 'Link to Commercial Facility:')}
                  </label>
                  <select
                    id="lead-property-selector"
                    disabled={isPropertyUpdating || isSaving}
                    value={propertyId}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 min-h-[44px] rounded-xl border border-[#E1EBE7] bg-white text-[#063B35] focus:outline-none focus:ring-2 focus:ring-[#00B86B] cursor-pointer disabled:opacity-60"
                  >
                    <option value="">-- Select Commercial Property --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) · {p.propertyType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Requester / Customer Communication */}
          <div className="p-5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-3.5 text-xs">
            <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#00B86B]" />
              <span>Contact &amp; Customer Communications</span>
            </h3>
            <div className="space-y-2 text-[#102A2A]">
              <div className="flex justify-between border-b border-[#E1EBE7] pb-1.5">
                <span className="text-[#617070]">Contact Name:</span>
                <span className="font-bold text-[#063B35]">{lead.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#E1EBE7] pb-1.5">
                <span className="text-[#617070]">Direct Phone:</span>
                <a 
                  href={`tel:${lead.phone}`} 
                  className="font-semibold text-[#063B35] hover:text-[#00B86B] underline flex items-center gap-1 min-h-[32px]"
                >
                  <Phone className="w-3 h-3 text-[#00B86B]" />
                  <span>{lead.phone}</span>
                </a>
              </div>
              <div className="flex justify-between items-center border-b border-[#E1EBE7] pb-1.5">
                <span className="text-[#617070]">Work Email:</span>
                <a 
                  href={`mailto:${lead.email}`} 
                  className="font-semibold text-[#063B35] hover:text-[#00B86B] underline flex items-center gap-1 min-h-[32px] max-w-[220px] truncate"
                  title={lead.email}
                >
                  <Mail className="w-3 h-3 text-[#00B86B]" />
                  <span className="truncate">{lead.email}</span>
                </a>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-[#617070]">Preferred Response:</span>
                <span className="font-bold uppercase text-[#00B86B]">{lead.preferredContactMethod}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Section 3: Service Request & Scope */}
        <div className="p-5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E1EBE7] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#063B35] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#00B86B]" />
              <span>Primary Service Discipline &amp; Scope</span>
            </h3>
            <span className="text-xs font-bold text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-1 rounded-md border border-[#00B86B]/20 w-fit">
              Discipline: {formatServiceName(lead.serviceNeeded)}
            </span>
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#617070] block">
              Reported Symptoms &amp; Work Description
            </span>
            <div className="bg-white p-4 rounded-xl border border-[#E1EBE7] text-xs sm:text-sm text-[#102A2A] leading-relaxed">
              "{lead.message || 'No additional scope details provided in website inquiry submission.'}"
            </div>
          </div>
        </div>

        {/* Section 4: Operational Assignment & Estimated Value */}
        <div className="p-6 rounded-2xl bg-[#063B35] text-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00C875] flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>Internal Operations &amp; Commercial Valuation</span>
            </h3>
            <span className="text-[11px] text-white/60">
              Austin Operations Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Assigned Specialist Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="assigned-specialist"
                className="text-xs font-bold uppercase tracking-wider text-white/90 block"
              >
                Assigned Specialist / Crew
              </label>
              <input
                id="assigned-specialist"
                type="text"
                disabled={isSaving}
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="e.g. Derrick Miller (HVAC Lead)"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00B86B] disabled:opacity-60"
              />
              <span className="text-[10px] text-white/50 block">
                Current status: {technician.trim() ? technician : 'Unassigned'}
              </span>
            </div>

            {/* Estimated Commercial Value Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="estimated-value"
                className="text-xs font-bold uppercase tracking-wider text-white/90 block"
              >
                Estimated Value / Proposed Scope
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#00C875]" />
                <input
                  id="estimated-value"
                  type="text"
                  disabled={isSaving}
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="e.g. $8,500 or Pending"
                  className="w-full pl-9 pr-3.5 py-2.5 min-h-[44px] rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00B86B] disabled:opacity-60"
                />
              </div>
              <span className="text-[10px] text-white/50 block">
                Reflected across CRM Leads and Pipeline valuation
              </span>
            </div>

          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <span className="text-[11px] text-white/70">
              Changes update connected Workspace Leads, Pipeline, and Dashboard counts in real-time.
            </span>
            <button
              type="button"
              disabled={isSaving || isPropertyUpdating}
              onClick={() => handleSave()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00B86B] text-[#063B35] text-xs font-bold hover:bg-[#00C875] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm min-h-[44px] shrink-0 inline-flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#063B35] animate-spin" />
                  <span>Updating Record...</span>
                </>
              ) : (
                <span>Update Lead Record</span>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
