-- ==============================================================================
-- NORTHSTAR FACILITY SERVICES — PHASE 2B.2 SEED ARTIFACT
-- ==============================================================================
-- Target Database: Supabase / PostgreSQL (northstar-facility-services)
-- Purpose: Seed canonical demo dataset for Northstar commercial facility operations.
--
-- Data Entities Seeded:
--   1. Commercial Properties (3 properties: PROP-201, PROP-202, PROP-203)
--   2. CRM Leads (3 inbound inquiries: LEAD-1082, LEAD-1081, LEAD-1080)
--   3. Work Orders (3 facility tasks: WO-4401, WO-4402, WO-4403)
--   4. Activity Events (8 operational audit trail records: ACT-1001..ACT-1008)
--   5. Workspace Settings (1 operational configuration singleton)
--
-- Security & Auth Architecture:
--   - The real application administrator / owner account is NEVER modified.
--   - public.profiles.id strictly references auth.users(id).
--   - No fake passwords or phantom auth.users records are generated.
--   - All 4 demo team members (Sarah Jenkins, Derrick Miller, Robert Ramos,
--     Michael Torres) are treated as deferred demo profiles.
--   - Foreign-key assignments (assigned_technician_id, actor_id) resolve dynamically
--     via full_name lookup to NULL if their respective demo profiles do not yet exist,
--     guaranteeing clean, error-free execution while preserving relational integrity.
--   - Activity event actor_name strings are permanently preserved (e.g., 'Sarah Jenkins',
--     'Derrick Miller', 'System (Public Portal)') regardless of profile presence.
--
-- Execution Rule: Transaction-safe (BEGIN ... COMMIT) and idempotent (ON CONFLICT).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. SEED COMMERCIAL PROPERTIES
-- ------------------------------------------------------------------------------
-- 3 core demonstration commercial assets across Austin & Central Texas

INSERT INTO public.commercial_properties (
  property_code,
  name,
  client_company,
  property_type,
  address,
  square_footage,
  primary_contact_name,
  primary_contact_email,
  primary_contact_phone,
  equipment_tags,
  status,
  pm_cycle,
  created_at,
  updated_at
) VALUES
  (
    'PROP-201',
    'Brazos Tower Center',
    'Capital Crest Property Partners',
    'Office Buildings',
    '701 Brazos St, Austin, TX 78701',
    '185,000 sq ft',
    'Marcus Vance',
    'm.vance@capitalcrestprop.com',
    '(512) 555-0149',
    ARRAY['6 RTU Packaged Units', '2 Chillers']::text[],
    'active',
    'Quarterly',
    '2026-08-15 00:00:00+00',
    NOW()
  ),
  (
    'PROP-202',
    'Arboretum Market Retail Center',
    'Arboretum Commercial Retail',
    'Retail Spaces',
    '10000 Research Blvd, Austin, TX 78759',
    '120,000 sq ft',
    'Elena Rostova',
    'elena@thearboretumretail.com',
    '(512) 555-0872',
    ARRAY['14 Rooftop Units', '3 Grease Interceptors']::text[],
    'active',
    'Monthly',
    '2026-08-20 00:00:00+00',
    NOW()
  ),
  (
    'PROP-203',
    'Lakeway Medical Arts Pavilion',
    'Lakeway Medical Arts Pavilion',
    'Healthcare Facilities',
    '2300 S FM 620, Lakeway, TX 78734',
    '42,000 sq ft',
    'Dr. Gregory Chen',
    'gchen@lakewaymedicalarts.com',
    '(512) 555-0391',
    ARRAY['HEPA Air Handlers', 'Backflow Isolators']::text[],
    'active',
    'Bi-Monthly',
    '2026-08-25 00:00:00+00',
    NOW()
  )
ON CONFLICT (property_code) DO UPDATE SET
  name = EXCLUDED.name,
  client_company = EXCLUDED.client_company,
  property_type = EXCLUDED.property_type,
  address = EXCLUDED.address,
  square_footage = EXCLUDED.square_footage,
  primary_contact_name = EXCLUDED.primary_contact_name,
  primary_contact_email = EXCLUDED.primary_contact_email,
  primary_contact_phone = EXCLUDED.primary_contact_phone,
  equipment_tags = EXCLUDED.equipment_tags,
  status = EXCLUDED.status,
  pm_cycle = EXCLUDED.pm_cycle,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. SEED CRM LEADS
-- ------------------------------------------------------------------------------
-- 3 commercial inquiries referencing commercial properties and assigned specialists

INSERT INTO public.leads (
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
  updated_at
) VALUES
  (
    'LEAD-1082',
    'Marcus Vance',
    'm.vance@capitalcrest.com',
    'Capital Crest Property Partners',
    '(512) 555-0149',
    'commercial-hvac',
    'Office Buildings',
    '701 Brazos St, Suite 400, Austin, TX 78701',
    'Rooftop unit #3 is showing compressor fault on the BMS. Tenant on floor 4 reporting warm ambient temperatures in conference wing.',
    'phone',
    'assessing',
    'high',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-201' LIMIT 1),
    (SELECT id FROM public.profiles WHERE full_name = 'Derrick Miller' LIMIT 1),
    '$3,800',
    '85,000 sq ft',
    '2026-09-20 14:32:00+00',
    NOW()
  ),
  (
    'LEAD-1081',
    'Elena Rostova',
    'elena@thearboretumretail.com',
    'Arboretum Commercial Retail',
    '(512) 555-0872',
    'preventive-maintenance',
    'Retail Spaces',
    '10000 Research Blvd, Austin, TX 78759',
    'Looking for a unified vendor proposal for quarterly mechanical filter replacements, roof drain clearances, and exterior canopy checks for 6 retail pads.',
    'email',
    'new',
    'standard',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-202' LIMIT 1),
    (SELECT id FROM public.profiles WHERE full_name = 'Sarah Jenkins' LIMIT 1),
    '$14,500 / yr',
    '120,000 sq ft',
    '2026-09-19 10:15:00+00',
    NOW()
  ),
  (
    'LEAD-1080',
    'Dr. Gregory Chen',
    'gchen@lakewaymedicalarts.com',
    'Lakeway Medical Arts Pavilion',
    '(512) 555-0391',
    'plumbing',
    'Healthcare Facilities',
    '2300 S FM 620, Lakeway, TX 78734',
    'Annual city backflow preventer inspection due next week on both main domestic feed and fire suppression isolation valves.',
    'either',
    'scheduled',
    'standard',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-203' LIMIT 1),
    (SELECT id FROM public.profiles WHERE full_name = 'Robert Ramos' LIMIT 1),
    '$1,200',
    '42,000 sq ft',
    '2026-09-18 08:45:00+00',
    NOW()
  )
ON CONFLICT (lead_code) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  company = EXCLUDED.company,
  phone = EXCLUDED.phone,
  service_needed = EXCLUDED.service_needed,
  property_type = EXCLUDED.property_type,
  property_address = EXCLUDED.property_address,
  message = EXCLUDED.message,
  preferred_contact_method = EXCLUDED.preferred_contact_method,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  property_id = EXCLUDED.property_id,
  assigned_technician_id = EXCLUDED.assigned_technician_id,
  estimated_value = EXCLUDED.estimated_value,
  facility_square_footage = EXCLUDED.facility_square_footage,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 3. SEED WORK ORDERS (FACILITY TASKS)
-- ------------------------------------------------------------------------------
-- 3 dispatched/pending work orders linked to properties, leads, and technicians

INSERT INTO public.work_orders (
  work_order_code,
  title,
  description,
  service_category,
  property_id,
  lead_id,
  assigned_technician_id,
  priority,
  status,
  due_date,
  completed_at,
  created_at,
  updated_at
) VALUES
  (
    'WO-4401',
    'Replace bad contactor on RTU #3',
    'Rooftop unit #3 compressor fault. Replace bad contactor, inspect wiring harness, and perform coil wash on packaged unit.',
    'commercial-hvac',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-201' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1082' LIMIT 1),
    (SELECT id FROM public.profiles WHERE full_name = 'Derrick Miller' LIMIT 1),
    'high',
    'in-progress',
    '2026-09-28',
    NULL,
    '2026-09-20 15:00:00+00',
    NOW()
  ),
  (
    'WO-4402',
    'Perform backflow preventer testing',
    'Annual city certified backflow prevention test on domestic main feed and clinic isolation check valves.',
    'plumbing',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-203' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1080' LIMIT 1),
    (SELECT id FROM public.profiles WHERE full_name = 'Robert Ramos' LIMIT 1),
    'standard',
    'pending',
    '2026-09-29',
    NULL,
    '2026-09-18 09:30:00+00',
    NOW()
  ),
  (
    'WO-4403',
    'Complete canopy lighting and quarterly PM',
    'Ballast replacement on exterior canopy lighting bank B and quarterly mechanical inspection across retail units.',
    'preventive-maintenance',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-202' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1081' LIMIT 1),
    (SELECT id FROM public.profiles WHERE full_name = 'Michael Torres' LIMIT 1),
    'standard',
    'pending',
    '2026-09-30',
    NULL,
    '2026-09-19 11:00:00+00',
    NOW()
  )
ON CONFLICT (work_order_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  service_category = EXCLUDED.service_category,
  property_id = EXCLUDED.property_id,
  lead_id = EXCLUDED.lead_id,
  assigned_technician_id = EXCLUDED.assigned_technician_id,
  priority = EXCLUDED.priority,
  status = EXCLUDED.status,
  due_date = EXCLUDED.due_date,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 4. SEED ACTIVITY EVENTS (OPERATIONAL AUDIT TRAIL)
-- ------------------------------------------------------------------------------
-- 8 historical activity records tracking inquiries, linkages, and work orders
-- Actor IDs resolve to matching profiles or NULL, preserving explicit actor names.

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
) VALUES
  (
    'ACT-1008',
    'task_status_updated',
    'Work Order WO-4401 in diagnostic disassembly',
    'Commenced diagnostic disassembly of RTU #3 contactor at Brazos Tower Center.',
    'task',
    'WO-4401',
    'Brazos Tower Center',
    (SELECT id FROM public.profiles WHERE full_name = 'Derrick Miller' LIMIT 1),
    'Derrick Miller',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-201' LIMIT 1),
    NULL,
    (SELECT id FROM public.work_orders WHERE work_order_code = 'WO-4401' LIMIT 1),
    '{"previousStatus": "pending", "newStatus": "in-progress", "trade": "commercial-hvac", "priority": "high"}'::jsonb,
    '2026-09-27 10:15:00+00'
  ),
  (
    'ACT-1007',
    'lead_property_linked',
    'Inquiry LEAD-1082 linked to Brazos Tower Center',
    'Linked inquiry from Capital Crest to commercial asset PROP-201 (Brazos Tower Center).',
    'lead',
    'LEAD-1082',
    'Capital Crest Property Partners',
    (SELECT id FROM public.profiles WHERE full_name = 'Sarah Jenkins' LIMIT 1),
    'Sarah Jenkins',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-201' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1082' LIMIT 1),
    NULL,
    '{"trade": "commercial-hvac", "priority": "high"}'::jsonb,
    '2026-09-26 16:30:00+00'
  ),
  (
    'ACT-1006',
    'task_created',
    'Work Order WO-4403 generated',
    'Dispatched work order for exterior canopy lighting and quarterly mechanical inspection at Arboretum.',
    'task',
    'WO-4403',
    'Arboretum Market Retail Center',
    (SELECT id FROM public.profiles WHERE full_name = 'Sarah Jenkins' LIMIT 1),
    'Sarah Jenkins',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-202' LIMIT 1),
    NULL,
    (SELECT id FROM public.work_orders WHERE work_order_code = 'WO-4403' LIMIT 1),
    '{"newStatus": "pending", "trade": "preventive-maintenance", "priority": "standard"}'::jsonb,
    '2026-09-25 14:00:00+00'
  ),
  (
    'ACT-1005',
    'lead_assigned',
    'Inquiry LEAD-1080 assigned to Master Plumber',
    'Allocated Master Plumber Robert Ramos (RMP #4102) for Lakeway backflow test.',
    'lead',
    'LEAD-1080',
    'Lakeway Medical Arts Pavilion',
    (SELECT id FROM public.profiles WHERE full_name = 'Sarah Jenkins' LIMIT 1),
    'Sarah Jenkins',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-203' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1080' LIMIT 1),
    NULL,
    '{"trade": "plumbing", "priority": "standard"}'::jsonb,
    '2026-09-24 11:20:00+00'
  ),
  (
    'ACT-1004',
    'task_created',
    'Work Order WO-4402 generated',
    'Generated backflow preventer inspection work order for Lakeway Medical Pavilion.',
    'task',
    'WO-4402',
    'Lakeway Medical Arts Pavilion',
    (SELECT id FROM public.profiles WHERE full_name = 'Sarah Jenkins' LIMIT 1),
    'Sarah Jenkins',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-203' LIMIT 1),
    NULL,
    (SELECT id FROM public.work_orders WHERE work_order_code = 'WO-4402' LIMIT 1),
    '{"newStatus": "pending", "trade": "plumbing", "priority": "standard"}'::jsonb,
    '2026-09-22 08:45:00+00'
  ),
  (
    'ACT-1003',
    'lead_created',
    'Commercial inquiry received from Capital Crest',
    'Urgent HVAC cooling fault inquiry submitted by Marcus Vance (Capital Crest Property Partners).',
    'lead',
    'LEAD-1082',
    'Capital Crest Property Partners',
    NULL,
    'System (Public Portal)',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-201' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1082' LIMIT 1),
    NULL,
    '{"newStatus": "assessing", "trade": "commercial-hvac", "priority": "high"}'::jsonb,
    '2026-09-20 14:32:00+00'
  ),
  (
    'ACT-1002',
    'lead_created',
    'Preventive maintenance inquiry received from Arboretum',
    'Commercial preventive maintenance inquiry submitted by Elena Rostova (Arboretum Retail Center).',
    'lead',
    'LEAD-1081',
    'Arboretum Commercial Retail',
    NULL,
    'System (Public Portal)',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-202' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1081' LIMIT 1),
    NULL,
    '{"newStatus": "new", "trade": "preventive-maintenance", "priority": "standard"}'::jsonb,
    '2026-09-19 10:15:00+00'
  ),
  (
    'ACT-1001',
    'lead_created',
    'Commercial plumbing inquiry received from Lakeway',
    'Annual city backflow preventer inspection request submitted by Dr. Gregory Chen.',
    'lead',
    'LEAD-1080',
    'Lakeway Medical Arts Pavilion',
    NULL,
    'System (Public Portal)',
    (SELECT id FROM public.commercial_properties WHERE property_code = 'PROP-203' LIMIT 1),
    (SELECT id FROM public.leads WHERE lead_code = 'LEAD-1080' LIMIT 1),
    NULL,
    '{"newStatus": "scheduled", "trade": "plumbing", "priority": "standard"}'::jsonb,
    '2026-09-18 08:45:00+00'
  )
ON CONFLICT (activity_code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  entity_type = EXCLUDED.entity_type,
  entity_id = EXCLUDED.entity_id,
  entity_name = EXCLUDED.entity_name,
  actor_id = EXCLUDED.actor_id,
  actor_name = EXCLUDED.actor_name,
  property_id = EXCLUDED.property_id,
  lead_id = EXCLUDED.lead_id,
  work_order_id = EXCLUDED.work_order_id,
  metadata = EXCLUDED.metadata;

-- ------------------------------------------------------------------------------
-- 5. SEED WORKSPACE SETTINGS
-- ------------------------------------------------------------------------------
-- Central Texas dispatch parameters and operational hours singleton

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.workspace_settings LIMIT 1) THEN
    UPDATE public.workspace_settings
    SET
      organization_name = 'Northstar Facility Services',
      operations_hub = 'Austin Central HQ',
      dispatch_phone = '(512) 555-0190',
      dispatch_email = 'dispatch@northstarfacilities.com',
      service_territory_summary = 'Austin & Central Texas',
      routine_hours_weekday = 'Mon–Fri 7:00 AM – 6:00 PM',
      routine_hours_weekend = 'Emergency response only',
      emergency_dispatch_phone = '(512) 555-0190',
      emergency_response_window = '24/7 Priority Emergency Commercial Response',
      default_assessment_target_hours = 24,
      default_work_order_lead_days = 3,
      updated_at = NOW();
  ELSE
    INSERT INTO public.workspace_settings (
      organization_name,
      operations_hub,
      dispatch_phone,
      dispatch_email,
      service_territory_summary,
      routine_hours_weekday,
      routine_hours_weekend,
      emergency_dispatch_phone,
      emergency_response_window,
      default_assessment_target_hours,
      default_work_order_lead_days,
      updated_at
    ) VALUES (
      'Northstar Facility Services',
      'Austin Central HQ',
      '(512) 555-0190',
      'dispatch@northstarfacilities.com',
      'Austin & Central Texas',
      'Mon–Fri 7:00 AM – 6:00 PM',
      'Emergency response only',
      '(512) 555-0190',
      '24/7 Priority Emergency Commercial Response',
      24,
      3,
      NOW()
    );
  END IF;
END $$;

COMMIT;

-- ==============================================================================
-- 6. DEFERRED / POST-SEED: DEMO STAFF ONBOARDING INSTRUCTIONS
-- ==============================================================================
-- In accordance with strict security standards, demo staff accounts are
-- NOT provisioned with fake passwords or orphaned profiles.
--
-- When you are ready to onboard demo staff accounts into Supabase Auth:
--
-- Step 1: Create the User in Supabase Dashboard (Authentication > Users > Add User)
--   - Sarah Jenkins:    s.jenkins@northstarfacility.com (if you wish to create her as an admin)
--   - Derrick Miller:   d.miller@northstarfacility.com
--   - Robert Ramos:     r.ramos@northstarfacility.com
--   - Michael Torres:   m.torres@northstarfacility.com
--
-- Step 2: The database trigger `on_auth_user_created` will automatically insert
--   a row into public.profiles for each user.
--
-- Step 3: Run the following SQL snippet in the Supabase SQL Editor to populate
--   their exact trade disciplines, licenses, and badge IDs:
--
-- ```sql
-- UPDATE public.profiles
-- SET
--   full_name = 'Sarah Jenkins',
--   role = 'admin',
--   job_title = 'Operations & Dispatch Coordinator',
--   discipline = 'operations',
--   territory = 'Austin Central HQ',
--   phone = '(512) 555-0120',
--   team_member_id = 'TM-04'
-- WHERE email = 's.jenkins@northstarfacility.com';
--
-- UPDATE public.profiles
-- SET
--   full_name = 'Derrick Miller',
--   job_title = 'Commercial HVAC Lead',
--   discipline = 'hvac',
--   license_number = 'TDLR License #7819',
--   territory = 'Downtown & Central Austin',
--   phone = '(512) 555-0182',
--   team_member_id = 'TM-01'
-- WHERE email = 'd.miller@northstarfacility.com';
--
-- UPDATE public.profiles
-- SET
--   full_name = 'Robert Ramos',
--   job_title = 'Master Plumber',
--   discipline = 'plumbing',
--   license_number = 'RMP #4102',
--   territory = 'South Austin & San Marcos',
--   phone = '(512) 555-0194',
--   team_member_id = 'TM-02'
-- WHERE email = 'r.ramos@northstarfacility.com';
--
-- UPDATE public.profiles
-- SET
--   full_name = 'Michael Torres',
--   job_title = 'Master Electrician',
--   discipline = 'electrical',
--   license_number = 'TECL #3209',
--   territory = 'North Austin & The Domain',
--   phone = '(512) 555-0177',
--   team_member_id = 'TM-03'
-- WHERE email = 'm.torres@northstarfacility.com';
--
-- -- Step 4: Link historical work orders, leads, and activities to the newly onboarded staff:
-- UPDATE public.work_orders
-- SET assigned_technician_id = (SELECT id FROM public.profiles WHERE email = 'd.miller@northstarfacility.com')
-- WHERE work_order_code = 'WO-4401';
--
-- UPDATE public.work_orders
-- SET assigned_technician_id = (SELECT id FROM public.profiles WHERE email = 'r.ramos@northstarfacility.com')
-- WHERE work_order_code = 'WO-4402';
--
-- UPDATE public.work_orders
-- SET assigned_technician_id = (SELECT id FROM public.profiles WHERE email = 'm.torres@northstarfacility.com')
-- WHERE work_order_code = 'WO-4403';
--
-- UPDATE public.leads
-- SET assigned_technician_id = (SELECT id FROM public.profiles WHERE email = 'd.miller@northstarfacility.com')
-- WHERE lead_code = 'LEAD-1082';
--
-- UPDATE public.leads
-- SET assigned_technician_id = (SELECT id FROM public.profiles WHERE email = 's.jenkins@northstarfacility.com')
-- WHERE lead_code = 'LEAD-1081';
--
-- UPDATE public.leads
-- SET assigned_technician_id = (SELECT id FROM public.profiles WHERE email = 'r.ramos@northstarfacility.com')
-- WHERE lead_code = 'LEAD-1080';
--
-- UPDATE public.activity_events
-- SET actor_id = (SELECT id FROM public.profiles WHERE email = 'd.miller@northstarfacility.com')
-- WHERE activity_code = 'ACT-1008';
--
-- UPDATE public.activity_events
-- SET actor_id = (SELECT id FROM public.profiles WHERE email = 's.jenkins@northstarfacility.com')
-- WHERE activity_code IN ('ACT-1004', 'ACT-1005', 'ACT-1006', 'ACT-1007');
-- ```
-- ==============================================================================
