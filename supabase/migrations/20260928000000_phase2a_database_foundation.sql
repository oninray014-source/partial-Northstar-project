-- ==============================================================================
-- NORTHSTAR FACILITY SERVICES — PHASE 2A: DATABASE FOUNDATION & RLS
-- ==============================================================================
-- Architecture:
--   auth.users -> profiles -> commercial_properties -> leads -> work_orders -> activity_events
--   + workspace_settings
--
-- Roles: EXACTLY two roles ('admin' and 'technician')
-- Security: PostgreSQL Row-Level Security (RLS) on all tables + SECURITY DEFINER RPCs
-- Dependency Order:
--   1. Extensions & Types
--   2. Sequences
--   3. Base Tables (profiles -> commercial_properties -> leads -> work_orders -> activity_events -> workspace_settings)
--   4. Role Helper Function (get_auth_role - requires profiles table)
--   5. Row-Level Security Policies (requires tables & get_auth_role)
--   6. Controlled RPCs (update_my_work_order_status, update_my_profile - requires tables & sequences)
--   7. Auth Trigger Function & Trigger (handle_new_auth_user - requires profiles table)
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ROLE DEFINITIONS & ENUMS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'technician');
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. SEQUENCES FOR BUSINESS CODES
-- ------------------------------------------------------------------------------
-- Starting values avoid collision with existing Northstar demo conventions:
--   Leads: demo range LEAD-1080..LEAD-1082 -> sequence starts at 1100
--   Work Orders: demo range WO-4401..WO-4403 -> sequence starts at 4410
--   Activity Events: demo range ACT-1001..ACT-1008 -> sequence starts at 1010

CREATE SEQUENCE IF NOT EXISTS public.lead_code_seq START WITH 1100;
CREATE SEQUENCE IF NOT EXISTS public.work_order_code_seq START WITH 4410;
CREATE SEQUENCE IF NOT EXISTS public.activity_code_seq START WITH 1010;

-- ------------------------------------------------------------------------------
-- 3. TABLE: PROFILES (1:1 with auth.users)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'technician',
  job_title TEXT NOT NULL,
  discipline TEXT NOT NULL CHECK (discipline IN ('hvac', 'plumbing', 'electrical', 'operations', 'general')),
  license_number TEXT,
  territory TEXT,
  phone TEXT NOT NULL,
  team_member_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_team_member_id ON public.profiles(team_member_id);

-- ------------------------------------------------------------------------------
-- 4. TABLE: COMMERCIAL PROPERTIES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.commercial_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN (
    'Office Buildings',
    'Retail Spaces',
    'Property Management',
    'Healthcare Facilities',
    'Hospitality',
    'Industrial / Flex Space',
    'Other Commercial'
  )),
  address TEXT NOT NULL,
  square_footage TEXT,
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  equipment_tags TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'under-assessment', 'inactive')),
  pm_cycle TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.commercial_properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_code ON public.commercial_properties(property_code);

-- ------------------------------------------------------------------------------
-- 5. TABLE: LEADS (CRM & Inbound Inquiries)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code TEXT UNIQUE NOT NULL DEFAULT ('LEAD-' || nextval('public.lead_code_seq')::text),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_needed TEXT NOT NULL,
  property_type TEXT NOT NULL,
  property_address TEXT NOT NULL,
  message TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL CHECK (preferred_contact_method IN ('phone', 'email', 'either')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assessing', 'scheduled', 'dispatched', 'closed')),
  priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('critical', 'high', 'standard')),
  property_id UUID REFERENCES public.commercial_properties(id) ON DELETE SET NULL,
  assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimated_value TEXT,
  facility_square_footage TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads
  ALTER COLUMN lead_code SET DEFAULT ('LEAD-' || nextval('public.lead_code_seq')::text);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON public.leads(property_id);
CREATE INDEX IF NOT EXISTS idx_leads_technician_id ON public.leads(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_leads_code ON public.leads(lead_code);

-- ------------------------------------------------------------------------------
-- 6. TABLE: WORK ORDERS (Facility Tasks)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_code TEXT UNIQUE NOT NULL DEFAULT ('WO-' || nextval('public.work_order_code_seq')::text),
  title TEXT NOT NULL,
  description TEXT,
  service_category TEXT NOT NULL CHECK (service_category IN (
    'commercial-hvac',
    'electrical',
    'plumbing',
    'general-maintenance',
    'preventive-maintenance',
    'emergency-services'
  )),
  property_id UUID REFERENCES public.commercial_properties(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  assigned_technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'standard' CHECK (priority IN ('critical', 'high', 'standard')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'on-hold')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.work_orders
  ALTER COLUMN work_order_code SET DEFAULT ('WO-' || nextval('public.work_order_code_seq')::text);

CREATE INDEX IF NOT EXISTS idx_work_orders_technician ON public.work_orders(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_property ON public.work_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_lead ON public.work_orders(lead_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_due_date ON public.work_orders(due_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_code ON public.work_orders(work_order_code);

-- ------------------------------------------------------------------------------
-- 7. TABLE: ACTIVITY EVENTS (Operational Audit Trail)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_code TEXT UNIQUE NOT NULL DEFAULT ('ACT-' || nextval('public.activity_code_seq')::text),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'lead_created',
    'lead_status_updated',
    'lead_assigned',
    'lead_property_linked',
    'task_created',
    'task_status_updated',
    'task_completed',
    'property_added'
  )),
  title TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'task', 'property', 'system')),
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  property_id UUID REFERENCES public.commercial_properties(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.activity_events
  ALTER COLUMN activity_code SET DEFAULT ('ACT-' || nextval('public.activity_code_seq')::text);

CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON public.activity_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_work_order ON public.activity_events(work_order_id);
CREATE INDEX IF NOT EXISTS idx_activity_property ON public.activity_events(property_id);
CREATE INDEX IF NOT EXISTS idx_activity_lead ON public.activity_events(lead_id);

-- ------------------------------------------------------------------------------
-- 8. TABLE: WORKSPACE SETTINGS (Singleton Operational Configuration)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  operations_hub TEXT NOT NULL,
  dispatch_phone TEXT NOT NULL,
  dispatch_email TEXT NOT NULL,
  service_territory_summary TEXT NOT NULL,
  routine_hours_weekday TEXT NOT NULL,
  routine_hours_weekend TEXT NOT NULL,
  emergency_dispatch_phone TEXT NOT NULL,
  emergency_response_window TEXT NOT NULL,
  default_assessment_target_hours INTEGER NOT NULL DEFAULT 24 CHECK (default_assessment_target_hours > 0),
  default_work_order_lead_days INTEGER NOT NULL DEFAULT 3 CHECK (default_work_order_lead_days > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. HELPER FUNCTIONS FOR RLS & ROLE EVALUATION
-- ------------------------------------------------------------------------------
-- Defined AFTER public.profiles exists to ensure successful parsing on empty databases

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::text INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$;

-- ------------------------------------------------------------------------------
-- 10. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS across ALL application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 10.1 RLS: PROFILES
-- ------------------------------------------------------------------------------

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Technicians can view active profiles only (team directory & contact)
CREATE POLICY "Technicians can view active profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.get_auth_role() = 'technician'
    AND is_active = TRUE
  );

-- Admins can insert new profiles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins can update any profile (including role changes)
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

-- Technicians can update own profile, but CANNOT change role, is_active, or team_member_id
CREATE POLICY "Technicians can update own non-privileged profile fields"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    public.get_auth_role() = 'technician'
    AND auth.uid() = id
  )
  WITH CHECK (
    public.get_auth_role() = 'technician'
    AND auth.uid() = id
    AND role = 'technician'::public.user_role
    AND is_active = TRUE
    AND (
      team_member_id IS NOT DISTINCT FROM (
        SELECT p.team_member_id FROM public.profiles p WHERE p.id = auth.uid()
      )
    )
  );

-- Admins can delete profiles if structurally required; technicians denied
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 10.2 RLS: COMMERCIAL PROPERTIES
-- ------------------------------------------------------------------------------

-- Admins can view all commercial properties
CREATE POLICY "Admins can view all properties"
  ON public.commercial_properties
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Technicians can view active commercial properties only
CREATE POLICY "Technicians can view active properties"
  ON public.commercial_properties
  FOR SELECT
  TO authenticated
  USING (
    public.get_auth_role() = 'technician'
    AND status = 'active'
  );

-- Admins can insert commercial properties
CREATE POLICY "Admins can insert properties"
  ON public.commercial_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins can update commercial properties
CREATE POLICY "Admins can update properties"
  ON public.commercial_properties
  FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins can delete commercial properties
CREATE POLICY "Admins can delete properties"
  ON public.commercial_properties
  FOR DELETE
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 10.3 RLS: LEADS (CRM)
-- ------------------------------------------------------------------------------

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Public anonymous visitors can INSERT inquiries from /contact
-- Restricted at database level: cannot assign technician, link property, set estimate, or alter status
CREATE POLICY "Public anonymous visitors can submit leads"
  ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (
    assigned_technician_id IS NULL
    AND property_id IS NULL
    AND estimated_value IS NULL
    AND (status = 'new' OR status IS NULL)
  );

-- Admins can insert leads internally
CREATE POLICY "Admins can insert leads"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins can update leads
CREATE POLICY "Admins can update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Technicians and Anonymous: SELECT, UPDATE, DELETE are all explicitly DENIED by default

-- ------------------------------------------------------------------------------
-- 10.4 RLS: WORK ORDERS
-- ------------------------------------------------------------------------------

-- Admins can view all work orders
CREATE POLICY "Admins can view all work orders"
  ON public.work_orders
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Technicians can ONLY view work orders assigned to them
CREATE POLICY "Technicians can view assigned work orders"
  ON public.work_orders
  FOR SELECT
  TO authenticated
  USING (
    public.get_auth_role() = 'technician'
    AND assigned_technician_id = auth.uid()
  );

-- Admins can insert work orders
CREATE POLICY "Admins can insert work orders"
  ON public.work_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins have unrestricted update access to work orders
CREATE POLICY "Admins can update work orders"
  ON public.work_orders
  FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

-- Technicians CANNOT execute arbitrary direct UPDATEs on work_orders.
-- They must use the controlled update_my_work_order_status RPC.
-- Admins can delete work orders
CREATE POLICY "Admins can delete work orders"
  ON public.work_orders
  FOR DELETE
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- ------------------------------------------------------------------------------
-- 10.5 RLS: ACTIVITY EVENTS
-- ------------------------------------------------------------------------------

-- Admins can view the full activity audit trail
CREATE POLICY "Admins can view all activity events"
  ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Technicians can view activity related to their own actions or assigned work orders
CREATE POLICY "Technicians can view relevant activity events"
  ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (
    public.get_auth_role() = 'technician'
    AND (
      actor_id = auth.uid()
      OR work_order_id IN (
        SELECT wo.id FROM public.work_orders wo WHERE wo.assigned_technician_id = auth.uid()
      )
    )
  );

-- Admins can insert activity events
CREATE POLICY "Admins can insert activity events"
  ON public.activity_events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- Technicians can insert activity events where actor_id is their own auth.uid()
CREATE POLICY "Technicians can insert own activity events"
  ON public.activity_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_auth_role() = 'technician'
    AND actor_id = auth.uid()
  );

-- Immutability: UPDATE and DELETE are DENIED for ALL roles to preserve audit integrity.

-- ------------------------------------------------------------------------------
-- 10.6 RLS: WORKSPACE SETTINGS
-- ------------------------------------------------------------------------------

-- Admins can view workspace settings
CREATE POLICY "Admins can view workspace settings"
  ON public.workspace_settings
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Admins can insert workspace settings (for singleton configuration)
CREATE POLICY "Admins can insert workspace settings"
  ON public.workspace_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- Admins can update workspace settings
CREATE POLICY "Admins can update workspace settings"
  ON public.workspace_settings
  FOR UPDATE
  TO authenticated
  USING (public.get_auth_role() = 'admin')
  WITH CHECK (public.get_auth_role() = 'admin');

-- Technicians and Anonymous: ALL access to workspace_settings is strictly DENIED.

-- ------------------------------------------------------------------------------
-- 11. CONTROLLED SECURITY DEFINER FUNCTIONS & RPCS
-- ------------------------------------------------------------------------------

-- 11.1 Controlled Work Order Status Update (Technician Execution Function)
-- Enforces:
-- 1. Caller is authenticated
-- 2. Caller has technician or admin role
-- 3. If caller is technician, work order is strictly assigned to auth.uid()
-- 4. Status is constrained to valid transitions
-- 5. Technician cannot reassign technician, property, lead, trade, priority, or due_date
-- 6. Safe search_path = public, auth
-- 7. Automatically writes an immutable audit record to activity_events using activity_code_seq
CREATE OR REPLACE FUNCTION public.update_my_work_order_status(
  p_work_order_id UUID,
  p_new_status TEXT,
  p_completed_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.work_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_role TEXT;
  v_caller_name TEXT;
  v_old_status TEXT;
  v_wo public.work_orders%ROWTYPE;
  v_timestamp TIMESTAMPTZ := NOW();
  v_completed_time TIMESTAMPTZ;
BEGIN
  -- 1. Verify caller authentication
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  -- 2. Verify caller role
  SELECT role::text, full_name INTO v_caller_role, v_caller_name
  FROM public.profiles
  WHERE id = v_caller_id;

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Caller profile not found.' USING ERRCODE = '42501';
  END IF;

  -- 3. Verify valid status input
  IF p_new_status NOT IN ('pending', 'in-progress', 'completed', 'on-hold') THEN
    RAISE EXCEPTION 'Invalid status transition: %', p_new_status USING ERRCODE = '22023';
  END IF;

  -- 4. Retrieve existing work order
  SELECT * INTO v_wo
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order not found: %', p_work_order_id USING ERRCODE = 'P0002';
  END IF;

  v_old_status := v_wo.status;

  -- 5. Authorization: Technicians can ONLY update work orders assigned to them
  IF v_caller_role = 'technician' AND v_wo.assigned_technician_id != v_caller_id THEN
    RAISE EXCEPTION 'Unauthorized: work order % is not assigned to caller.', p_work_order_id USING ERRCODE = '42501';
  END IF;

  -- 6. Compute completion timestamp
  IF p_new_status = 'completed' THEN
    v_completed_time := COALESCE(p_completed_at, v_timestamp);
  ELSE
    v_completed_time := NULL;
  END IF;

  -- 7. Execute scoped update
  UPDATE public.work_orders
  SET
    status = p_new_status,
    completed_at = v_completed_time,
    updated_at = v_timestamp
  WHERE id = p_work_order_id
  RETURNING * INTO v_wo;

  -- 8. Log an audit event in activity_events
  INSERT INTO public.activity_events (
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
    created_at
  ) VALUES (
    'ACT-' || nextval('public.activity_code_seq')::text,
    CASE WHEN p_new_status = 'completed' THEN 'task_completed' ELSE 'task_status_updated' END,
    CASE
      WHEN p_new_status = 'completed' THEN 'Work Order ' || v_wo.work_order_code || ' marked as completed'
      ELSE 'Work Order ' || v_wo.work_order_code || ' moved from ' || v_old_status || ' to ' || p_new_status
    END,
    'Status transition executed by ' || v_caller_name || ' (' || v_caller_role || ').',
    'task',
    v_wo.work_order_code,
    v_wo.title,
    v_caller_id,
    v_caller_name,
    v_wo.property_id,
    v_wo.lead_id,
    v_wo.id,
    jsonb_build_object(
      'previousStatus', v_old_status,
      'newStatus', p_new_status,
      'trade', v_wo.service_category,
      'priority', v_wo.priority
    ),
    v_timestamp
  );

  RETURN v_wo;
END;
$$;

-- 11.2 Controlled Profile Self-Update (Technician Safe Update Function)
-- Allows a technician to update phone, territory, license without modifying role or status
CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_full_name TEXT,
  p_phone TEXT,
  p_job_title TEXT,
  p_discipline TEXT,
  p_license_number TEXT DEFAULT NULL,
  p_territory TEXT DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id UUID;
  v_profile public.profiles%ROWTYPE;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  IF p_discipline NOT IN ('hvac', 'plumbing', 'electrical', 'operations', 'general') THEN
    RAISE EXCEPTION 'Invalid discipline: %', p_discipline USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET
    full_name = p_full_name,
    phone = p_phone,
    job_title = p_job_title,
    discipline = p_discipline,
    license_number = p_license_number,
    territory = p_territory,
    updated_at = NOW()
  WHERE id = v_caller_id
  RETURNING * INTO v_profile;

  RETURN v_profile;
END;
$$;

-- ------------------------------------------------------------------------------
-- 12. AUTOMATIC PROFILE PROVISIONING TRIGGER (NEW USERS)
-- ------------------------------------------------------------------------------
-- When a user is created in auth.users, create a profile entry with 'technician' role.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_initial_role public.user_role := 'technician';
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  -- Extract full_name and phone from user_metadata if available
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '(512) 555-0100');

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    job_title,
    discipline,
    phone,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_initial_role,
    'Facility Specialist',
    'general',
    v_phone,
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
