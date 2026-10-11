import { ServiceItem, IndustryItem, ProcessStep, DemoStat, CRMLead } from '../types';

export const SERVICES: ServiceItem[] = [
  {
    id: 'commercial-hvac',
    number: '01',
    title: 'Commercial HVAC',
    tagline: 'Precision Climate Control & Air Handling',
    shortDescription: 'Preventive maintenance, repairs and commercial heating and cooling support.',
    fullDescription: 'Our commercial HVAC specialists coordinate everything from high-tonnage rooftop packaged units to hydronic chillers and building automation system (BAS) calibration. We help Austin commercial properties remain compliant, energy-optimized, and comfortable throughout Central Texas summer heat and sudden cold fronts.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Packaged RTU Diagnostics & Coil Cleaning',
      'Chiller, Boiler & Hydronic Loop Service',
      'Variable Refrigerant Flow (VRF) Maintenance',
      'Building Automation & Smart Thermostat Integration',
      'Indoor Air Quality (IAQ) & Filtration Audits'
    ],
    capabilities: [
      'Compressor replacement coordination',
      'Planned seasonal changeover',
      'Refrigerant log tracking',
      'Airflow velocity & duct static testing'
    ],
    urgencyLevel: 'Urgent & Scheduled Support'
  },
  {
    id: 'electrical',
    number: '02',
    title: 'Electrical',
    tagline: 'Commercial Power, Lighting & Distribution',
    shortDescription: 'Commercial electrical maintenance, lighting, inspections and repairs.',
    fullDescription: 'From high-capacity power panels to interior and architectural exterior lighting, our experienced commercial electricians safeguard your property’s infrastructure. We minimize electrical disruptions, resolve safety code citations, and maintain reliable energy management controls.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Three-Phase Panel Inspections & Circuit Balancing',
      'Emergency Lighting, Exit Signs & Inverter Checks',
      'Exterior Parking Lot, Security & Canopy Illumination',
      'Infrared Thermal Scanning & Breaker Diagnostics',
      'Standby Generator Transfer Switch Testing'
    ],
    capabilities: [
      'Commercial code corrections',
      'EV charging infrastructure rollout',
      'Dedicated equipment circuits',
      'Submetering for retail & multi-tenant office'
    ],
    urgencyLevel: 'Priority Commercial Dispatch'
  },
  {
    id: 'plumbing',
    number: '03',
    title: 'Plumbing',
    tagline: 'Commercial Water, Drainage & Fixture Reliability',
    shortDescription: 'Commercial plumbing repairs, maintenance and urgent service support.',
    fullDescription: 'A single plumbing disruption in a commercial building can impact tenants, risk property damage, and interrupt operations. Northstar provides heavy-duty commercial plumbing support including hydro-jet line clearing, backflow preventer inspection, grease interceptors, and high-efficiency fixture maintenance.',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Backflow Preventer Testing & Valve Repair',
      'Commercial Hydro-Jetting & Video Pipe Inspections',
      'Booster Pumps, Pressure Regulators & Expansion Tanks',
      'Grease Trap Maintenance & Commercial Drain Lines',
      'Commercial Restroom Hardware & Touchless Upgrades'
    ],
    capabilities: [
      'Water line leak detection',
      'Commercial water heater replacements',
      'Lift station pump inspections',
      'Central Texas hard water mitigation'
    ],
    urgencyLevel: 'Urgent & Scheduled Support'
  },
  {
    id: 'general-maintenance',
    number: '04',
    title: 'General Maintenance',
    tagline: 'Day-to-Day Facility Operations & Repair',
    shortDescription: 'Reliable repairs and building maintenance for day-to-day facility needs.',
    fullDescription: 'Keep common areas, tenant suites, and structural building envelopes in pristine condition. Our multi-trade facility technicians handle daily punch-list repairs, door closer adjustments, acoustic ceiling tile swaps, interior wall repairs, lockset replacements, and perimeter weather sealing.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Commercial Door Closers, Panic Bars & Latch Repairs',
      'Drywall Patching, Acoustic Tiles & Wall Finishes',
      'Window Caulking & Exterior Envelope Sealing',
      'Flooring Repairs (VCT, Polished Concrete, Carpet Tile)',
      'Restroom Partition Re-alignment & Hardware Refresh'
    ],
    capabilities: [
      'Tenant turnover punch lists',
      'Lock re-keying & core management',
      'ADA compliance hardware corrections',
      'Pressure washing of entryways & docks'
    ],
    urgencyLevel: 'Scheduled / Routine'
  },
  {
    id: 'preventive-maintenance',
    number: '05',
    title: 'Preventive Maintenance',
    tagline: 'Scheduled Care to Protect Asset Longevity',
    shortDescription: 'Scheduled inspections and recurring maintenance designed to reduce disruption.',
    fullDescription: 'Facility assets last significantly longer when regularly inspected and documented. We build structured preventive maintenance schedules covering mechanical equipment, filter cycles, belt tensions, plumbing lines, and exterior drainage. We provide property managers with clear service logs for ownership and operational review.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Quarterly Mechanical & Roof Envelope Inspections',
      'Air Filter & Drive Belt Scheduled Replacements',
      'Lubrication of Motors, Bearings & Actuators',
      'Thermal Imaging of Critical Distribution Panels',
      'Comprehensive Digital Facility Service Reports'
    ],
    capabilities: [
      'Capital maintenance planning assistance',
      'Documented Service History & Inspection logs',
      'Equipment upkeep documentation',
      'Seasonal weatherization preparations'
    ],
    urgencyLevel: 'Scheduled / Recurring'
  },
  {
    id: 'emergency-services',
    number: '06',
    title: 'Emergency Services',
    tagline: 'Responsive Support for Critical Property Incidents',
    shortDescription: 'Responsive support for urgent facility and maintenance issues.',
    fullDescription: 'When urgent incidents threaten property operations, coordinating separate vendors can delay resolution. Northstar mobilizes field crews equipped to isolate water lines, stabilize facility damage, set up temporary power, and protect Central Texas commercial properties.',
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80',
    features: [
      'Responsive Dispatch Across Greater Austin',
      'Critical Water Extraction & Pipe Isolation',
      'Temporary Power Distribution & Floodlights',
      'Weather Debris Removal & Security Board-Up',
      'Service Logging for Property Stakeholders'
    ],
    capabilities: [
      'Priority dispatch coordination',
      'Hazard mitigation & site stabilization',
      'Coordination with municipal utility services',
      'Documented Service History'
    ],
    urgencyLevel: 'Urgent Priority Dispatch'
  }
];

export const INDUSTRIES: IndustryItem[] = [
  {
    id: 'office-buildings',
    title: 'Office Buildings',
    tagline: 'Class A & B Corporate Facilities',
    description: 'Ensuring consistent climate control, pristine common areas, and dependable electrical infrastructure for corporate tenants in Downtown Austin, The Domain, and regional office campuses.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    challengesSolved: [
      'Balancing high-density multi-tenant HVAC loads',
      'Maintaining executive presentation in lobbies & common areas',
      'Minimizing maintenance disruption during core business hours',
      'Preserving architectural finishes and modern lighting'
    ],
    propertyTypes: ['Downtown High-Rises', 'Mid-Rise Suburban Campuses', 'Corporate Headquarters', 'Tech Flex Offices'],
    keyBenefits: ['Tenant satisfaction', 'Minimized operational disruption', 'Predictable property upkeep']
  },
  {
    id: 'retail-spaces',
    title: 'Retail Spaces',
    tagline: 'Shopping Centers, Strip Malls & Storefronts',
    description: 'Protecting foot traffic and customer experience through dependable exterior lighting, customer restroom reliability, and front-of-house maintenance.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    challengesSolved: [
      'High-traffic customer restroom wear and tear',
      'Exterior canopy, facade, and parking lot illumination',
      'Grease interceptor and drain line care for food tenants',
      'Rapid maintenance response during high-volume retail hours'
    ],
    propertyTypes: ['Lifestyle Centers', 'Strip Malls', 'Standalone Retail Pads', 'Commercial Showrooms'],
    keyBenefits: ['Safe customer walkways', 'Code-compliant infrastructure', 'Single-source maintenance']
  },
  {
    id: 'property-management',
    title: 'Property Management',
    tagline: 'Portfolio-Wide Commercial Operations',
    description: 'Empowering regional asset managers with one dependable contact for work orders, coordinated scheduling, and documented service records across multiple commercial assets.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    challengesSolved: [
      'Eliminating the hassle of juggling 10+ disconnected trade vendors',
      'Inconsistent invoices and fragmented service histories',
      'Slow turnaround times on tenant service tickets',
      'Lack of clear documentation for property owners'
    ],
    propertyTypes: ['Commercial Office Parks', 'Mixed-Use Developments', 'Medical Arts Plazas', 'Flex Industrial Parks'],
    keyBenefits: ['One master service agreement', 'Unified work order dispatch', 'Transparent reporting']
  },
  {
    id: 'healthcare-facilities',
    title: 'Healthcare Facilities',
    tagline: 'Medical Offices, Clinics & Dental Suites',
    description: 'Strict adherence to environmental climate stability, indoor air filtration standards, clinical sanitation awareness, and power reliability.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    challengesSolved: [
      'Careful air filtration and ventilation maintenance',
      'Specialized plumbing and clinical restroom care',
      'Temperature and humidity consistency for clinical supplies',
      'Quiet, respectful service during patient consultation hours'
    ],
    propertyTypes: ['Outpatient Clinics', 'Medical Office Buildings (MOB)', 'Dental Practices', 'Diagnostic Suites'],
    keyBenefits: ['Air quality awareness', 'Clinical environment sensitivity', 'Priority urgent response']
  },
  {
    id: 'hospitality',
    title: 'Hospitality',
    tagline: 'Boutique Hotels, Lodging & Event Properties',
    description: 'Guest satisfaction relies on quiet mechanical equipment, reliable hot water, pristine common spaces, and discreet, fast-turnaround maintenance.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    challengesSolved: [
      'Preventing guest complaints from HVAC noise or plumbing faults',
      'Rapid turnaround of guest suites and event spaces',
      'Pool pumps, domestic hot water boilers, and exterior lighting',
      'Discreet service crews respecting guest privacy'
    ],
    propertyTypes: ['Boutique Hotels', 'Event Venues', 'Extended Stay Properties', 'Commercial Clubhouses'],
    keyBenefits: ['High guest satisfaction', 'On-call maintenance support', 'Preserved property value']
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: '01',
    name: 'REQUEST',
    tagline: 'Tell us what you need',
    description: 'Submit an inquiry online or reach out with your property address, issue description, and timeframe.'
  },
  {
    step: '02',
    name: 'ASSESS',
    tagline: 'We review the property and requirements',
    description: 'Our technical team reviews building access, equipment specs, and scope to identify the required trades.'
  },
  {
    step: '03',
    name: 'PLAN',
    tagline: 'We recommend the appropriate service',
    description: 'You receive a clear scope of work, transparent commercial estimate, and suggested preventive steps.'
  },
  {
    step: '04',
    name: 'SCHEDULE',
    tagline: 'Our team coordinates the work',
    description: 'Coordinated service specialists arrive on site with the right tooling, prepared to minimize disruptions to your tenants or operations.'
  },
  {
    step: '05',
    name: 'MAINTAIN',
    tagline: 'Keep your facility running smoothly',
    description: 'Work is verified, documented with service logs, and filed into your facility records for long-term property reliability.'
  }
];

export const DEMO_STATS: DemoStat[] = [
  {
    value: '1.8M+',
    label: 'SQ. FT. UNDER CARE',
    subtext: 'Demonstration commercial portfolio scale across Central Texas.'
  },
  {
    value: '6',
    label: 'CORE FACILITY TRADES',
    subtext: 'Consolidated commercial mechanical, electrical, and facility disciplines.'
  },
  {
    value: 'Austin Metro',
    label: 'REGIONAL SERVICE AREA',
    subtext: 'Commercial dispatch across Austin, Round Rock, and Central Texas.'
  },
  {
    value: '140+',
    label: 'DEMO PROPERTIES',
    subtext: 'Demonstration portfolio assets modeled across Central Texas.'
  }
];

export const SEED_LEADS: CRMLead[] = [
  {
    id: 'LEAD-1082',
    createdAt: '2026-09-20 14:32',
    name: 'Marcus Vance',
    email: 'm.vance@capitalcrest.com',
    company: 'Capital Crest Property Partners',
    phone: '(512) 555-0149',
    serviceNeeded: 'commercial-hvac',
    propertyType: 'Office Buildings',
    propertyAddress: '701 Brazos St, Suite 400, Austin, TX 78701',
    message: 'Rooftop unit #3 is showing compressor fault on the BMS. Tenant on floor 4 reporting warm ambient temperatures in conference wing.',
    preferredContactMethod: 'phone',
    status: 'assessing',
    priority: 'high',
    assignedTechnician: 'Derrick Miller (HVAC Specialist)',
    estimatedValue: '$3,800',
    facilitySquareFootage: '85,000 sq ft',
    propertyId: 'PROP-201'
  },
  {
    id: 'LEAD-1081',
    createdAt: '2026-09-19 10:15',
    name: 'Elena Rostova',
    email: 'elena@thearboretumretail.com',
    company: 'Arboretum Commercial Retail',
    phone: '(512) 555-0872',
    serviceNeeded: 'preventive-maintenance',
    propertyType: 'Retail Spaces',
    propertyAddress: '10000 Research Blvd, Austin, TX 78759',
    message: 'Looking for a unified vendor proposal for quarterly mechanical filter replacements, roof drain clearances, and exterior canopy checks for 6 retail pads.',
    preferredContactMethod: 'email',
    status: 'new',
    priority: 'standard',
    assignedTechnician: 'Sarah Jenkins (Facility Coordinator)',
    estimatedValue: '$14,500 / yr',
    facilitySquareFootage: '120,000 sq ft',
    propertyId: 'PROP-202'
  },
  {
    id: 'LEAD-1080',
    createdAt: '2026-09-18 08:45',
    name: 'Dr. Gregory Chen',
    email: 'gchen@lakewaymedicalarts.com',
    company: 'Lakeway Medical Arts Pavilion',
    phone: '(512) 555-0391',
    serviceNeeded: 'plumbing',
    propertyType: 'Healthcare Facilities',
    propertyAddress: '2300 S FM 620, Lakeway, TX 78734',
    message: 'Annual city backflow preventer inspection due next week on both main domestic feed and fire suppression isolation valves.',
    preferredContactMethod: 'either',
    status: 'scheduled',
    priority: 'standard',
    assignedTechnician: 'Robert Ramos (Plumbing Specialist)',
    estimatedValue: '$1,200',
    facilitySquareFootage: '42,000 sq ft',
    propertyId: 'PROP-203'
  }
];

export const SERVICE_AREAS = [
  { city: 'Austin', area: 'Downtown, South Congress, East Austin, North Burnet' },
  { city: 'The Domain', area: 'Tech Corridor & High-Density Mixed Use' },
  { city: 'Round Rock & Pflugerville', area: 'Commercial Distribution & Healthcare Plazas' },
  { city: 'Cedar Park & Leander', area: 'Retail Centers & Professional Offices' },
  { city: 'Westlake Hills & Bee Cave', area: 'Boutique Commercial & Medical Offices' },
  { city: 'San Marcos, Buda & Kyle', area: 'South Central Texas Commercial Hub' },
  { city: 'Georgetown', area: 'Commercial Hubs & Modern Flex Facilities' }
];

