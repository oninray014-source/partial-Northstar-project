import { supabase } from '../lib/supabaseClient';
import { FacilityTask, ServiceCategory, WorkOrderJobNote, AssignableTechnician } from '../types';

export type { WorkOrderJobNote, AssignableTechnician };

export interface SupabaseWorkOrderNoteRow {
  id: string;
  work_order_id: string;
  author_id: string | null;
  author_name: string;
  author_role: string;
  body: string;
  created_at: string;
}

export interface SupabaseWorkOrderRow {
  id: string; // Relational UUID
  work_order_code: string; // Authoritative business code (e.g. 'WO-4401')
  title: string;
  description: string | null;
  service_category: string;
  property_id: string | null;
  lead_id: string | null;
  assigned_technician_id: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  commercial_properties?: {
    id: string;
    property_code: string;
    name?: string;
  } | {
    id: string;
    property_code: string;
    name?: string;
  }[] | null;
  leads?: {
    id: string;
    lead_code: string;
    name?: string;
  } | {
    id: string;
    lead_code: string;
    name?: string;
  }[] | null;
  profiles?: {
    id: string;
    full_name: string;
    job_title: string | null;
  } | {
    id: string;
    full_name: string;
    job_title: string | null;
  }[] | null;
}

export interface CreateWorkOrderInput {
  title: string;
  description?: string;
  serviceCategory: ServiceCategory;
  propertyId?: string; // Business code (e.g. 'PROP-201') or UUID
  leadId?: string; // Business code (e.g. 'LEAD-1082') or UUID
  assignedTechnician?: string; // Full name display string (e.g. 'Derrick Miller') or UUID
  priority?: 'critical' | 'high' | 'standard';
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  dueDate?: string; // 'YYYY-MM-DD'
}

/**
 * Common select query projection including relational joins for:
 * - commercial_properties (property_code, name)
 * - leads (lead_code, name)
 * - profiles (full_name, job_title)
 */
const WORK_ORDERS_SELECT_PROJECTION = `
  id,
  work_order_code,
  title,
  description,
  service_category,
  property_id,
  lead_id,
  assigned_technician_id,
  priority,
  status,
  due_date,
  completed_at,
  created_at,
  updated_at,
  commercial_properties:property_id (
    id,
    property_code,
    name
  ),
  leads:lead_id (
    id,
    lead_code,
    name
  ),
  profiles:assigned_technician_id (
    id,
    full_name,
    job_title
  )
`;

/**
 * Normalizes ISO timestamp or database datetime string to 'YYYY-MM-DD HH:mm'.
 */
function formatWorkOrderTimestamp(timestampStr: string | null | undefined): string {
  if (!timestampStr) return '';
  const trimmed = timestampStr.trim();
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }
  } catch {
    // Fall back to slice
  }
  return trimmed;
}

/**
 * Normalizes a date string or ISO timestamp to visual 'YYYY-MM-DD'.
 */
function normalizeDueDate(dateStr: string | null | undefined): string | undefined {
  if (!dateStr) return undefined;
  const trimmed = dateStr.trim();
  if (trimmed.includes('T')) {
    return trimmed.split('T')[0];
  }
  if (trimmed.includes(' ')) {
    return trimmed.split(' ')[0];
  }
  return trimmed;
}

/**
 * Safely extracts joined property info regardless of whether Supabase returns
 * a single record object or an array.
 */
function extractJoinedProperty(row: SupabaseWorkOrderRow): { id: string; property_code: string; name?: string } | null {
  if (!row.commercial_properties) return null;
  if (Array.isArray(row.commercial_properties)) {
    return row.commercial_properties[0] || null;
  }
  return row.commercial_properties;
}

/**
 * Safely extracts joined lead info regardless of whether Supabase returns
 * a single record object or an array.
 */
function extractJoinedLead(row: SupabaseWorkOrderRow): { id: string; lead_code: string; name?: string } | null {
  if (!row.leads) return null;
  if (Array.isArray(row.leads)) {
    return row.leads[0] || null;
  }
  return row.leads;
}

/**
 * Safely extracts joined profile info regardless of whether Supabase returns
 * a single record object or an array.
 */
function extractJoinedProfile(row: SupabaseWorkOrderRow): { id: string; full_name: string; job_title: string | null } | null {
  if (!row.profiles) return null;
  if (Array.isArray(row.profiles)) {
    return row.profiles[0] || null;
  }
  return row.profiles;
}

/**
 * Maps a Supabase public.work_orders row (with joined property, lead, and profile)
 * to the application FacilityTask model.
 * Crucial: FacilityTask.id MUST remain the business code (e.g. 'WO-4401')
 * to ensure 100% compatibility with unmigrated UI views and cross-module linkages.
 */
export function mapWorkOrderRow(row: SupabaseWorkOrderRow): FacilityTask {
  const prop = extractJoinedProperty(row);
  const lead = extractJoinedLead(row);
  const prof = extractJoinedProfile(row);

  return {
    id: row.work_order_code, // Preserves 'WO-4401' business code identity
    title: row.title,
    description: row.description || undefined,
    propertyId: prop ? prop.property_code : undefined,
    leadId: lead ? lead.lead_code : undefined,
    serviceCategory: row.service_category as ServiceCategory,
    assignedTechnician: prof?.full_name || undefined,
    priority: row.priority as FacilityTask['priority'],
    status: row.status as FacilityTask['status'],
    dueDate: normalizeDueDate(row.due_date),
    createdAt: formatWorkOrderTimestamp(row.created_at),
    completedAt: row.completed_at || undefined,
  };
}

/**
 * Resolves a property business code (e.g. 'PROP-201') or UUID to commercial_properties.id (UUID).
 */
async function resolvePropertyUuid(propIdOrCode: string | null | undefined): Promise<{
  uuid: string | null;
  error: Error | null;
}> {
  if (!propIdOrCode || !propIdOrCode.trim()) {
    return { uuid: null, error: null };
  }

  const trimmed = propIdOrCode.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  try {
    let query = supabase.from('commercial_properties').select('id, property_code');
    if (isUuid) {
      query = query.or(`property_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      query = query.eq('property_code', trimmed);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { uuid: null, error: new Error(`Failed to validate property reference: ${error.message}`) };
    }

    if (!data) {
      return {
        uuid: null,
        error: new Error(`Invalid property reference: [${trimmed}] not found in commercial properties.`),
      };
    }

    return { uuid: data.id, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { uuid: null, error };
  }
}

/**
 * Resolves a lead business code (e.g. 'LEAD-1082') or UUID to leads.id (UUID).
 */
async function resolveLeadUuid(leadIdOrCode: string | null | undefined): Promise<{
  uuid: string | null;
  error: Error | null;
}> {
  if (!leadIdOrCode || !leadIdOrCode.trim()) {
    return { uuid: null, error: null };
  }

  const trimmed = leadIdOrCode.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  try {
    let query = supabase.from('leads').select('id, lead_code');
    if (isUuid) {
      query = query.or(`lead_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      query = query.eq('lead_code', trimmed);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { uuid: null, error: new Error(`Failed to validate lead reference: ${error.message}`) };
    }

    if (!data) {
      return {
        uuid: null,
        error: new Error(`Invalid lead reference: [${trimmed}] not found in database.`),
      };
    }

    return { uuid: data.id, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { uuid: null, error };
  }
}

/**
 * Resolves a technician display string (e.g. 'Derrick Miller') or UUID to profiles.id (UUID).
 */
async function resolveTechnicianUuid(techDisplayOrUuid: string | null | undefined): Promise<{
  uuid: string | null;
  error: Error | null;
}> {
  if (!techDisplayOrUuid || !techDisplayOrUuid.trim()) {
    return { uuid: null, error: null };
  }

  const trimmed = techDisplayOrUuid.trim();
  if (trimmed.toLowerCase() === 'unassigned') {
    return { uuid: null, error: null };
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
  if (isUuid) {
    return { uuid: trimmed, error: null };
  }

  try {
    // Strip trailing details if present: e.g. "Derrick Miller (HVAC Lead)" -> "Derrick Miller"
    const baseName = trimmed.split('(')[0].trim();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', baseName)
      .maybeSingle();

    if (error) {
      return { uuid: null, error: new Error(`Failed to validate technician reference: ${error.message}`) };
    }

    if (!data) {
      return {
        uuid: null,
        error: new Error(`Invalid technician reference: [${trimmed}] could not be resolved to a known profile.`),
      };
    }

    return { uuid: data.id, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { uuid: null, error };
  }
}

/**
 * Resolves a Work Order business code (e.g. 'WO-4401') or UUID to both its internal UUID and business code.
 */
async function resolveWorkOrder(idOrCode: string): Promise<{
  workOrder: { id: string; work_order_code: string } | null;
  error: Error | null;
}> {
  if (!idOrCode || !idOrCode.trim()) {
    return { workOrder: null, error: new Error('A valid Work Order identifier is required.') };
  }

  const trimmed = idOrCode.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  try {
    let query = supabase.from('work_orders').select('id, work_order_code');
    if (isUuid) {
      query = query.or(`work_order_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      query = query.eq('work_order_code', trimmed);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { workOrder: null, error: new Error(`Failed to find Work Order [${trimmed}]: ${error.message}`) };
    }

    if (!data) {
      return { workOrder: null, error: new Error(`Work Order [${trimmed}] not found in database.`) };
    }

    return { workOrder: data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { workOrder: null, error };
  }
}

/**
 * Determines the authenticated caller's role ('admin' | 'technician' | 'anon').
 */
export async function getCurrentUserRole(): Promise<{
  userId: string | null;
  role: 'admin' | 'technician' | 'anon';
  error: Error | null;
}> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { userId: null, role: 'anon', error: authError ? new Error(authError.message) : null };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return { userId: user.id, role: 'technician', error: new Error(profileError.message) };
    }

    const role = profile?.role === 'admin' ? 'admin' : 'technician';
    return { userId: user.id, role, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { userId: null, role: 'anon', error };
  }
}

/**
 * Asynchronously retrieves all Work Orders visible to the authenticated session.
 * Governed automatically by Supabase Row-Level Security:
 * - Admin users receive all work order records.
 * - Technicians receive only work orders assigned to them.
 */
export async function getWorkOrders(): Promise<{
  data: FacilityTask[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(WORK_ORDERS_SELECT_PROJECTION)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders from Supabase:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    const tasks = (data as unknown as SupabaseWorkOrderRow[]).map(mapWorkOrderRow);
    return { data: tasks, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in getWorkOrders service:', error.message);
    return { data: null, error };
  }
}

/**
 * Asynchronously retrieves a single Work Order by business code (e.g. 'WO-4401') or UUID.
 */
export async function getWorkOrderById(idOrCode: string): Promise<{
  data: FacilityTask | null;
  error: Error | null;
}> {
  try {
    if (!idOrCode || !idOrCode.trim()) {
      return { data: null, error: new Error('A valid Work Order identifier is required.') };
    }

    const trimmed = idOrCode.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    let query = supabase.from('work_orders').select(WORK_ORDERS_SELECT_PROJECTION);
    if (isUuid) {
      query = query.or(`work_order_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      query = query.eq('work_order_code', trimmed);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(`Error fetching Work Order [${trimmed}] from Supabase:`, error.message);
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: new Error(`Work Order [${trimmed}] not found.`) };
    }

    return { data: mapWorkOrderRow(data as unknown as SupabaseWorkOrderRow), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in getWorkOrderById [${idOrCode}]:`, error.message);
    return { data: null, error };
  }
}

/**
 * Retrieves all Work Orders linked to a commercial property (by 'PROP-xxx' or UUID).
 */
export async function getWorkOrdersByPropertyId(propertyIdOrCode: string): Promise<{
  data: FacilityTask[] | null;
  error: Error | null;
}> {
  try {
    if (!propertyIdOrCode || !propertyIdOrCode.trim()) {
      return { data: null, error: new Error('A valid property identifier is required.') };
    }

    const { uuid: propertyUuid, error: propErr } = await resolvePropertyUuid(propertyIdOrCode);
    if (propErr) {
      return { data: null, error: propErr };
    }
    if (!propertyUuid) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('work_orders')
      .select(WORK_ORDERS_SELECT_PROJECTION)
      .eq('property_id', propertyUuid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching work orders for property [${propertyIdOrCode}]:`, error.message);
      return { data: null, error: new Error(error.message) };
    }

    const tasks = (data as unknown as SupabaseWorkOrderRow[]).map(mapWorkOrderRow);
    return { data: tasks, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in getWorkOrdersByPropertyId [${propertyIdOrCode}]:`, error.message);
    return { data: null, error };
  }
}

/**
 * Retrieves all Work Orders linked to a CRM lead (by 'LEAD-xxxx' or UUID).
 */
export async function getWorkOrdersByLeadId(leadIdOrCode: string): Promise<{
  data: FacilityTask[] | null;
  error: Error | null;
}> {
  try {
    if (!leadIdOrCode || !leadIdOrCode.trim()) {
      return { data: null, error: new Error('A valid lead identifier is required.') };
    }

    const { uuid: leadUuid, error: leadErr } = await resolveLeadUuid(leadIdOrCode);
    if (leadErr) {
      return { data: null, error: leadErr };
    }
    if (!leadUuid) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('work_orders')
      .select(WORK_ORDERS_SELECT_PROJECTION)
      .eq('lead_id', leadUuid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching work orders for lead [${leadIdOrCode}]:`, error.message);
      return { data: null, error: new Error(error.message) };
    }

    const tasks = (data as unknown as SupabaseWorkOrderRow[]).map(mapWorkOrderRow);
    return { data: tasks, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in getWorkOrdersByLeadId [${leadIdOrCode}]:`, error.message);
    return { data: null, error };
  }
}

/**
 * Security-sensitive status transition function.
 * - Detects authenticated user's role.
 * - For Technicians: Invokes public.update_my_work_order_status RPC.
 * - For Admins: Performs permitted direct table UPDATE.
 * RLS enforces boundaries in both paths.
 */
export async function updateWorkOrderStatus(
  idOrCode: string,
  newStatus: FacilityTask['status'],
  completedAt?: string
): Promise<{
  data: FacilityTask | null;
  error: Error | null;
}> {
  try {
    const validStatuses: FacilityTask['status'][] = ['pending', 'in-progress', 'completed', 'on-hold'];
    if (!validStatuses.includes(newStatus)) {
      return { data: null, error: new Error(`Invalid work order status transition: [${newStatus}]`) };
    }

    // 1. Resolve work order to get both its UUID and business code
    const { workOrder, error: resolveErr } = await resolveWorkOrder(idOrCode);
    if (resolveErr || !workOrder) {
      return { data: null, error: resolveErr || new Error('Work Order could not be resolved.') };
    }

    // 2. Check current authenticated user role
    const { role, error: roleErr } = await getCurrentUserRole();
    if (roleErr) {
      return { data: null, error: new Error(`Authentication check failed: ${roleErr.message}`) };
    }
    if (role === 'anon') {
      return { data: null, error: new Error('Authentication required to update work orders.') };
    }

    const resolvedCompletedAt = newStatus === 'completed'
      ? (completedAt ? new Date(completedAt).toISOString() : new Date().toISOString())
      : null;

    if (role === 'technician') {
      // Technician execution path: Call controlled SECURITY DEFINER RPC
      const { error: rpcError } = await supabase.rpc('update_my_work_order_status', {
        p_work_order_id: workOrder.id,
        p_new_status: newStatus,
        p_completed_at: resolvedCompletedAt,
      });

      if (rpcError) {
        console.error('Technician status update RPC failed:', rpcError.message);
        return { data: null, error: new Error(rpcError.message) };
      }
    } else {
      // Admin execution path: Direct table update permitted by RLS
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        completed_at: resolvedCompletedAt,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('work_orders')
        .update(updatePayload)
        .eq('id', workOrder.id);

      if (updateError) {
        console.error('Admin work order update failed:', updateError.message);
        return { data: null, error: new Error(updateError.message) };
      }
    }

    // Controlled event dispatch for cross-module reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar_tasks_updated'));
    }

    // 3. Return the fully projected updated work order record
    return await getWorkOrderById(workOrder.work_order_code);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in updateWorkOrderStatus [${idOrCode}]:`, error.message);
    return { data: null, error };
  }
}

/**
 * Asynchronously retrieves all active profiles with role = 'technician' eligible for work order assignment.
 * Relies strictly on authenticated Supabase client and existing RLS policies.
 * Returns an empty array if no technician profiles exist.
 */
export async function getAssignableTechnicians(): Promise<{
  data: AssignableTechnician[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, job_title, discipline')
      .eq('role', 'technician')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching assignable technicians:', error.message);
      return { data: [], error: new Error(error.message) };
    }

    const technicians: AssignableTechnician[] = (data || []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      jobTitle: row.job_title || undefined,
      discipline: row.discipline || undefined
    }));

    return { data: technicians, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: [], error };
  }
}

/**
 * Assigns or unassigns a Work Order to a real technician profile.
 * Only authenticated Admin/Manager sessions can execute this update (enforced by RLS).
 * Pass technicianProfileId = null to mark the task as Unassigned.
 */
export async function assignWorkOrderTechnician(
  idOrCode: string,
  technicianProfileId: string | null
): Promise<{
  data: FacilityTask | null;
  error: Error | null;
}> {
  try {
    // 1. Resolve work order to get its internal UUID and business code
    const { workOrder, error: resolveErr } = await resolveWorkOrder(idOrCode);
    if (resolveErr || !workOrder) {
      return { data: null, error: resolveErr || new Error('Work Order could not be resolved.') };
    }

    // 2. Validate technician UUID format if not null
    let targetProfileUuid: string | null = null;
    if (technicianProfileId && technicianProfileId.trim() && technicianProfileId !== 'unassigned') {
      const trimmedUuid = technicianProfileId.trim();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmedUuid);
      if (!isUuid) {
        return { data: null, error: new Error(`Invalid technician profile ID: [${trimmedUuid}] is not a valid UUID.`) };
      }
      targetProfileUuid = trimmedUuid;
    }

    // 3. Update public.work_orders record
    const updatePayload = {
      assigned_technician_id: targetProfileUuid,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('work_orders')
      .update(updatePayload)
      .eq('id', workOrder.id);

    if (updateError) {
      console.error(`Work order assignment failed [${idOrCode}]:`, updateError.message);
      return { data: null, error: new Error(updateError.message) };
    }

    // Controlled event dispatch for cross-module reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar_tasks_updated'));
    }

    // 4. Return the fully projected updated work order record
    return await getWorkOrderById(workOrder.work_order_code);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in assignWorkOrderTechnician [${idOrCode}]:`, error.message);
    return { data: null, error };
  }
}

/**
 * Creates a new Work Order record in Supabase public.work_orders.
 * Resolves application business codes (PROP-xxx, LEAD-xxxx) and technician display names
 * to PostgreSQL foreign key UUIDs before insertion.
 * Post-insertion, PostgreSQL automatically generates the sequential work_order_code (WO-xxxx).
 */
export async function createWorkOrder(input: CreateWorkOrderInput): Promise<{
  data: FacilityTask | null;
  error: Error | null;
}> {
  try {
    if (!input.title || !input.title.trim()) {
      return { data: null, error: new Error('Work order title is required.') };
    }
    if (!input.serviceCategory) {
      return { data: null, error: new Error('Service category is required.') };
    }

    // 1. Resolve relational foreign key references
    const { uuid: propertyUuid, error: propErr } = await resolvePropertyUuid(input.propertyId);
    if (propErr) {
      return { data: null, error: propErr };
    }

    const { uuid: leadUuid, error: leadErr } = await resolveLeadUuid(input.leadId);
    if (leadErr) {
      return { data: null, error: leadErr };
    }

    const { uuid: technicianUuid, error: techErr } = await resolveTechnicianUuid(input.assignedTechnician);
    if (techErr) {
      return { data: null, error: techErr };
    }

    // 2. Build insert payload
    const insertPayload = {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      service_category: input.serviceCategory,
      property_id: propertyUuid,
      lead_id: leadUuid,
      assigned_technician_id: technicianUuid,
      priority: input.priority || 'standard',
      status: input.status || 'pending',
      due_date: normalizeDueDate(input.dueDate) || null,
      completed_at: input.status === 'completed' ? new Date().toISOString() : null,
    };

    const { data: created, error: insertError } = await supabase
      .from('work_orders')
      .insert(insertPayload)
      .select('id, work_order_code')
      .single();

    if (insertError) {
      console.error('Error inserting work order into Supabase:', insertError.message);
      return { data: null, error: new Error(insertError.message) };
    }

    if (!created) {
      return { data: null, error: new Error('No record returned from work order insertion.') };
    }

    // Controlled event dispatch for cross-module reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar_tasks_updated'));
    }

    // 3. Return the fully projected mapped work order
    return await getWorkOrderById(created.work_order_code);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in createWorkOrder:', error.message);
    return { data: null, error };
  }
}

/**
 * Maps a Supabase public.work_order_notes row to the application WorkOrderJobNote model.
 */
export function mapJobNoteRow(row: SupabaseWorkOrderNoteRow): WorkOrderJobNote {
  return {
    id: row.id,
    workOrderId: row.work_order_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorRole: row.author_role,
    body: row.body,
    createdAt: row.created_at,
  };
}

/**
 * Asynchronously retrieves all Job Notes associated with a Work Order in chronological order (oldest first).
 * Governed automatically by Supabase Row-Level Security:
 * - Admin users receive all notes across any work order.
 * - Technicians receive notes only for work orders currently assigned to them.
 *
 * @param workOrderIdentifier - Work Order business code (e.g. 'WO-4401') or UUID.
 */
export async function getWorkOrderNotes(workOrderIdentifier: string): Promise<{
  data: WorkOrderJobNote[] | null;
  error: Error | null;
}> {
  try {
    if (!workOrderIdentifier || !workOrderIdentifier.trim()) {
      return { data: null, error: new Error('A valid Work Order identifier is required.') };
    }

    // 1. Resolve Work Order identifier (business code or UUID)
    const { workOrder, error: resolveErr } = await resolveWorkOrder(workOrderIdentifier);
    if (resolveErr || !workOrder) {
      return { data: null, error: resolveErr || new Error(`Work Order [${workOrderIdentifier}] not found.`) };
    }

    // 2. Query public.work_order_notes ordered chronologically (oldest first)
    const { data, error } = await supabase
      .from('work_order_notes')
      .select('id, work_order_id, author_id, author_name, author_role, body, created_at')
      .eq('work_order_id', workOrder.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching Job Notes for Work Order [${workOrder.work_order_code}]:`, error.message);
      return { data: null, error: new Error(error.message) };
    }

    const notes = (data as unknown as SupabaseWorkOrderNoteRow[]).map(mapJobNoteRow);
    return { data: notes, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in getWorkOrderNotes service:', error.message);
    return { data: null, error };
  }
}

/**
 * Appends a new Job Note to a Work Order.
 *
 * Requirements & Security Guarantees:
 * - Validates note body is non-empty.
 * - Resolves Work Order UUID.
 * - Obtains author details directly from the authenticated session and profile; does not trust arbitrary UI inputs.
 * - Uses standard authenticated Supabase client; does not bypass RLS.
 * - PostgreSQL RLS strictly enforces that technicians can only append notes to Work Orders assigned to them.
 * - Append-only: No update or delete operations are provided.
 *
 * @param workOrderIdentifier - Work Order business code (e.g. 'WO-4401') or UUID.
 * @param body - The note content/documentation.
 */
export async function addWorkOrderNote(
  workOrderIdentifier: string,
  body: string
): Promise<{
  data: WorkOrderJobNote | null;
  error: Error | null;
}> {
  try {
    // 1. Validate note body
    if (!body || !body.trim()) {
      return { data: null, error: new Error('Job Note body cannot be empty.') };
    }
    const trimmedBody = body.trim();

    // 2. Resolve Work Order identifier to UUID
    const { workOrder, error: resolveErr } = await resolveWorkOrder(workOrderIdentifier);
    if (resolveErr || !workOrder) {
      return { data: null, error: resolveErr || new Error(`Work Order [${workOrderIdentifier}] not found.`) };
    }

    // 3. Obtain authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: new Error('Authentication required to add a Job Note.') };
    }

    // 4. Obtain author profile details from public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return { data: null, error: new Error(`Failed to load author profile: ${profileError.message}`) };
    }

    // Author attribution snapshot
    const authorName = profile?.full_name?.trim() || user.user_metadata?.full_name?.trim() || user.email || 'Operations Specialist';
    const authorRole = profile?.role === 'admin' ? 'admin' : 'technician';

    // 5. Insert new note into public.work_order_notes
    // Let PostgreSQL assign id (gen_random_uuid()) and created_at (NOW())
    const { data, error: insertError } = await supabase
      .from('work_order_notes')
      .insert({
        work_order_id: workOrder.id,
        author_id: user.id,
        author_name: authorName,
        author_role: authorRole,
        body: trimmedBody,
      })
      .select('id, work_order_id, author_id, author_name, author_role, body, created_at')
      .single();

    if (insertError) {
      console.error(`Error inserting Job Note for Work Order [${workOrder.work_order_code}]:`, insertError.message);
      return { data: null, error: new Error(insertError.message) };
    }

    if (!data) {
      return { data: null, error: new Error('No record returned from Job Note creation.') };
    }

    // 6. Map and return created note
    const mappedNote = mapJobNoteRow(data as unknown as SupabaseWorkOrderNoteRow);
    return { data: mappedNote, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in addWorkOrderNote:', error.message);
    return { data: null, error };
  }
}
