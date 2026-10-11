# Northstar Facility Services — Database Architecture & Operations Guide

## Phase 2A: Database Foundation & RLS

This directory contains the production-grade PostgreSQL / Supabase migration artifacts for Northstar Facility Services.

### Artifacts:
- `supabase/migrations/20260928000000_phase2a_database_foundation.sql`: Full DDL, constraints, indexes, RLS policies, and SECURITY DEFINER RPC functions.

---

## First-Admin Bootstrap Instructions

Northstar enforces a strict two-role model (`admin` and `technician`). To avoid storing default credentials or passwords in source control, follow this bootstrap procedure:

### Step 1: Create the User Account in Supabase Auth
In your Supabase Dashboard (`northstar-facility-services`):
1. Navigate to **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Enter the initial administrator email (e.g., `sarah.jenkins@northstarfacilities.com` or your operator email) and assign a strong password.
4. Confirm user creation.

### Step 2: Elevate the User to the `admin` Role
Because new signups default to `technician` via the `handle_new_auth_user()` trigger, run the following SQL command in the **Supabase SQL Editor**:

```sql
-- 1. Identify the user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@northstarfacilities.com';

-- 2. Update their profile to 'admin'
UPDATE public.profiles
SET
  role = 'admin',
  full_name = 'Sarah Jenkins',
  job_title = 'Operations & Dispatch Coordinator',
  discipline = 'operations',
  phone = '(512) 555-0120',
  territory = 'Austin Central HQ',
  team_member_id = 'TM-04',
  is_active = TRUE,
  updated_at = NOW()
WHERE email = 'YOUR_ADMIN_EMAIL@northstarfacilities.com';

-- 3. Verify role assignment
SELECT id, email, full_name, role, job_title, team_member_id FROM public.profiles WHERE email = 'YOUR_ADMIN_EMAIL@northstarfacilities.com';
```

---

## Verifying Database RLS Policies

Run the following diagnostics in the **Supabase SQL Editor** to verify policies:

```sql
-- Check RLS status across all application tables (all must be TRUE)
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'commercial_properties', 'leads', 'work_orders', 'activity_events', 'workspace_settings');

-- Check that policies are registered
SELECT
  tablename,
  policyname,
  roles,
  cmd,
  permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```
