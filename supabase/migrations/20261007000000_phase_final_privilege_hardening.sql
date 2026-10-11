-- ==============================================================================
-- NORTHSTAR FACILITY SERVICES — PHASE FINAL: PRIVILEGE HARDENING (P1-B)
-- ==============================================================================
-- Target Database: Supabase / PostgreSQL (northstar-facility-services)
-- Purpose: Correct the additive privilege gap across all seven core tables by
--          explicitly revoking destructive/schema-altering privileges (TRUNCATE,
--          REFERENCES, TRIGGER) from anon and authenticated, revoking redundant
--          direct table-level INSERT on public.leads from anon, ensuring anon
--          has zero direct table access, and hardening default privileges for
--          future tables in the public schema.
--
-- Security Guarantees:
--   - Transaction-safe (BEGIN ... COMMIT) and idempotent.
--   - Does NOT revoke legitimate authenticated DML (SELECT, INSERT, UPDATE, DELETE).
--   - Does NOT modify RLS policies, schemas, columns, constraints, or functions.
--   - Preserves public.submit_public_inquiry(...) RPC as the sole entrypoint for anon leads.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. HARDEN DESTRUCTIVE / SCHEMA-ALTERING TABLE PRIVILEGES
-- ------------------------------------------------------------------------------
-- Revoke TRUNCATE, REFERENCES, and TRIGGER from both anon and authenticated
-- across all seven core operational tables.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON
  public.profiles,
  public.commercial_properties,
  public.leads,
  public.work_orders,
  public.activity_events,
  public.workspace_settings,
  public.work_order_notes
FROM anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. REMOVE REDUNDANT ANONYMOUS LEADS INSERT
-- ------------------------------------------------------------------------------
-- Public lead inquiries are handled strictly via the SECURITY DEFINER RPC
-- public.submit_public_inquiry(...). Direct table INSERT is no longer required.
REVOKE INSERT ON public.leads FROM anon;

-- ------------------------------------------------------------------------------
-- 3. ENSURE ANON HAS NO DIRECT TABLE ACCESS
-- ------------------------------------------------------------------------------
-- Explicitly revoke all table-level privileges from anon on the other six tables.
REVOKE ALL ON
  public.profiles,
  public.commercial_properties,
  public.work_orders,
  public.activity_events,
  public.workspace_settings,
  public.work_order_notes
FROM anon;

-- Explicitly ensure zero residual privileges for anon on public.leads
REVOKE ALL ON public.leads FROM anon;

-- ------------------------------------------------------------------------------
-- 4. HARDEN DEFAULT PRIVILEGES FOR FUTURE TABLES
-- ------------------------------------------------------------------------------
-- Ensure future tables created in the public schema do not inherit TRUNCATE,
-- REFERENCES, or TRIGGER privileges for anon or authenticated roles.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;

COMMIT;
