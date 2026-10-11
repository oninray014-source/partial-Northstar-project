import { supabase } from '../lib/supabaseClient';
import { CommercialProperty, PropertyType } from '../types';

export interface SupabasePropertyRow {
  id: string;
  property_code: string;
  name: string;
  client_company: string;
  property_type: string;
  address: string;
  square_footage: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  equipment_tags: string[] | null;
  status: string;
  pm_cycle: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Normalizes an ISO timestamp string or date string to visual 'YYYY-MM-DD'
 * without timezone shifting the stored calendar date.
 */
function normalizeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
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
 * Maps a Supabase commercial_properties row to the application CommercialProperty model.
 * Crucial: CommercialProperty.id MUST remain the business code (e.g. 'PROP-201')
 * to ensure 100% compatibility with unmigrated LocalStorage Leads and Tasks.
 */
function mapPropertyRow(row: SupabasePropertyRow): CommercialProperty {
  const hasContactInfo = Boolean(
    (row.primary_contact_name && row.primary_contact_name.trim()) ||
    (row.primary_contact_email && row.primary_contact_email.trim()) ||
    (row.primary_contact_phone && row.primary_contact_phone.trim())
  );

  return {
    id: row.property_code, // Preserves 'PROP-201' for relationship compatibility
    name: row.name,
    clientCompany: row.client_company,
    propertyType: row.property_type as PropertyType,
    address: row.address,
    squareFootage: row.square_footage || '',
    primaryContact: hasContactInfo
      ? {
          name: row.primary_contact_name || '',
          email: row.primary_contact_email || '',
          phone: row.primary_contact_phone || '',
        }
      : undefined,
    equipmentTags: Array.isArray(row.equipment_tags) ? row.equipment_tags : [],
    status: row.status as CommercialProperty['status'],
    pmCycle: row.pm_cycle || undefined,
    createdAt: normalizeDate(row.created_at),
  };
}

/**
 * Asynchronously retrieves all commercial properties visible to the authenticated session.
 * Governed automatically by Supabase Row-Level Security:
 * - Admin users receive all records (active, under-assessment, inactive).
 * - Technician users receive active properties only.
 */
export async function getProperties(): Promise<{
  data: CommercialProperty[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('commercial_properties')
      .select('*')
      .order('property_code', { ascending: true });

    if (error) {
      console.error('Error fetching commercial properties from Supabase:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    const properties = (data as SupabasePropertyRow[]).map(mapPropertyRow);
    return { data: properties, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in getProperties service:', error.message);
    return { data: null, error };
  }
}

/**
 * Asynchronously retrieves a single commercial property by its business code (e.g. 'PROP-201')
 * or database UUID primary key.
 */
export async function getPropertyById(idOrCode: string): Promise<{
  data: CommercialProperty | null;
  error: Error | null;
}> {
  try {
    if (!idOrCode || !idOrCode.trim()) {
      return { data: null, error: null };
    }

    const trimmed = idOrCode.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

    let query = supabase.from('commercial_properties').select('*');

    if (isUuid) {
      query = query.or(`property_code.eq.${trimmed},id.eq.${trimmed}`);
    } else {
      query = query.eq('property_code', trimmed);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(`Error fetching commercial property [${trimmed}] from Supabase:`, error.message);
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: mapPropertyRow(data as SupabasePropertyRow), error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`Unexpected error in getPropertyById [${idOrCode}]:`, error.message);
    return { data: null, error };
  }
}
