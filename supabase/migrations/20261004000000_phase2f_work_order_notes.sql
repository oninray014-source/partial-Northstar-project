-- ==============================================================================
-- NORTHSTAR FACILITY SERVICES — PHASE 2F STEP 1: WORK ORDER JOB NOTES
-- ==============================================================================
-- Target Database: Supabase / PostgreSQL (northstar-facility-services)
-- Purpose: Create the database foundation for chronological, append-only
--          Work Order Job Notes.
--
-- Business Concept:
--   - Job Notes document the ongoing operational narrative of a Work Order:
--     work performed, diagnostic findings, unexpected site conditions,
--     client requests, hold reasons, follow-ups, and technician handoff details.
--   - Separate from the stable baseline 'description' in public.work_orders.
--   - Separate from system-level audit events in public.activity_events.
--   - Strictly append-only: historical entries cannot be updated or deleted.
--
-- Security Model (Two Workspace Roles: Admin & Technician):
--   - Admin / Manager:
--       SELECT: Permitted for all Work Order notes.
--       INSERT: Permitted for all accessible Work Orders.
--       UPDATE: Denied.
--       DELETE: Denied.
--   - Staff / Technician:
--       SELECT: Permitted ONLY for notes belonging to Work Orders assigned to auth.uid().
--       INSERT: Permitted ONLY for Work Orders assigned to auth.uid(), with author_id = auth.uid().
--       UPDATE: Denied.
--       DELETE: Denied.
--
-- Attribution Integrity:
--   - author_name and author_role capture an immutable attribution snapshot
--     so historical records retain author identity even if a profile is updated or removed.
--
-- Execution Rule: Transaction-safe (BEGIN ... COMMIT) and idempotent.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABLE: WORK ORDER NOTES
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.work_order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT 'technician' CHECK (author_role IN ('admin', 'technician')),
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------------------------

-- Optimized for retrieving a Work Order's notes in chronological timeline sequence
CREATE INDEX IF NOT EXISTS idx_wo_notes_order_created
  ON public.work_order_notes(work_order_id, created_at ASC);

-- Index for technician/author lookup
CREATE INDEX IF NOT EXISTS idx_wo_notes_author
  ON public.work_order_notes(author_id);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.work_order_notes ENABLE ROW LEVEL SECURITY;

-- 3.1 ADMIN POLICIES
-- Admins can view all job notes company-wide
CREATE POLICY "Admins can view all work order notes"
  ON public.work_order_notes
  FOR SELECT
  TO authenticated
  USING (public.get_auth_role() = 'admin');

-- Admins can insert job notes on any work order
CREATE POLICY "Admins can insert work order notes"
  ON public.work_order_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_auth_role() = 'admin');

-- 3.2 TECHNICIAN POLICIES
-- Technicians can view notes ONLY for work orders currently assigned to them
CREATE POLICY "Technicians can view notes on assigned work orders"
  ON public.work_order_notes
  FOR SELECT
  TO authenticated
  USING (
    public.get_auth_role() = 'technician'
    AND work_order_id IN (
      SELECT wo.id FROM public.work_orders wo
      WHERE wo.assigned_technician_id = auth.uid()
    )
  );

-- Technicians can insert notes ONLY on work orders currently assigned to them,
-- and author_id must strictly match the authenticated user (preventing spoofing)
CREATE POLICY "Technicians can insert notes on assigned work orders"
  ON public.work_order_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_auth_role() = 'technician'
    AND author_id = auth.uid()
    AND work_order_id IN (
      SELECT wo.id FROM public.work_orders wo
      WHERE wo.assigned_technician_id = auth.uid()
    )
  );

-- 3.3 IMMUTABILITY GUARANTEE
-- UPDATE and DELETE policies are deliberately OMITTED.
-- Under PostgreSQL RLS, omitting UPDATE and DELETE policies enforces strict
-- append-only immutability for all authenticated users and roles.

-- ------------------------------------------------------------------------------
-- 4. PRIVILEGES & GRANTS
-- ------------------------------------------------------------------------------

-- Authenticated receives SELECT and INSERT only.
-- Explicitly NO UPDATE, NO DELETE, NO TRUNCATE, NO REFERENCES, NO TRIGGER.
GRANT SELECT, INSERT ON public.work_order_notes TO authenticated;

-- Anon receives ZERO privileges (no anonymous Job Notes workflow exists).

COMMIT;
