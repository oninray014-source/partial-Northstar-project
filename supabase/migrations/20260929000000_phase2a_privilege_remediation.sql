-- ==============================================================================
-- NORTHSTAR FACILITY SERVICES — PHASE 2A: PRIVILEGE REMEDIATION
-- ==============================================================================
-- Target Database: Supabase / PostgreSQL (northstar-facility-services)
-- Purpose: Grant explicit minimum PostgreSQL table, sequence, schema, and function
--          privileges required for Phase 2A RLS policies and application RPCs to function.
--
-- Security Guarantees:
--   - No 'GRANT ALL' statements used.
--   - No TRUNCATE, REFERENCES, or TRIGGER privileges granted.
--   - activity_events is strictly SELECT, INSERT (audit immutability preserved).
--   - workspace_settings is strictly SELECT, INSERT, UPDATE (no DELETE permitted).
--   - RLS policies remain untouched and enforce the locked 2-role RBAC (admin vs technician).
--
-- Execution Rule: Transaction-safe (BEGIN ... COMMIT) and idempotent.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. SCHEMA USAGE
-- ------------------------------------------------------------------------------
-- Allows anon and authenticated roles to resolve objects in the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. COMMERCIAL PROPERTIES
-- ------------------------------------------------------------------------------
-- Authenticated users (Admin/Technician) receive table-level DML.
-- RLS strictly enforces:
--   - Admin: can SELECT all properties, INSERT, UPDATE, DELETE.
--   - Technician: can SELECT active properties only; denied INSERT, UPDATE, DELETE.
-- Anon receives NO privileges.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_properties TO authenticated;

-- ------------------------------------------------------------------------------
-- 3. LEADS (CRM)
-- ------------------------------------------------------------------------------
-- Anon receives INSERT ONLY for public inbound inquiries submitted via /contact.
GRANT INSERT ON public.leads TO anon;

-- Authenticated receives table-level DML for Admin CRM management.
-- RLS strictly enforces:
--   - Admin: can SELECT all leads, INSERT, UPDATE, DELETE.
--   - Technician: completely blocked (zero direct leads access).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;

-- ------------------------------------------------------------------------------
-- 4. WORK ORDERS (Facility Tasks)
-- ------------------------------------------------------------------------------
-- Authenticated receives table-level DML for Admin management.
-- RLS strictly enforces:
--   - Admin: can SELECT all work orders, INSERT, UPDATE, DELETE.
--   - Technician: can SELECT assigned work orders only; direct UPDATE is denied.
--     Technician status updates must use the controlled update_my_work_order_status() RPC.
-- Anon receives NO privileges.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_orders TO authenticated;

-- ------------------------------------------------------------------------------
-- 5. PROFILES (1:1 with auth.users)
-- ------------------------------------------------------------------------------
-- Authenticated receives table-level DML.
-- RLS strictly enforces:
--   - Admin: full profile management and role assignments.
--   - Technician: can SELECT active profiles only; can UPDATE own profile only
--     (role, is_active, and team_member_id are strictly protected by RLS WITH CHECK).
-- Anon receives NO privileges.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- ------------------------------------------------------------------------------
-- 6. ACTIVITY EVENTS (Operational Audit Trail)
-- ------------------------------------------------------------------------------
-- Authenticated receives SELECT and INSERT only.
-- Explicitly NO UPDATE, NO DELETE, NO TRUNCATE to preserve permanent audit immutability.
-- RLS strictly enforces:
--   - Admin: can view all activity events, insert records.
--   - Technician: can view activity for own actions and assigned work orders,
--     insert records where actor_id = auth.uid().
-- Anon receives NO privileges.
GRANT SELECT, INSERT ON public.activity_events TO authenticated;

-- ------------------------------------------------------------------------------
-- 7. WORKSPACE SETTINGS
-- ------------------------------------------------------------------------------
-- Authenticated receives SELECT, INSERT, UPDATE only.
-- Explicitly NO DELETE to protect the singleton operational dispatch configuration.
-- RLS strictly enforces:
--   - Admin: can view and update settings.
--   - Technician: completely denied (zero settings access).
-- Anon receives NO privileges.
GRANT SELECT, INSERT, UPDATE ON public.workspace_settings TO authenticated;

-- ------------------------------------------------------------------------------
-- 8. SEQUENCES
-- ------------------------------------------------------------------------------
-- Anon requires lead_code_seq to generate default 'LEAD-xxxx' codes during /contact submissions.
GRANT USAGE, SELECT ON SEQUENCE public.lead_code_seq TO anon;

-- Authenticated requires sequences to generate default business codes and RPC audit log IDs.
GRANT USAGE, SELECT ON SEQUENCE
  public.lead_code_seq,
  public.work_order_code_seq,
  public.activity_code_seq
TO authenticated;

-- ------------------------------------------------------------------------------
-- 9. FUNCTIONS & RPCS
-- ------------------------------------------------------------------------------
-- Role helper function used in RLS policy evaluation across tables.
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO anon, authenticated;

-- Controlled Technician operational RPCs.
GRANT EXECUTE ON FUNCTION public.update_my_work_order_status(UUID, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_my_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;
