import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  ChevronDown, 
  ArrowDown,
  ArrowUpRight,
  Clock,
  Wrench,
  Flame,
  Zap,
  Droplets,
  ShieldCheck,
  AlertTriangle,
  Layers,
  FileCheck,
  Users,
  Sliders,
  CalendarCheck,
  HelpCircle,
  Building
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionBadge } from '../components/ui/SectionBadge';
import { Button } from '../components/ui/Button';
import { BackToHome } from '../components/ui/BackToHome';

interface AlignedService {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectorProfile {
  id: string;
  number: string;
  category: string;
  title: string;
  positioning: string;
  description: string;
  tagline: string;
  image: string;
  propertyTypes: string[];
  challengesSolved: string[];
  alignedServices: AlignedService[];
  ctaLabel: string;
  contactPropertyType: string;
}

const SECTOR_PROFILES: SectorProfile[] = [
  {
    id: 'office-buildings',
    number: '01',
    category: 'COMMERCIAL OFFICE',
    title: 'Commercial Office & Corporate Campuses',
    positioning: 'Balancing high-density occupancy, tenant satisfaction, and non-disruptive off-hours execution across Class A and B corporate facilities.',
    description: 'Ensuring consistent climate control, pristine common areas, and dependable electrical infrastructure for corporate tenants in Downtown Austin, The Domain, and regional office campuses.',
    tagline: 'Class A & B Corporate Facilities',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    propertyTypes: ['Downtown High-Rises', 'Mid-Rise Suburban Campuses', 'Corporate Headquarters', 'Tech Flex Offices'],
    challengesSolved: [
      'Balancing high-density multi-tenant HVAC loads and multi-zone airflow balance',
      'Maintaining executive presentation in lobbies, boardrooms, and common corridors',
      'Minimizing operational disruption through scheduled off-hours maintenance execution',
      'Preserving modern architectural finishes, ballast controls, and LED lighting'
    ],
    alignedServices: [
      { id: 'hvac', name: 'Commercial HVAC', href: '/services#commercial-hvac', icon: Flame },
      { id: 'elec', name: 'Electrical', href: '/services#electrical', icon: Zap },
      { id: 'pm', name: 'Preventive Maintenance', href: '/services#preventive-maintenance', icon: ShieldCheck }
    ],
    ctaLabel: 'Request Office Consultation',
    contactPropertyType: 'Office Buildings'
  },
  {
    id: 'retail-spaces',
    number: '02',
    category: 'RETAIL & SHOWROOMS',
    title: 'Retail Centers & Commercial Showrooms',
    positioning: 'Protecting foot traffic, customer safety, and tenant operations through dependable lighting, plumbing uptime, and responsive maintenance.',
    description: 'Protecting foot traffic and customer experience through dependable exterior lighting, customer restroom reliability, and front-of-house maintenance across Central Texas retail environments.',
    tagline: 'Shopping Centers, Strip Malls & Storefronts',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    propertyTypes: ['Lifestyle Centers', 'Strip Malls', 'Standalone Retail Pads', 'Commercial Showrooms'],
    challengesSolved: [
      'High-traffic customer restroom wear, tear, and fixture maintenance',
      'Exterior canopy, facade illumination, and parking lot safety lighting',
      'Grease interceptor and drain line care for dining and food service tenants',
      'Discreet after-hours servicing to protect customer-facing retail sales hours'
    ],
    alignedServices: [
      { id: 'elec', name: 'Electrical', href: '/services#electrical', icon: Zap },
      { id: 'plumb', name: 'Plumbing', href: '/services#plumbing', icon: Droplets },
      { id: 'emerg', name: 'Emergency Services', href: '/services#emergency-services', icon: AlertTriangle }
    ],
    ctaLabel: 'Request Retail Consultation',
    contactPropertyType: 'Retail Spaces'
  },
  {
    id: 'healthcare-facilities',
    number: '03',
    category: 'HEALTHCARE & MEDICAL',
    title: 'Healthcare & Medical Facilities',
    positioning: 'Prioritizing climate stability, air handling awareness, clinical sanitation considerations, and discreet service in occupied care environments.',
    description: 'Strict adherence to environmental climate stability, indoor air filtration standards, clinical sanitation awareness, and power reliability for outpatient and specialist facilities.',
    tagline: 'Medical Offices, Clinics & Dental Suites',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    propertyTypes: ['Outpatient Clinics', 'Medical Office Buildings (MOB)', 'Dental Practices', 'Diagnostic Suites'],
    challengesSolved: [
      'Consistent air handling, filtration cycle care, and temperature stability',
      'Specialized clinical plumbing maintenance and clean-room protocol sensitivity',
      'Quiet, planned maintenance scheduled around patient consultation hours',
      'Dependable electrical branch circuits and backflow prevention checks'
    ],
    alignedServices: [
      { id: 'hvac', name: 'Commercial HVAC', href: '/services#commercial-hvac', icon: Flame },
      { id: 'plumb', name: 'Plumbing', href: '/services#plumbing', icon: Droplets },
      { id: 'pm', name: 'Preventive Maintenance', href: '/services#preventive-maintenance', icon: ShieldCheck }
    ],
    ctaLabel: 'Request Healthcare Consultation',
    contactPropertyType: 'Healthcare Facilities'
  },
  {
    id: 'hospitality',
    number: '04',
    category: 'HOSPITALITY & VENUES',
    title: 'Hospitality & Venue Properties',
    positioning: 'Preserving guest satisfaction and acoustic comfort through rapid maintenance turnarounds, dependable hot water, and quiet mechanical systems.',
    description: 'Guest satisfaction relies on quiet mechanical equipment, reliable hot water, pristine common spaces, and discreet, fast-turnaround facility maintenance.',
    tagline: 'Boutique Hotels, Lodging & Event Properties',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    propertyTypes: ['Boutique Hotels', 'Event Venues', 'Extended Stay Properties', 'Commercial Clubhouses'],
    challengesSolved: [
      'Continuous domestic hot water loop reliability and boiler pressure stability',
      'Acoustic and vibration mitigation on mechanical equipment near guest suites',
      'Rapid turnaround of hospitality suites, meeting rooms, and event spaces',
      'Discreet maintenance crews operating with zero guest disruption'
    ],
    alignedServices: [
      { id: 'plumb', name: 'Plumbing', href: '/services#plumbing', icon: Droplets },
      { id: 'hvac', name: 'Commercial HVAC', href: '/services#commercial-hvac', icon: Flame },
      { id: 'gen', name: 'General Maintenance', href: '/services#general-maintenance', icon: Wrench }
    ],
    ctaLabel: 'Request Hospitality Consultation',
    contactPropertyType: 'Hospitality'
  },
  {
    id: 'industrial-flex',
    number: '05',
    category: 'INDUSTRIAL & FLEX',
    title: 'Industrial & Flex Facilities',
    positioning: 'Supporting high-bay illumination, three-phase power distribution, and heavy hardware infrastructure across light industrial and flex commercial parks.',
    description: 'Tailored facility maintenance addressing the mechanical demands, electrical loads, and dock operations of modern distribution nodes, flex spaces, and R&D facilities throughout Central Texas.',
    tagline: 'Light Industrial, Flex Warehouse & Logistics',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    propertyTypes: ['Light Industrial', 'Flex Warehouse', 'Distribution Nodes', 'R&D Labs'],
    challengesSolved: [
      'High-bay LED illumination and three-phase panel distribution upkeep',
      'Overhead roll-up door hardware, dock levelers, and security perimeter checks',
      'Heavy industrial drainage, oil/grit separators, and concrete floor care',
      'Rooftop packaged unit maintenance in high-clearance environments'
    ],
    alignedServices: [
      { id: 'elec', name: 'Electrical', href: '/services#electrical', icon: Zap },
      { id: 'gen', name: 'General Maintenance', href: '/services#general-maintenance', icon: Wrench },
      { id: 'hvac', name: 'Commercial HVAC', href: '/services#commercial-hvac', icon: Flame }
    ],
    ctaLabel: 'Request Industrial Consultation',
    contactPropertyType: 'Industrial / Flex Space'
  }
];

// Common Facility Challenges Across Commercial Properties
const COMMON_CHALLENGES = [
  {
    id: 'vendor-sprawl',
    title: 'Vendor Sprawl & Divided Accountability',
    icon: Users,
    challenge: 'Juggling 8 to 12 separate single-trade contractors leads to conflicting schedules, administrative chaos, and finger-pointing when interconnected systems fail.',
    resolution: 'One master service agreement and coordinated service management across properties, aligning HVAC, electrical, plumbing, and general facility trades under single-source accountability.'
  },
  {
    id: 'daytime-disruption',
    title: 'Disruption to Tenants & Business Hours',
    icon: Clock,
    challenge: 'Noisy power tools, service carts blocking corridors, and mid-day utility shutdowns irritate corporate tenants, retail shoppers, and healthcare patients.',
    resolution: 'Disciplined off-hours, early morning, and weekend scheduling with clean work zone protocols, quiet service tools, and immaculate site turnovers.'
  },
  {
    id: 'reactive-costs',
    title: 'Reactive Maintenance & Surprise Capital Outlays',
    icon: AlertTriangle,
    challenge: 'Deferring routine filter, belt, and valve checks turns manageable wear into catastrophic equipment breakdowns, emergency charges, and premature unit replacements.',
    resolution: 'Structured multi-trade preventive maintenance programs that preserve mechanical equipment lifespans, sustain energy efficiency, and eliminate surprise downtime.'
  },
  {
    id: 'undocumented-work',
    title: 'Missing Service Records & Zero Audit Trail',
    icon: FileCheck,
    challenge: 'Scattered invoices, verbal work orders, and missing photos leave property managers without defensible maintenance histories for owners, investors, or lease reconciliations.',
    resolution: 'Digital work order documentation with timestamped before-and-after photography, technician notes, equipment serial tracking, and transparent invoicing.'
  },
  {
    id: 'emergency-dispatch',
    title: 'Unreliable Emergency Response Times',
    icon: Zap,
    challenge: 'Waiting hours or days for untrusted service providers when rooftop HVAC compressors fail during Texas summer heat, water mains burst, or main breakers trip.',
    resolution: 'Coordinated priority response for urgent facility needs across Central Texas with pre-authorized diagnostic thresholds to contain damage and restore facility uptime swiftly.'
  }
];

// 4 Core Capabilities of Portfolio Operations
const PORTFOLIO_CAPABILITIES = [
  {
    number: '01',
    title: 'Master Service Agreement & Consolidated Coordination',
    description: 'Consolidate multiple commercial properties under one master agreement. Benefit from consistent service workflows and consolidated coordination, agreed diagnostic processes, and simplified monthly billing across your entire building roster.',
    icon: Layers
  },
  {
    number: '02',
    title: 'Centralized Work Order Dispatch & Single Point of Contact',
    description: 'Eliminate multiple dispatch phone lines. Your property management team submits tenant work orders and scheduled tasks through a consistent point of coordination for service requests.',
    icon: Sliders
  },
  {
    number: '03',
    title: 'Owner-Grade Photo Audits & Asset Records',
    description: 'Every completed ticket includes time-stamped before-and-after photographs, equipment serial numbers, and technician diagnostic logs—ready for organized documentation for property owners and portfolio stakeholders.',
    icon: FileCheck
  },
  {
    number: '04',
    title: 'Coordinated Multi-Property Maintenance',
    description: 'Align recurring maintenance activities across multiple properties through a consistent scheduling and tracking workflow.',
    icon: CalendarCheck
  }
];

export const IndustriesPage: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToTarget = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };
      scrollToTarget();
      const timer = setTimeout(scrollToTarget, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const handleJump = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // 5 Featured Physical Property Sectors
  const propertySectors = [
    {
      id: 'office-buildings',
      number: '01',
      title: 'Commercial Office',
      subtitle: 'Class A & B Corporate Campuses'
    },
    {
      id: 'retail-spaces',
      number: '02',
      title: 'Retail & Showrooms',
      subtitle: 'Shopping Centers & Storefronts'
    },
    {
      id: 'healthcare-facilities',
      number: '03',
      title: 'Healthcare & Medical',
      subtitle: 'Clinics, MOBs & Dental Suites'
    },
    {
      id: 'hospitality',
      number: '04',
      title: 'Hospitality & Venues',
      subtitle: 'Boutique Hotels & Event Properties'
    },
    {
      id: 'industrial-flex',
      number: '05',
      title: 'Industrial & Flex',
      subtitle: 'Light Industrial & Logistics Parks'
    }
  ];

  return (
    <div className="bg-[#F3F7F5] min-h-screen">
      
      {/* 1. Industries Hero with Architectural Context */}
      <section className="relative bg-[#063B35] text-white pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 overflow-hidden border-b border-[#063B35]">
        {/* Architectural backdrop photo with subtle dark forest overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#042925]/95 via-[#063B35]/90 to-[#063B35]" />
          {/* Subtle architectural grid pattern */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ 
              backgroundImage: 'radial-gradient(#00C875 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }} 
          />
        </div>

        <Container className="relative z-10">
          {/* Hero Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Heading, Value Proposition & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <SectionBadge label="FEATURED COMMERCIAL SECTORS" variant="white" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase leading-[1.15] text-white">
                FACILITY SOLUTIONS BY INDUSTRY
              </h1>
              
              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
                Northstar adapts commercial facility support around the operational realities of different property types, tenant environments, and building requirements. From corporate towers and retail hubs to medical suites and flex industrial parks, we deliver disciplined single-source accountability across Central Texas.
              </p>
              
              {/* Primary and Secondary CTA Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button 
                  to="/contact" 
                  variant="primary" 
                  size="lg" 
                  withArrow
                  className="shadow-lg hover:shadow-xl font-bold bg-[#00B86B] text-[#063B35] hover:bg-[#00C875]"
                >
                  Request Property Consultation
                </Button>
                
                <a
                  href="#sectors"
                  onClick={(e) => handleJump(e, 'sectors')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                  title="Explore commercial sectors below"
                >
                  <span>Explore Featured Sectors</span>
                  <ArrowDown className="w-4 h-4 text-[#00C875]" />
                </a>
              </div>
            </div>

            {/* Right Column: Commercial Property Support Context Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C875] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                      Commercial Property Support
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-white/60">
                    Austin Metro & Central TX
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Tailored facility workflows addressing the specific occupancy schedules, mechanical loads, and tenant sensitivity of each property class.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 text-xs text-white/90">
                    <Building2 className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" />
                    <span><strong>Tenant-Sensitive Execution:</strong> Structured around core operating hours, noise limits, and customer access.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-white/90">
                    <Wrench className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" />
                    <span><strong>Coordinated Multi-Trade Service:</strong> Single-source management across commercial HVAC, electrical power, and plumbing.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-white/90">
                    <Clock className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" />
                    <span><strong>Property-Specific Maintenance:</strong> Tailored preventive schedules aligned with building occupancy and asset lifecycle.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 2. Direct Sector Jump Navigation Dock */}
          <div id="sectors" className="scroll-mt-24 mt-12 sm:mt-16 pt-8 border-t border-white/15">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00C875]">
                Featured Commercial Sectors
              </span>
              <span className="text-xs text-white/60">
                Select a representative property environment to review operational capabilities and trade scope:
              </span>
            </div>

            {/* Sector Jump Grid (5 Featured Sectors) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {propertySectors.map((sector) => (
                <a
                  key={sector.id}
                  href={`#${sector.id}`}
                  onClick={(e) => handleJump(e, sector.id)}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[#00C875]/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-mono font-bold text-[#00C875] bg-[#00C875]/15 px-2 py-0.5 rounded shrink-0">
                      {sector.number}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00C875] transition-colors block truncate">
                        {sector.title}
                      </span>
                      <span className="text-[11px] text-white/50 block truncate">
                        {sector.subtitle}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#00C875] group-hover:translate-y-0.5 transition-all shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

        </Container>
      </section>

      {/* Main Sector Breakdown - Consistent Architectural Layout */}
      <section className="py-16 sm:py-20">
        <Container>
          
          {/* Section Framing */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <SectionBadge label="FEATURED PROPERTY ENVIRONMENTS" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase mt-3">
              Specialized Facility Scopes Across Core Sectors
            </h2>
            <p className="text-sm sm:text-base text-[#617070] mt-3 leading-relaxed">
              While Northstar provides tailored maintenance across virtually any commercial facility, these five physical sectors represent our most frequent service environments in Central Texas.
            </p>
          </div>

          <div className="space-y-16 sm:space-y-20">
            {SECTOR_PROFILES.map((sector) => {
              return (
                <div
                  key={sector.id}
                  id={sector.id}
                  className="scroll-mt-32 bg-white rounded-3xl border border-[#E1EBE7] p-6 sm:p-10 shadow-sm"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
                    
                    {/* LEFT COLUMN: Large Commercial Property Image (Consistent across all profiles) */}
                    <div className="lg:col-span-5">
                      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-slate-900 h-72 sm:h-96 lg:h-[460px] sticky top-28">
                        <img
                          src={sector.image}
                          alt={sector.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />
                        
                        {/* Top-left sector indicator badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/20">
                            Sector {sector.number}
                          </span>
                        </div>

                        {/* Bottom contextual label without repeating the main headline */}
                        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00C875] block">
                            Property Environment
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-white/90 block mt-0.5">
                            {sector.tagline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Structural Content, Challenges & Service Alignment */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Sector Category & Dominant H2 */}
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00B86B]">
                          {sector.number} / {sector.category}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase mt-1 leading-tight">
                          {sector.title}
                        </h2>
                        <p className="text-sm sm:text-base font-semibold text-[#102A2A] mt-2.5 leading-snug">
                          {sector.positioning}
                        </p>
                        <p className="text-sm text-[#617070] mt-2 leading-relaxed">
                          {sector.description}
                        </p>
                      </div>

                      {/* Property Subtypes */}
                      <div className="p-4 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7]">
                        <span className="text-[11px] font-bold text-[#063B35] uppercase tracking-wider block mb-2">
                          Facility Types Covered:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sector.propertyTypes.map((type, i) => (
                            <span key={i} className="text-xs font-medium bg-white text-[#102A2A] px-2.5 py-1 rounded-md border border-[#E1EBE7]">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Operational Challenges Solved */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#063B35] block">
                          Operational Priorities Solved:
                        </span>
                        <div className="space-y-2">
                          {sector.challengesSolved.map((challenge, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7]">
                              <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-[#102A2A] font-medium leading-normal">{challenge}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Northstar Service Alignment (Clickable Service Chips) */}
                      <div className="pt-4 pb-2 border-t border-[#E1EBE7]">
                        <div className="mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#00B86B] block">
                            Northstar Service Alignment
                          </span>
                          <p className="text-xs text-[#617070] mt-0.5">
                            Common facility scopes for this property environment include:
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {sector.alignedServices.map((service) => (
                            <Link
                              key={service.id}
                              to={service.href}
                              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#00B86B]/35 hover:border-[#00B86B] hover:bg-[#00B86B]/5 text-xs sm:text-sm font-semibold text-[#063B35] shadow-xs transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                              title={`View ${service.name} service scope`}
                            >
                              <service.icon className="w-4 h-4 text-[#00B86B]" />
                              <span>{service.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#00B86B]/70 group-hover:text-[#00B86B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Consultation CTA */}
                      <div className="pt-4 border-t border-[#E1EBE7]">
                        <Button
                          to={`/contact?propertyType=${encodeURIComponent(sector.contactPropertyType)}`}
                          variant="primary"
                          size="md"
                          withArrow
                          className="font-bold min-h-[44px]"
                        >
                          {sector.ctaLabel}
                        </Button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. Custom Facility Positioning (Featured ≠ Exclusive) */}
      <section className="py-14 sm:py-18 bg-white border-y border-[#E1EBE7]">
        <Container>
          <div className="bg-[#F3F7F5] rounded-3xl border border-[#E1EBE7] p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <SectionBadge label="CUSTOM SERVICE POSITIONING" variant="emerald" />
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                  Operating Beyond The Featured Sectors? We Tailor Every Scope.
                </h3>
                
                {/* Core positioning statement */}
                <p className="text-base sm:text-lg font-medium text-[#102A2A] leading-relaxed">
                  Every facility operates differently. Northstar can tailor its service approach around your property&apos;s type, operational requirements, maintenance priorities, and specific facility needs.
                </p>

                <p className="text-sm text-[#617070] leading-relaxed">
                  The sectors highlighted above represent our most frequent physical property profiles, but they do not define our boundaries. Whether you manage a private school campus, place of worship, civic building, community arts center, or specialized commercial facility, our licensed multi-trade teams adapt around your building occupancy schedules, physical access parameters, and operational standards.
                </p>

                {/* Scope adaptation pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E1EBE7] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                    <span className="text-[#102A2A]"><strong>Custom Scheduling:</strong> Off-hours, weekend, or holiday maintenance to avoid daytime operational impact.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E1EBE7] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                    <span className="text-[#102A2A]"><strong>Unique Architecture:</strong> Experience with historic structures, open-span halls, and specialized MEP footprints.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E1EBE7] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                    <span className="text-[#102A2A]"><strong>Tailored Compliance:</strong> Specific sanitation, public safety, egress, and accessibility maintenance scopes.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E1EBE7] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                    <span className="text-[#102A2A]"><strong>Accountable Reporting:</strong> Transparent photo documentation and clear scopes formatted for boards and owners.</span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E1EBE7] p-6 shadow-sm space-y-4 text-center lg:text-left">
                <div className="inline-flex p-3 rounded-xl bg-[#00B86B]/10 text-[#063B35]">
                  <Building className="w-6 h-6 text-[#00B86B]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#063B35] uppercase">
                    Have a Unique Property?
                  </h4>
                  <p className="text-xs text-[#617070] mt-1 leading-relaxed">
                    Connect with our commercial facilities team for a site assessment and customized service plan.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    to="/contact?propertyType=Other%20Commercial"
                    variant="primary"
                    size="md"
                    withArrow
                    className="w-full justify-center font-bold min-h-[44px]"
                  >
                    Discuss Custom Facility Scope
                  </Button>
                </div>
                <p className="text-[11px] text-[#617070] text-center">
                  No obligation · Central Texas site review
                </p>
              </div>

            </div>
          </div>
        </Container>
      </section>

      {/* 4. Common Facility Challenges Across Commercial Properties */}
      <section className="py-16 sm:py-24 bg-[#F3F7F5]">
        <Container>
          
          {/* Section Header */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <SectionBadge label="CROSS-SECTOR OPERATIONS" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase mt-3">
              Common Facility Challenges We Eliminate
            </h2>
            <p className="text-sm sm:text-base text-[#617070] mt-3 leading-relaxed">
              Commercial property operators face similar operational friction regardless of building type. Northstar replaces disjointed trade coordination and unexpected downtime with systematic multi-trade accountability.
            </p>
          </div>

          {/* Grid of Common Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMON_CHALLENGES.map((item) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E1EBE7] p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[#063B35]/5 border border-[#063B35]/10 flex items-center justify-center text-[#063B35]">
                      <IconComp className="w-5 h-5 text-[#00B86B]" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#063B35] uppercase tracking-tight">
                      {item.title}
                    </h3>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-red-50/60 border border-red-100 text-[#102A2A]">
                        <span className="font-bold text-red-900 block text-[11px] uppercase tracking-wider mb-1">
                          The Operational Pain Point:
                        </span>
                        <p className="text-red-950/80 leading-relaxed">
                          {item.challenge}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7] text-[#102A2A]">
                        <span className="font-bold text-[#063B35] block text-[11px] uppercase tracking-wider mb-1">
                          How Northstar Solves It:
                        </span>
                        <p className="text-[#617070] leading-relaxed">
                          {item.resolution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Consultation Callout Card */}
            <div className="bg-[#063B35] text-white rounded-2xl border border-[#063B35] p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00C875]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Facing a Facility Bottleneck?
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Tell us what is causing friction across your building mechanicals, electrical panels, or maintenance operations. Our team will review your existing vendor contracts and provide an actionable service roadmap.
                </p>
              </div>

              <div className="pt-6">
                <Button 
                  to="/contact" 
                  variant="secondary" 
                  size="md" 
                  withArrow 
                  className="w-full justify-center font-bold min-h-[44px]"
                >
                  Schedule Operations Audit
                </Button>
              </div>
            </div>

          </div>

        </Container>
      </section>

      {/* 5. Dedicated Portfolio Operations & Property Management Framework */}
      <section
        id="property-management"
        className="scroll-mt-32 py-16 sm:py-24 bg-white border-t border-[#E1EBE7]"
      >
        <Container>
          
          {/* Header */}
          <div className="max-w-3xl mb-12 sm:mb-16">
            <SectionBadge label="PORTFOLIO OPERATIONS" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase mt-3">
              Multi-Property Portfolio Operations Across Central Texas
            </h2>
            <p className="text-sm sm:text-base text-[#617070] mt-3 leading-relaxed">
              Designed specifically for regional asset managers, commercial property management firms, and institutional owners operating distributed office, retail, medical, and industrial assets in Austin and surrounding submarkets.
            </p>
          </div>

          {/* 4 Core Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {PORTFOLIO_CAPABILITIES.map((cap) => {
              const CapIcon = cap.icon;
              return (
                <div
                  key={cap.number}
                  className="p-6 sm:p-8 rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] hover:border-[#00B86B]/40 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-1 rounded-md border border-[#00B86B]/20">
                      Capability {cap.number}
                    </span>
                    <CapIcon className="w-5 h-5 text-[#063B35]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-[#063B35] tracking-tight">
                    {cap.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#617070] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Portfolio Operations Callout / Master Service Agreement Card */}
          <div className="mt-12 bg-[#063B35] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B86B]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold tracking-wider uppercase text-[#00C875]">
                  <span>Consolidated Commercial Maintenance</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                  Managing Multiple Commercial Properties in Greater Austin?
                </h3>
                
                <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
                  Northstar consolidates all property work orders, vendor schedules, maintenance history, and photographic audits under a single master service agreement. Eliminate vendor chaos, lock in priority response times, and gain total transparency across every square foot.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs px-3 py-1 rounded-md bg-white/10 text-white/90 border border-white/15">
                    Office Campuses
                  </span>
                  <span className="text-xs px-3 py-1 rounded-md bg-white/10 text-white/90 border border-white/15">
                    Retail Strips
                  </span>
                  <span className="text-xs px-3 py-1 rounded-md bg-white/10 text-white/90 border border-white/15">
                    Medical Arts Buildings
                  </span>
                  <span className="text-xs px-3 py-1 rounded-md bg-white/10 text-white/90 border border-white/15">
                    Flex Industrial Parks
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Button
                  to="/contact?propertyType=Property%20Management"
                  variant="secondary"
                  size="lg"
                  withArrow
                  className="font-bold justify-center min-h-[44px]"
                >
                  Request Master Agreement Review
                </Button>
                
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors text-center min-h-[44px]"
                >
                  Contact Operations Desk
                </Link>
              </div>
            </div>
          </div>

        </Container>
      </section>

      {/* Back to Home Navigation Action */}
      <BackToHome />

    </div>
  );
};
