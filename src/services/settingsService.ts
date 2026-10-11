import { supabase } from '../lib/supabaseClient';

export interface OperationalSettings {
  organizationName: string;
  operationsHub: string;
  dispatchPhone: string;
  dispatchEmail: string;
  serviceTerritorySummary: string;

  routineHoursWeekday: string;
  routineHoursWeekend: string;
  emergencyDispatchPhone: string;
  emergencyResponseWindow: string;

  defaultAssessmentTargetHours: number;
  defaultWorkOrderLeadDays: number;

  version: string;
  environment: string;
}

export const DEFAULT_SETTINGS: OperationalSettings = {
  organizationName: 'Northstar Facility Services',
  operationsHub: 'Austin Central HQ',
  serviceTerritorySummary: 'Austin & Central Texas',
  dispatchPhone: '(512) 555-0190',
  dispatchEmail: 'dispatch@northstarfacilities.com',
  routineHoursWeekday: 'Mon–Fri 7:00 AM – 6:00 PM',
  routineHoursWeekend: 'Emergency response only',
  emergencyDispatchPhone: '(512) 555-0190',
  emergencyResponseWindow: '24/7 Priority Emergency Commercial Response',
  defaultAssessmentTargetHours: 24,
  defaultWorkOrderLeadDays: 3,
  version: '1.0.0',
  environment: 'Supabase Cloud (Central Texas)',
};

interface SupabaseSettingsRow {
  id: string;
  organization_name: string;
  operations_hub: string;
  dispatch_phone: string;
  dispatch_email: string;
  service_territory_summary: string;
  routine_hours_weekday: string;
  routine_hours_weekend: string;
  emergency_dispatch_phone: string;
  emergency_response_window: string;
  default_assessment_target_hours: number;
  default_work_order_lead_days: number;
  updated_at: string;
}

/**
 * Maps Supabase public.workspace_settings database row to the UI OperationalSettings model.
 */
function mapSettingsRow(row: SupabaseSettingsRow): OperationalSettings {
  return {
    organizationName: row.organization_name,
    operationsHub: row.operations_hub,
    dispatchPhone: row.dispatch_phone,
    dispatchEmail: row.dispatch_email,
    serviceTerritorySummary: row.service_territory_summary,
    routineHoursWeekday: row.routine_hours_weekday,
    routineHoursWeekend: row.routine_hours_weekend,
    emergencyDispatchPhone: row.emergency_dispatch_phone,
    emergencyResponseWindow: row.emergency_response_window,
    defaultAssessmentTargetHours: row.default_assessment_target_hours,
    defaultWorkOrderLeadDays: row.default_work_order_lead_days,
    version: DEFAULT_SETTINGS.version,
    environment: 'Supabase Cloud (Central Texas)',
  };
}

/**
 * Asynchronously retrieves the singleton workspace operational configuration from Supabase.
 * Governed strictly by PostgreSQL Row-Level Security:
 * - Admin/Manager sessions can SELECT the settings row.
 * - Field Technicians and anonymous users receive zero rows (RLS default deny).
 */
export async function getWorkspaceSettings(): Promise<{
  data: OperationalSettings | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('workspace_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error querying workspace_settings from Supabase:', error.message);
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      console.warn('No workspace_settings record found in Supabase.');
      return { data: null, error: new Error('Workspace settings record not found in database.') };
    }

    const mapped = mapSettingsRow(data as SupabaseSettingsRow);
    return { data: mapped, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected exception in getWorkspaceSettings:', error.message);
    return { data: null, error };
  }
}

/**
 * Updates the existing singleton operational configuration row in Supabase.
 * Governed strictly by PostgreSQL Row-Level Security:
 * - Admin/Manager sessions can UPDATE the settings row.
 * - Field Technicians and anonymous users are blocked by PostgreSQL RLS.
 */
export async function updateWorkspaceSettings(
  settings: Partial<OperationalSettings>
): Promise<{
  data: OperationalSettings | null;
  error: Error | null;
}> {
  try {
    // 1. Identify singleton row ID
    const { data: existingRow, error: findError } = await supabase
      .from('workspace_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('Error locating workspace_settings record:', findError.message);
      return { data: null, error: new Error(findError.message) };
    }

    if (!existingRow) {
      return { data: null, error: new Error('Cannot update settings: singleton row not found.') };
    }

    // 2. Map camelCase partial to database snake_case columns
    const dbPayload: Partial<Omit<SupabaseSettingsRow, 'id'>> = {
      updated_at: new Date().toISOString(),
    };

    if (settings.organizationName !== undefined) dbPayload.organization_name = settings.organizationName;
    if (settings.operationsHub !== undefined) dbPayload.operations_hub = settings.operationsHub;
    if (settings.dispatchPhone !== undefined) dbPayload.dispatch_phone = settings.dispatchPhone;
    if (settings.dispatchEmail !== undefined) dbPayload.dispatch_email = settings.dispatchEmail;
    if (settings.serviceTerritorySummary !== undefined) dbPayload.service_territory_summary = settings.serviceTerritorySummary;
    if (settings.routineHoursWeekday !== undefined) dbPayload.routine_hours_weekday = settings.routineHoursWeekday;
    if (settings.routineHoursWeekend !== undefined) dbPayload.routine_hours_weekend = settings.routineHoursWeekend;
    if (settings.emergencyDispatchPhone !== undefined) dbPayload.emergency_dispatch_phone = settings.emergencyDispatchPhone;
    if (settings.emergencyResponseWindow !== undefined) dbPayload.emergency_response_window = settings.emergencyResponseWindow;
    if (settings.defaultAssessmentTargetHours !== undefined) dbPayload.default_assessment_target_hours = settings.defaultAssessmentTargetHours;
    if (settings.defaultWorkOrderLeadDays !== undefined) dbPayload.default_work_order_lead_days = settings.defaultWorkOrderLeadDays;

    // 3. Execute update targeting singleton ID
    const { data: updatedRow, error: updateError } = await supabase
      .from('workspace_settings')
      .update(dbPayload)
      .eq('id', existingRow.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating workspace_settings in Supabase:', updateError.message);
      return { data: null, error: new Error(updateError.message) };
    }

    const mapped = mapSettingsRow(updatedRow as SupabaseSettingsRow);
    return { data: mapped, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected exception in updateWorkspaceSettings:', error.message);
    return { data: null, error };
  }
}
