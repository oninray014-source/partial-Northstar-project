import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Wrench, 
  ArrowLeft, 
  Inbox, 
  Phone, 
  Mail, 
  User, 
  AlertTriangle, 
  CheckSquare,
  RefreshCw
} from 'lucide-react';
import { getPropertyById } from '../../services/propertiesService';
import { getLeads } from '../../services/leadsService';
import { getWorkOrdersByPropertyId, getCurrentUserRole } from '../../services/workOrdersService';
import { CommercialProperty, CRMLead, FacilityTask } from '../../types';

const SERVICE_LABELS: Record<string, string> = {
  'commercial-hvac': 'Commercial HVAC',
  'electrical': 'Commercial Electrical',
  'plumbing': 'Commercial Plumbing',
  'preventive-maintenance': 'Preventive Maintenance',
  'general-maintenance': 'General Maintenance',
  'emergency-services': 'Emergency Services'
};

export const WorkspacePropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<CommercialProperty | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [tasks, setTasks] = useState<FacilityTask[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'technician' | 'anon'>('technician');

  const fetchPropertyData = useCallback(async () => {
    if (!id) {
      setProperty(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // 1. Resolve current user role
      const { role: resolvedRole } = await getCurrentUserRole();
      setUserRole(resolvedRole);

      // 2. Concurrently fetch property details and work orders from Supabase
      const [propRes, tasksRes] = await Promise.all([
        getPropertyById(id),
        getWorkOrdersByPropertyId(id)
      ]);

      if (propRes.error) {
        setError(propRes.error.message || 'Unable to load property details.');
        setProperty(null);
        setIsLoading(false);
        return;
      }

      setProperty(propRes.data);
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
        // Technicians are strictly prohibited by PostgreSQL RLS from querying public.leads
        setLeads([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Unable to load property details.');
      setProperty(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchWorkOrders = useCallback(async (propertyId: string) => {
    const { data } = await getWorkOrdersByPropertyId(propertyId);
    setTasks(data || []);
  }, []);

  useEffect(() => {
    fetchPropertyData();
  }, [fetchPropertyData]);

  useEffect(() => {
    const handleLeadsUpdate = async () => {
      if (userRole === 'admin') {
        const { data: leadsData, error: leadsErr } = await getLeads();
        if (!leadsErr && leadsData) {
          setLeads(leadsData);
        }
      }
    };

    const handleTasksUpdate = () => {
      if (id) {
        fetchWorkOrders(id);
      }
    };

    window.addEventListener('northstar_leads_updated', handleLeadsUpdate);
    window.addEventListener('northstar_tasks_updated', handleTasksUpdate);

    return () => {
      window.removeEventListener('northstar_leads_updated', handleLeadsUpdate);
      window.removeEventListener('northstar_tasks_updated', handleTasksUpdate);
    };
  }, [id, userRole, fetchWorkOrders]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-[#F3F7F5] rounded-full w-48"></div>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1EBE7] space-y-4">
          <div className="flex gap-2">
            <div className="h-5 bg-[#F3F7F5] rounded w-20"></div>
            <div className="h-5 bg-[#F3F7F5] rounded-full w-28"></div>
            <div className="h-5 bg-[#F3F7F5] rounded-full w-24"></div>
          </div>
          <div className="h-8 bg-[#F3F7F5] rounded-md w-3/5"></div>
          <div className="h-4 bg-[#F3F7F5] rounded w-2/5"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E1EBE7] h-52 space-y-3">
            <div className="h-5 bg-[#F3F7F5] rounded w-32"></div>
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-[#F3F7F5] rounded w-full"></div>
              <div className="h-4 bg-[#F3F7F5] rounded w-3/4"></div>
              <div className="h-4 bg-[#F3F7F5] rounded w-2/3"></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-[#E1EBE7] h-52 space-y-3">
            <div className="h-5 bg-[#F3F7F5] rounded w-44"></div>
            <div className="space-y-2 pt-2">
              <div className="h-8 bg-[#F3F7F5] rounded-xl w-full"></div>
              <div className="h-8 bg-[#F3F7F5] rounded-xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center font-bold text-sm">
          !
        </div>
        <h2 className="text-xl font-bold text-[#063B35]">Unable to Load Property Details</h2>
        <p className="text-sm text-[#617070]">
          {error}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={fetchPropertyData}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <Link
            to="/workspace/properties"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#F3F7F5] border border-[#E1EBE7] text-[#063B35] text-xs font-bold hover:bg-white transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Properties</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-[#617070] mx-auto flex items-center justify-center">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#063B35]">Commercial Property Not Found</h2>
        <p className="text-sm text-[#617070]">
          Property record <span className="font-mono font-bold text-[#063B35]">{id}</span> does not exist or is not registered in active care.
        </p>
        <div className="pt-2">
          <Link
            to="/workspace/properties"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Properties</span>
          </Link>
        </div>
      </div>
    );
  }

  // Linked service inquiries/leads from Supabase (Admin role only)
  const linkedLeads =
    userRole === 'admin' && property
      ? leads.filter((l) => l.propertyId === property.id)
      : [];

  const activeLeads = linkedLeads.filter((l) => l.status !== 'closed');

  const getStatusBadge = (status: CommercialProperty['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            Active Care
          </span>
        );
      case 'under-assessment':
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            Under Assessment
          </span>
        );
      case 'inactive':
        return (
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            Inactive
          </span>
        );
    }
  };

  const statusColors: Record<string, string> = {
    new: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    assessing: 'bg-amber-100 text-amber-800 border-amber-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    dispatched: 'bg-purple-100 text-purple-800 border-purple-200',
    closed: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const getTaskStatusBadge = (taskStatus: FacilityTask['status']) => {
    switch (taskStatus) {
      case 'in-progress':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider whitespace-nowrap">
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider whitespace-nowrap">
            Completed
          </span>
        );
      case 'on-hold':
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider whitespace-nowrap">
            On Hold
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider whitespace-nowrap">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Contextual Breadcrumb Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/workspace/properties"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#617070] hover:text-[#063B35] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-[#00B86B]" />
          <span>Back to Properties Under Care</span>
        </Link>
      </div>

      {/* Header Profile */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-extrabold text-[#063B35] bg-[#F3F7F5] px-2.5 py-1 rounded-md border border-[#E1EBE7]">
                {property.id}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7]">
                {property.propertyType}
              </span>
              {getStatusBadge(property.status)}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
              {property.name}
            </h1>
            <p className="text-sm font-semibold text-[#617070]">
              Client / Account: <span className="text-[#063B35]">{property.clientCompany}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-[#617070]">Open Service Requests</div>
              <div className="text-2xl font-extrabold text-[#063B35]">
                {userRole === 'admin' ? activeLeads.length : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Facility Profile & Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Facility Profile */}
        <div className="bg-white p-6 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-[#00B86B]" />
            <span>Facility Profile</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
              <span className="text-[#617070]">Physical Address:</span>
              <span className="font-semibold text-[#063B35] text-right max-w-[260px]">
                {property.address}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
              <span className="text-[#617070]">Floor Area:</span>
              <span className="font-bold text-[#063B35]">{property.squareFootage}</span>
            </div>
            <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
              <span className="text-[#617070]">PM Service Frequency:</span>
              <span className="font-semibold text-[#063B35]">{property.pmCycle || 'Quarterly'}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#617070]">Onboarded Date:</span>
              <span className="font-mono text-[#617070]">{property.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Facility Mechanical Equipment */}
        <div className="bg-white p-6 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2 text-sm">
            <Wrench className="w-4 h-4 text-[#00B86B]" />
            <span>Mechanical Equipment Tags</span>
          </h3>

          <div className="space-y-2 pt-1">
            <p className="text-[#617070]">
              Identified physical assets and primary HVAC/plumbing equipment under Northstar facility maintenance:
            </p>
            <div className="space-y-2 pt-2">
              {property.equipmentTags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7] text-[#063B35] font-semibold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00B86B]" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Contact (if exists) */}
      {property.primaryContact && (
        <div className="bg-white p-6 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-[#00B86B]" />
            <span>Primary Property / Account Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 bg-[#F3F7F5] rounded-xl border border-[#E1EBE7]">
              <div className="text-[#617070] text-[11px]">Contact Name</div>
              <div className="font-bold text-[#063B35] text-sm mt-0.5">{property.primaryContact.name}</div>
            </div>
            <div className="p-3 bg-[#F3F7F5] rounded-xl border border-[#E1EBE7]">
              <div className="text-[#617070] text-[11px]">Direct Phone</div>
              <a
                href={`tel:${property.primaryContact.phone}`}
                className="font-semibold text-[#063B35] hover:text-[#00B86B] underline flex items-center gap-1.5 mt-0.5 min-h-[32px]"
              >
                <Phone className="w-3.5 h-3.5 text-[#00B86B]" />
                <span>{property.primaryContact.phone}</span>
              </a>
            </div>
            <div className="p-3 bg-[#F3F7F5] rounded-xl border border-[#E1EBE7]">
              <div className="text-[#617070] text-[11px]">Work Email</div>
              <a
                href={`mailto:${property.primaryContact.email}`}
                className="font-semibold text-[#063B35] hover:text-[#00B86B] underline flex items-center gap-1.5 mt-0.5 min-h-[32px] truncate"
                title={property.primaryContact.email}
              >
                <Mail className="w-3.5 h-3.5 text-[#00B86B]" />
                <span className="truncate">{property.primaryContact.email}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Active Work Orders Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE7]">
          <div>
            <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2 text-sm">
              <CheckSquare className="w-4 h-4 text-[#00B86B]" />
              <span>Active Work Orders</span>
            </h3>
            <p className="text-xs text-[#617070]">
              Operational tasks and maintenance work orders assigned to {property.name}.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7]">
            {tasks.length} {tasks.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3 pt-2">
            {tasks.map((task) => {
              const tradeName = SERVICE_LABELS[task.serviceCategory] || task.serviceCategory;
              return (
                <Link
                  key={task.id}
                  to="/workspace/tasks"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3F7F5] hover:bg-[#EBF3F0] border border-[#E1EBE7] hover:border-[#00B86B]/60 transition-all text-xs group focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#063B35] bg-white px-2 py-0.5 rounded border border-[#E1EBE7]">
                        {task.id}
                      </span>
                      {getTaskStatusBadge(task.status)}
                      {task.priority === 'critical' && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wider">
                          <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                          <span>EMERGENCY</span>
                        </span>
                      )}
                      {task.priority === 'high' && (
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 tracking-wider">
                          HIGH PRIORITY
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00B86B]/15 text-[#063B35]">
                        {tradeName}
                      </span>
                    </div>

                    <div className="font-bold text-[#063B35] group-hover:text-[#00B86B] transition-colors text-sm">
                      {task.title}
                    </div>

                    {task.description && (
                      <p className="text-[#617070] line-clamp-1 max-w-xl">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-[#617070] shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E1EBE7]">
                    <div className="flex items-center gap-1 font-semibold text-[#063B35]">
                      <User className="w-3.5 h-3.5 text-[#00B86B]" />
                      <span>{task.assignedTechnician || 'Unassigned'}</span>
                    </div>
                    {task.dueDate && (
                      <span className="text-[11px] font-mono">Due: {task.dueDate}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2 text-[#617070] text-xs">
            <p>No active work orders for this facility.</p>
          </div>
        )}
      </div>

      {/* Linked Service Requests / CRM Leads (Supabase leads - Admin role only) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E1EBE7] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE7]">
          <div>
            <h3 className="font-bold text-[#063B35] uppercase tracking-wider flex items-center gap-2 text-sm">
              <Inbox className="w-4 h-4 text-[#00B86B]" />
              <span>Linked Service Requests &amp; CRM Leads</span>
            </h3>
            <p className="text-xs text-[#617070]">
              Operational tickets and work requests associated with {property.name}.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F3F7F5] text-[#063B35] border border-[#E1EBE7]">
            {userRole === 'admin' ? `${linkedLeads.length} ${linkedLeads.length === 1 ? 'Record' : 'Records'}` : 'Admin Only'}
          </span>
        </div>

        {userRole === 'admin' ? (
          linkedLeads.length > 0 ? (
            <div className="space-y-3 pt-2">
              {linkedLeads.map((lead) => {
                const isEmergency = lead.priority === 'critical' || lead.serviceNeeded === 'emergency-services';
                const isHigh = lead.priority === 'high' && !isEmergency;
                const serviceName = lead.serviceNeeded ? lead.serviceNeeded.replace(/-/g, ' ') : '';

                return (
                  <Link
                    key={lead.id}
                    to={`/workspace/leads/${lead.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F3F7F5] hover:bg-[#EBF3F0] border border-[#E1EBE7] hover:border-[#00B86B]/60 transition-all text-xs group focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#00B86B]">{lead.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusColors[lead.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {lead.status}
                        </span>
                        {isEmergency && (
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
                      <div className="font-bold text-[#063B35] group-hover:text-[#00B86B] transition-colors capitalize text-sm">
                        {serviceName}
                      </div>
                      <p className="text-[#617070] line-clamp-1 max-w-xl">
                        {lead.message || lead.propertyAddress}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-[#617070] shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E1EBE7]">
                      <span className="font-semibold text-[#063B35]">
                        {lead.assignedTechnician ? lead.assignedTechnician.split('(')[0].trim() : 'Unassigned'}
                      </span>
                      <span className="text-[11px]">{lead.createdAt.split(' ')[0]}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-[#617070] text-xs">
              <p>No service requests currently linked to this commercial property.</p>
              <p className="text-[11px]">
                Use Lead Detail to link incoming facility inquiries to this property record.
              </p>
            </div>
          )
        ) : (
          <div className="py-8 text-center space-y-2 text-[#617070] text-xs">
            <p>Service inquiries and CRM leads are restricted to Administrative roles.</p>
            <p className="text-[11px]">
              Field technicians can review assigned operational tasks in the Active Work Orders section above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
