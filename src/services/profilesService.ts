import { supabase } from '../lib/supabaseClient';

export interface SupabaseProfileRow {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'technician';
  job_title: string;
  discipline: 'hvac' | 'plumbing' | 'electrical' | 'operations' | 'general';
  license_number: string | null;
  territory: string | null;
  phone: string;
  team_member_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DISCIPLINE_LABELS: Record<string, string> = {
  hvac: 'Commercial HVAC',
  plumbing: 'Commercial Plumbing',
  electrical: 'Commercial Electrical',
  operations: 'Operations & Dispatch',
  general: 'General Maintenance'
};

export interface TeamMemberProfile {
  id: string; // team_member_id || id
  profileId: string; // UUID primary key
  name: string;
  title: string;
  discipline: 'hvac' | 'plumbing' | 'electrical' | 'operations' | 'general';
  disciplineLabel: string;
  licenseNumber?: string;
  territory: string;
  email: string;
  phone: string;
  role: 'admin' | 'technician';
  isActive: boolean;
}

/**
 * Asynchronously retrieves active profiles from public.profiles for the Team directory.
 * Governed automatically by Supabase Row-Level Security:
 * - Admin users can view all profiles.
 * - Technicians can view active profiles only.
 */
export async function getTeamProfiles(): Promise<{
  data: TeamMemberProfile[];
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, job_title, discipline, license_number, territory, phone, team_member_id, is_active')
      .eq('is_active', true)
      .order('team_member_id', { ascending: true, nullsFirst: false })
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching team profiles from Supabase:', error.message);
      return { data: [], error: new Error(error.message) };
    }

    const profiles: TeamMemberProfile[] = ((data || []) as unknown as SupabaseProfileRow[]).map((row) => ({
      id: row.team_member_id || row.id,
      profileId: row.id,
      name: row.full_name,
      title: row.job_title || 'Facility Specialist',
      discipline: (row.discipline as TeamMemberProfile['discipline']) || 'general',
      disciplineLabel: DISCIPLINE_LABELS[row.discipline] || 'General Maintenance',
      licenseNumber: row.license_number || undefined,
      territory: row.territory || 'Central Texas Region',
      email: row.email,
      phone: row.phone || '(512) 555-0100',
      role: row.role as 'admin' | 'technician',
      isActive: row.is_active,
    }));

    return { data: profiles, error: null };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Unexpected error in getTeamProfiles:', error.message);
    return { data: [], error };
  }
}
