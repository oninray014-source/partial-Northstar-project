import { supabase } from '../lib/supabaseClient';
import { CRMLead } from '../types';

export interface SupabaseLeadRow {
  id: string; // Internal relational UUID
  lead_code: string; // Authoritative business code (e.g. 'LEAD-1082')
  name: string;
  email: string;
  company: string;
  phone: string;
  service_needed: string;
  property_type: string;
  property_address: string;
  message: string;
  preferred_contact_method: 'phone' | 'email' | 'either';
  status: 'new' | 'assessing' | 'scheduled' | 'dispatched' | 'closed';
  priority: 'critical' | 'high' | 'standard';
  property_id: string | null;
  assigned_technician_id: string | null;
  estimated_value: string | null;
  facility_square_footage: string | null;
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

export interface CreateLeadInput {
  name: string;
  email: string;
  company: string;
  phone: string;
  serviceNeeded: string;
  propertyType: string;
  propertyAddress: string;
  message: string;
  preferredContactMethod: 'phone' | 'email' | 'either';
  status?: 'new' | 'assessing' | 'scheduled' | 'dispatched' | 'closed';
  priority?: 'critical' | 'high' | 'standard';
  propertyId?: string; // Application code (e.g. 'PROP-201') or UUID
  assignedTechnician?: string; // Display string (e.g. 'Derrick Miller') or UUID
  estimatedValue?: string;
  facilitySquareFootage?: string;
}

export interface UpdateLeadInput {
  status?: 'new' | 'assessing' | 'scheduled' | 'dispatched' | 'closed';
  priority?: 'critical' | 'high' | 'standard';
  assignedTechnician?: string | null;
  propertyId?: string | null;
  estimatedValue?: string | null;
  facilitySquareFootage?: string | null;
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  serviceNeeded?: string;
  propertyType?: string;
  propertyAddress?: string;
  message?: string;
  preferredContactMethod?: 'phone' | 'email' | 'either';
}

export interface SubmitPublicInquiryInput {
  name: string;
  email: string;
  company: string;
  phone: string;
  serviceNeeded: string;
  propertyType: string;
  propertyAddress: string;
  message?: string;
  preferredContactMethod?: 'phone' | 'email' | 'either';
}

/**
 * Normalizes ISO timestamp or database datetime string to 'YYYY-MM-DD HH:mm'.
 */
function formatLeadTimestamp(timestampStr: string | null | undefined): string {
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
 * Safely extracts joined property info regardless of whether Supabase returns
 * a single record object or an array.
 */
function extractJoinedProperty(row: SupabaseLeadRow): { id: string; property_code: string; name?: string } | null {
  if (!row.commercial_properties) return null;
  if (Array.isArray(row.commercial_properties)) {
    return row.commercial_properties[0] || null;
  }
  return row.commercial_properties;
}

/**
 * Safely extracts joined profile info regardless of whether Supabase returns
 * a single record object or an array.
 */
function extractJoinedProfile(row: SupabaseLeadRow): { id: string; full_name: string; job_title: string | null } | null {
  if (!row.profiles) return null;
  if (Array.isArray(row.profiles)) {
    return row.profiles[0] || null;
  }
  return row.profiles;
}

/**
 * Maps a Supabase public.leads row (with joined property and profile) to the application CRMLead model.
 * Crucial: CRMLead.id MUST remain the business code (e.g. 'LEAD-1082') to ensure complete
 * compatibility with unmigrated LocalStorage tasks, activities, and routing.
 */
function mapLeadRow(row: SupabaseLeadRow): CRMLead {
  const prop = extractJoinedProperty(row);
  const prof = extractJoinedProfile(row);

  let assignedTechnicianStr: string | undefined = undefined;
  if (prof && prof.full_name) {
    if (prof.job_title && prof.job_title.trim()) {
      assignedTechnicianStr = `${prof.full_name} (${prof.job_title})`;
    } else {
      assignedTechnicianStr = prof.full_name;
    }
  }

  return {
    id: row.lead_code, // Preserves 'LEAD-1082' business code identity
    createdAt: formatLeadTimestamp(row.created_at),
    name: row.name,
    email: row.email,
    company: row.company,
    phone: row.phone,
    serviceNeeded: row.service_needed,
    propertyType: row.property_type,
    propertyAddress: row.property_address,
    message: row.message,
    preferredContactMethod: row.preferred_contact_method || 'either',
    status: row.status,
    priority: row.priority || 'standard',
    propertyId: prop ? prop.property_code : undefined,
    assignedTechnician: assignedTechnicianStr,
    estimatedValue: row.estimated_value || undefined,
    facilitySquareFootage: row.facility_square_footage || undefined,
  };
}

/**
 * Common select query projection including relational joins for commercial_properties
 * and profiles.
 */
const LEADS_SELECT_PROJECTION = `
  id,
  lead_code,
  name,
  email,
  company,
  phone,
  service_needed,
  property_type,
  property_address,
  message,
  preferred_contact_method,
  status,
  priority,
  property_id,
  assigned_technician_id,
  estimated_value,
  facility_square_footage,
  created_at,
  updated_at,
  commercial_properties:property_id (
    id,
    property_code,
    name
  ),
  profiles:assigned_technician_id (
    id,
    full_name,
    job_title
  )
`;

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
 * Resolves a technician display string (e.g. 'Derrick Miller (HVAC Lead)') or UUID to profiles.id (UUID).
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
    // Strip trailing details in parentheses: e.g. "Derrick Miller (HVAC Lead)" -> "Derrick Miller"
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
 * Asynchronously retrieves all CRM leads visible to the authenticated session.
 * Governed automatically by Supabase Row-Level Security:
 * - Admin users receive all lead records.
 * - Anonymous / Technicians are restricted according to RLS.
 */
export async function getLeads(): Promise<{
  data: CRMLead[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(LEADS_SELECT_PROJECTION)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads from Supabase:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    const leads = (data as unknown as SupabaseLeadRow[]).map(mapLeadRow);
    return { data: leads, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in getLeads service:', error.message);
    return { data: null, error };
  }
}

/**
 * Asynchronously retrieves a single CRM lead by its business code (e.g. 'LEAD-1082')
 * or internal UUID primary key.
 */
export async function getLeadById(idOrCode: string): Promise<{
  data: CRMLead | null;
  error: Error | null;
}> {
  try {
    if (!idOrCode || !idOrCode.trim()) {
      return { data: null, error: null };
    }

    const trimmed = idOrCode.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    let query = supabase.from('leads').select(LEADS_SELECT_PROJECTION);

    if (isUuid) {
      query = query.or(`lead_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      query = query.eq('lead_code', trimmed);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(`Error fetching lead [${trimmed}] from Supabase:`, error.message);
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: mapLeadRow(data as unknown as SupabaseLeadRow), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in getLeadById [${idOrCode}]:`, error.message);
    return { data: null, error };
  }
}

/**
 * Creates a new CRM Lead record in Supabase public.leads.
 * The authoritative business code is generated by the database sequence (lead_code_seq).
 * The returned CRMLead model contains the authoritative generated lead_code in CRMLead.id.
 */
export async function createLead(input: CreateLeadInput): Promise<{
  data: CRMLead | null;
  error: Error | null;
}> {
  try {
    // 1. Resolve property reference if provided
    let propertyUuid: string | null = null;
    if (input.propertyId) {
      const { uuid, error: propErr } = await resolvePropertyUuid(input.propertyId);
      if (propErr) return { data: null, error: propErr };
      propertyUuid = uuid;
    }

    // 2. Resolve technician reference if provided
    let technicianUuid: string | null = null;
    if (input.assignedTechnician) {
      const { uuid, error: techErr } = await resolveTechnicianUuid(input.assignedTechnician);
      if (techErr) return { data: null, error: techErr };
      technicianUuid = uuid;
    }

    // 3. Assemble database insert payload
    const insertPayload: Record<string, unknown> = {
      name: input.name.trim(),
      email: input.email.trim(),
      company: input.company.trim(),
      phone: input.phone.trim(),
      service_needed: input.serviceNeeded,
      property_type: input.propertyType,
      property_address: input.propertyAddress.trim(),
      message: input.message.trim(),
      preferred_contact_method: input.preferredContactMethod || 'either',
      status: input.status || 'new',
      priority: input.priority || 'standard',
    };

    if (propertyUuid) insertPayload.property_id = propertyUuid;
    if (technicianUuid) insertPayload.assigned_technician_id = technicianUuid;
    if (input.estimatedValue !== undefined && input.estimatedValue.trim()) {
      insertPayload.estimated_value = input.estimatedValue.trim();
    }
    if (input.facilitySquareFootage !== undefined && input.facilitySquareFootage.trim()) {
      insertPayload.facility_square_footage = input.facilitySquareFootage.trim();
    }

    // 4. Execute insert against Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert(insertPayload)
      .select(LEADS_SELECT_PROJECTION)
      .single();

    if (error) {
      console.error('Error inserting lead into Supabase:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    // 5. Controlled event dispatch for backward compatibility with unmigrated UI stores
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar_leads_updated'));
    }

    const createdLead = mapLeadRow(data as unknown as SupabaseLeadRow);
    return { data: createdLead, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in createLead service:', error.message);
    return { data: null, error };
  }
}

/**
 * Submits an inbound commercial facility service inquiry from the public website (/contact).
 * Uses the dedicated SECURITY DEFINER RPC public.submit_public_inquiry to securely create
 * a new lead without granting anon SELECT privileges or exposing existing CRM records.
 *
 * Returns ONLY the generated business tracking code (e.g. 'LEAD-1083') for the confirmation receipt.
 */
export async function submitPublicInquiry(input: SubmitPublicInquiryInput): Promise<{
  leadCode: string | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase.rpc('submit_public_inquiry', {
      p_name: input.name.trim(),
      p_email: input.email.trim(),
      p_company: input.company.trim(),
      p_phone: input.phone.trim(),
      p_service_needed: input.serviceNeeded.trim(),
      p_property_type: input.propertyType.trim(),
      p_property_address: input.propertyAddress.trim(),
      p_message: (input.message || '').trim(),
      p_preferred_contact_method: input.preferredContactMethod || 'phone',
    });

    if (error) {
      console.error('Error in submitPublicInquiry RPC:', error.message);
      return { leadCode: null, error: new Error(error.message) };
    }

    if (!data || typeof data !== 'string') {
      return { leadCode: null, error: new Error('Invalid response from lead submission service.') };
    }

    // Dispatch controlled event for connected UI stores if running in browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar_leads_updated'));
    }

    return { leadCode: data, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in submitPublicInquiry:', error.message);
    return { leadCode: null, error };
  }
}

/**
 * Updates an existing CRM Lead record in Supabase public.leads.
 * Supports updating status, priority, technician assignment, linked property,
 * estimated value, and other standard lead fields.
 */
export async function updateLead(
  idOrCode: string,
  updates: UpdateLeadInput
): Promise<{
  data: CRMLead | null;
  error: Error | null;
}> {
  try {
    if (!idOrCode || !idOrCode.trim()) {
      return { data: null, error: new Error('A valid lead identifier is required to update.') };
    }

    const trimmed = idOrCode.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    // 1. Verify existence of the lead
    let findQuery = supabase.from('leads').select('id, lead_code');
    if (isUuid) {
      findQuery = findQuery.or(`lead_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      findQuery = findQuery.eq('lead_code', trimmed);
    }

    const { data: existing, error: findError } = await findQuery.maybeSingle();

    if (findError) {
      return { data: null, error: new Error(`Failed to find lead [${trimmed}]: ${findError.message}`) };
    }
    if (!existing) {
      return { data: null, error: new Error(`Lead [${trimmed}] not found in database.`) };
    }

    // 2. Build update payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status !== undefined) {
      updatePayload.status = updates.status;
    }
    if (updates.priority !== undefined) {
      updatePayload.priority = updates.priority;
    }
    if (updates.name !== undefined) {
      updatePayload.name = updates.name.trim();
    }
    if (updates.email !== undefined) {
      updatePayload.email = updates.email.trim();
    }
    if (updates.company !== undefined) {
      updatePayload.company = updates.company.trim();
    }
    if (updates.phone !== undefined) {
      updatePayload.phone = updates.phone.trim();
    }
    if (updates.serviceNeeded !== undefined) {
      updatePayload.service_needed = updates.serviceNeeded;
    }
    if (updates.propertyType !== undefined) {
      updatePayload.property_type = updates.propertyType;
    }
    if (updates.propertyAddress !== undefined) {
      updatePayload.property_address = updates.propertyAddress.trim();
    }
    if (updates.message !== undefined) {
      updatePayload.message = updates.message.trim();
    }
    if (updates.preferredContactMethod !== undefined) {
      updatePayload.preferred_contact_method = updates.preferredContactMethod;
    }
    if (updates.estimatedValue !== undefined) {
      updatePayload.estimated_value = updates.estimatedValue ? updates.estimatedValue.trim() : null;
    }
    if (updates.facilitySquareFootage !== undefined) {
      updatePayload.facility_square_footage = updates.facilitySquareFootage
        ? updates.facilitySquareFootage.trim()
        : null;
    }

    // 3. Resolve property reference if provided in updates
    if (updates.propertyId !== undefined) {
      if (!updates.propertyId || !updates.propertyId.trim()) {
        updatePayload.property_id = null;
      } else {
        const { uuid, error: propErr } = await resolvePropertyUuid(updates.propertyId);
        if (propErr) return { data: null, error: propErr };
        updatePayload.property_id = uuid;
      }
    }

    // 4. Resolve technician reference if provided in updates
    if (updates.assignedTechnician !== undefined) {
      if (!updates.assignedTechnician || !updates.assignedTechnician.trim() || updates.assignedTechnician.trim().toLowerCase() === 'unassigned') {
        updatePayload.assigned_technician_id = null;
      } else {
        const { uuid, error: techErr } = await resolveTechnicianUuid(updates.assignedTechnician);
        if (techErr) return { data: null, error: techErr };
        updatePayload.assigned_technician_id = uuid;
      }
    }

    // 5. Execute update
    const { data: updatedData, error: updateError } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', existing.id)
      .select(LEADS_SELECT_PROJECTION)
      .single();

    if (updateError) {
      console.error(`Error updating lead [${trimmed}] in Supabase:`, updateError.message);
      return { data: null, error: new Error(updateError.message) };
    }

    // 6. Controlled event dispatch for backward compatibility with unmigrated UI stores
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('northstar_leads_updated'));
    }

    const updatedLead = mapLeadRow(updatedData as unknown as SupabaseLeadRow);
    return { data: updatedLead, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in updateLead service [${idOrCode}]:`, error.message);
    return { data: null, error };
  }
}
