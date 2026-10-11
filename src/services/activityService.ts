import { supabase } from '../lib/supabaseClient';

export type ActivityEntityType =
  | 'lead'
  | 'task'
  | 'property'
  | 'system';

export type ActivityActionType =
  | 'lead_created'
  | 'lead_status_updated'
  | 'lead_assigned'
  | 'lead_property_linked'
  | 'task_created'
  | 'task_status_updated'
  | 'task_completed'
  | 'property_added';

export interface ActivityEvent {
  id: string; // Business code (e.g. 'ACT-1008')
  timestamp: string; // Visual format (e.g. '2026-09-27 10:15')
  actionType: ActivityActionType;
  title: string;
  description?: string;
  entityType: ActivityEntityType;
  entityId: string; // Business code (e.g. 'WO-4401', 'LEAD-1082', 'PROP-201')
  entityName?: string;
  actor: string; // Display name (e.g. 'Sarah Jenkins', 'Derrick Miller')
  propertyId?: string; // Business code (e.g. 'PROP-201')
  metadata?: {
    previousStatus?: string;
    newStatus?: string;
    trade?: string;
    priority?: string;
    [key: string]: unknown;
  };
}

export interface SupabaseActivityRow {
  id: string;
  activity_code: string;
  action_type: string;
  title: string;
  description: string | null;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  actor_id: string | null;
  actor_name: string;
  property_id: string | null;
  lead_id: string | null;
  work_order_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  commercial_properties?: {
    id: string;
    property_code: string;
    name?: string;
  } | {
    id: string;
    property_code: string;
    name?: string;
  }[] | null;
}

const ACTIVITY_SELECT_PROJECTION = `
  id,
  activity_code,
  action_type,
  title,
  description,
  entity_type,
  entity_id,
  entity_name,
  actor_id,
  actor_name,
  property_id,
  lead_id,
  work_order_id,
  metadata,
  created_at,
  commercial_properties:property_id (
    id,
    property_code,
    name
  )
`;

/**
 * Normalizes an ISO timestamp string to visual 'YYYY-MM-DD HH:mm'.
 */
function formatActivityTimestamp(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return dateStr || '';
  }
}

/**
 * Safely extracts joined commercial_properties relation.
 */
function extractJoinedProperty(row: SupabaseActivityRow): { id: string; property_code: string; name?: string } | null {
  if (!row.commercial_properties) return null;
  if (Array.isArray(row.commercial_properties)) {
    return row.commercial_properties[0] || null;
  }
  return row.commercial_properties;
}

/**
 * Maps a Supabase public.activity_events row to the UI ActivityEvent model.
 */
function mapActivityRow(row: SupabaseActivityRow): ActivityEvent {
  const prop = extractJoinedProperty(row);
  const resolvedPropertyCode = prop?.property_code || (row.entity_type === 'property' ? row.entity_id : undefined);

  return {
    id: row.activity_code,
    timestamp: formatActivityTimestamp(row.created_at),
    actionType: row.action_type as ActivityActionType,
    title: row.title,
    description: row.description || undefined,
    entityType: row.entity_type as ActivityEntityType,
    entityId: row.entity_id,
    entityName: row.entity_name || undefined,
    actor: row.actor_name,
    propertyId: resolvedPropertyCode,
    metadata: (row.metadata as ActivityEvent['metadata']) || undefined,
  };
}

/**
 * Asynchronously retrieves up to 100 recent activity events from Supabase.
 * Governed strictly by PostgreSQL Row-Level Security:
 * - Admin/Manager sessions receive the full operational timeline.
 * - Technician sessions receive only activities associated with their own actions or assigned work orders.
 */
export async function getActivityEvents(): Promise<{
  data: ActivityEvent[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('activity_events')
      .select(ACTIVITY_SELECT_PROJECTION)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching activity events from Supabase:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    const events = (data as unknown as SupabaseActivityRow[]).map(mapActivityRow);
    return { data: events, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in getActivityEvents service:', error.message);
    return { data: null, error };
  }
}
