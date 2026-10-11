import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  TrendingUp, 
  Users, 
  MapPin, 
  Wrench, 
  Layers, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowUpRight 
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionBadge } from '../components/ui/SectionBadge';
import { Button } from '../components/ui/Button';
import { BackToHome } from '../components/ui/BackToHome';
import { SERVICE_AREAS } from '../data/northstarData';

// Operating Philosophy - 3 Core Ideas
const PHILOSOPHY_PILLARS = [
  {
    id: 'proactive',
    tag: 'PROACTIVE',
    title: 'Preventive Care Over Crisis Management',
    description: 'Maintenance should address recurring facility needs before they become larger operational problems. Structured upkeep protects mechanical equipment lifespans and prevents costly emergency interruptions.',
    icon: Wrench
  },
  {
    id: 'coordinated',
    tag: 'COORDINATED',
    title: 'Integrated Trades Over Vendor Sprawl',
    description: 'Multiple facility trades can be managed through a more organized service workflow rather than fragmented single-trade coordination. One coordinated relationship eliminates administrative friction and finger-pointing.',
    icon: Layers
  },
  {
    id: 'documented',
    tag: 'DOCUMENTED',
    title: 'Transparent Records Over Guesswork',
    description: 'Service activity should have clear records, communication, and closeout information so property stakeholders, asset managers, and facility teams always know what was completed and when.',
    icon: FileText
  }
];

// Core Operating Principles - 4 Pillars
const CORE_PRINCIPLES = [
  {
    id: 'reliable-facilities',
    title: 'Reliable Facilities',
    description: 'Maintain critical building systems through organized service and preventive maintenance, protecting daily tenant operations from unexpected downtime.',
    icon: Building2
  },
  {
    id: 'responsive-service',
    title: 'Responsive Service',
    description: 'Coordinate service needs with clear communication and appropriate priority based on facility conditions and operational urgency.',
    icon: Clock
  },
  {
    id: 'long-term-value',
    title: 'Long-Term Property Value',
    description: 'Support maintenance planning that helps property stakeholders protect building systems, avoid premature replacements, and manage recurring facility needs.',
    icon: TrendingUp
  },
  {
    id: 'trusted-partner',
    title: 'One Trusted Partner',
    description: 'Coordinate multiple facility service disciplines through a consistent operational relationship, reducing the complexity of coordinating multiple disconnected single-trade vendors.',
    icon: Users
  }
];

// Featured Property Environments
const FEATURED_SECTORS = [
  {
    number: '01',
    name: 'Commercial Office & Corporate Campuses',
    desc: 'Multi-tenant high-rises, corporate headquarters, and suburban office campuses.',
    href: '/industries#office-buildings'
  },
  {
    number: '02',
    name: 'Retail Centers & Commercial Showrooms',
    desc: 'High-foot-traffic centers, open-air retail strips, and customer showrooms.',
    href: '/industries#retail-spaces'
  },
  {
    number: '03',
    name: 'Healthcare & Medical Facilities',
    desc: 'Outpatient medical centers, specialized clinics, and professional medical suites.',
    href: '/industries#healthcare-facilities'
  },
  {
    number: '04',
    name: 'Hospitality & Venue Properties',
    desc: 'Boutique hotels, event venues, and continuous-occupancy hospitality facilities.',
    href: '/industries#hospitality'
  },
  {
    number: '05',
    name: 'Industrial & Flex Facilities',
    desc: 'Distribution nodes, flex warehouse spaces, and commercial light-industrial parks.',
    href: '/industries#industrial-flex'
  }
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#F3F7F5] min-h-screen">
      
      {/* 1. Hero: Commercial Operating Identity */}
      <section className="bg-[#063B35] text-white py-16 sm:py-24 relative overflow-hidden border-b border-[#063B35]">
        {/* Subtle architectural dot grid background */}
        <div 
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#00C875_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" 
          aria-hidden="true"
        />
        
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <SectionBadge label="COMPANY PHILOSOPHY" variant="white" />
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase leading-[1.15] text-white">
                COMMERCIAL FACILITY STEWARDSHIP BUILT FOR OPERATIONAL RELIABILITY.
              </h1>
              
              <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Northstar is an Austin-based commercial facility-services company focused on coordinated maintenance, multi-trade service, preventive care, and reliable facility operations across Central Texas.
              </p>

              <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-2xl">
                We help commercial property managers, asset managers, and facility owners move away from fragmented single-trade coordination toward organized, documented maintenance that protects physical assets over time.
              </p>

              {/* Fast Operational Attributes */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold border border-white/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />
                  Coordinated Multi-Trade Service
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold border border-white/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />
                  Preventive Maintenance Programs
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold border border-white/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C875]" />
                  Central Texas Regional Focus
                </span>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#08453E]">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80" 
                  alt="Modern commercial corporate facility architecture in Central Texas" 
                  className="w-full h-80 sm:h-96 object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#063B35] via-[#063B35]/40 to-transparent" />
                
                {/* Image Context Tag */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-[#063B35]/90 backdrop-blur-xs border border-white/15 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C875] block">
                    Regional Facility Operations
                  </span>
                  <p className="text-xs text-white/90 mt-0.5 font-medium">
                    Integrated stewardship across commercial office, retail, healthcare, hospitality, and flex environments.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 2. Operating Philosophy Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E1EBE7]">
        <Container>
          
          <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
            <SectionBadge label="OUR OPERATING PHILOSOPHY" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
              FACILITY CARE SHOULD BE PROACTIVE, COORDINATED, AND DOCUMENTED.
            </h2>
            <p className="text-sm sm:text-base text-[#617070] leading-relaxed">
              Commercial facilities operate best when maintenance is managed as an interconnected discipline rather than a series of disconnected emergency repairs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PHILOSOPHY_PILLARS.map((item) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={item.id}
                  className="rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] p-7 sm:p-8 flex flex-col justify-between hover:border-[#00B86B]/40 transition-colors shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-[#063B35] text-[#00C875] flex items-center justify-center shadow-xs">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold tracking-wider text-[#00B86B] bg-[#00B86B]/10 px-3 py-1 rounded-full border border-[#00B86B]/20">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#063B35] tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#617070] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </Container>
      </section>

      {/* 3. Core Operating Principles (Refined Pillars) */}
      <section className="py-16 sm:py-24 bg-[#F3F7F5] border-b border-[#E1EBE7]">
        <Container>
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <SectionBadge label="OPERATING PRINCIPLES" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
              BUILT FOR MODERN COMMERCIAL OPERATIONS
            </h2>
            <p className="text-[#617070] text-sm sm:text-base leading-relaxed">
              Our business is engineered around four straightforward operating commitments to property stakeholders:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_PRINCIPLES.map((principle) => {
              const PrincipleIcon = principle.icon;
              return (
                <div 
                  key={principle.id}
                  className="p-7 rounded-3xl bg-white border border-[#E1EBE7] space-y-3 shadow-xs hover:border-[#00B86B]/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#063B35] text-[#00C875] flex items-center justify-center">
                    <PrincipleIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#063B35] tracking-tight uppercase">
                    {principle.title}
                  </h3>
                  <p className="text-xs text-[#617070] leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>

        </Container>
      </section>

      {/* 4. Property Environments + Custom Service Positioning */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E1EBE7]">
        <Container>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Header & Sector List */}
            <div className="lg:col-span-7 space-y-6">
              <SectionBadge label="BUILT AROUND THE FACILITY" variant="emerald" />
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
                NOT EVERY PROPERTY OPERATES THE SAME WAY.
              </h2>
              
              <p className="text-sm sm:text-base text-[#617070] leading-relaxed">
                Northstar&apos;s featured industries represent common property environments we regularly support across Central Texas. However, our service approach is designed to adapt around your specific building footprint, operating conditions, occupancy hours, access requirements, and maintenance priorities.
              </p>

              {/* 5 Sectors List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#063B35] block">
                  Common Facility Environments
                </span>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {FEATURED_SECTORS.map((sector) => (
                    <Link
                      key={sector.number}
                      to={sector.href}
                      className="p-3.5 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] hover:border-[#00B86B] hover:bg-white transition-all flex items-center justify-between group min-h-[44px]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-[#00B86B] bg-[#00B86B]/10 px-2 py-0.5 rounded">
                          {sector.number}
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#063B35] group-hover:text-[#00B86B] transition-colors">
                            {sector.name}
                          </h4>
                          <p className="text-[11px] text-[#617070] hidden sm:block mt-0.5">
                            {sector.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#617070] group-hover:text-[#00B86B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </Link>
                  ))}
                </div>

                <div className="pt-2">
                  <Link 
                    to="/industries" 
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00B86B] hover:text-[#063B35] transition-colors group min-h-[44px]"
                  >
                    <span>Explore Featured Industries</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Custom Scope Callout Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] p-7 sm:p-8 space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-[#063B35] text-[#00C875] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-[#063B35] tracking-tight uppercase">
                  Don&apos;t See Your Facility Type?
                </h3>

                <p className="text-xs sm:text-sm text-[#102A2A] font-medium leading-relaxed">
                  Northstar can tailor its service approach around your property&apos;s specific requirements.
                </p>

                <p className="text-xs text-[#617070] leading-relaxed">
                  Featured sectors represent our most common commercial profiles, not an exclusive client list. Whether you manage a private educational campus, place of worship, municipal facility, arts venue, or specialized commercial site, our multi-trade workflows adjust around your building access, occupancy schedules, and maintenance needs.
                </p>

                <div className="pt-2">
                  <Button
                    to="/contact"
                    variant="primary"
                    size="md"
                    withArrow
                    className="w-full justify-center font-bold min-h-[44px]"
                  >
                    Discuss Your Facility
                  </Button>
                </div>

                <p className="text-[11px] text-[#617070] text-center">
                  Consultations tailored to Central Texas commercial properties
                </p>
              </div>
            </div>

          </div>

        </Container>
      </section>

      {/* 5. Regional Operations: Austin & Central Texas */}
      <section className="py-16 sm:py-24 bg-[#F3F7F5]">
        <Container>
          
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-12 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Submarket Coverage */}
              <div className="lg:col-span-6 space-y-5">
                <SectionBadge label="GEOGRAPHIC FOCUS" variant="emerald" />
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                  SERVING AUSTIN & CENTRAL TEXAS
                </h2>
                
                <p className="text-sm text-[#617070] leading-relaxed">
                  Northstar focuses its facility services across the Greater Austin metropolitan corridor and neighboring Central Texas submarkets, providing coordinated routine maintenance and priority response for commercial properties.
                </p>

                {/* Submarket Badges */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#063B35] block">
                    Core Regional Coverage
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SERVICE_AREAS.map((area, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F3F7F5] border border-[#E1EBE7]"
                      >
                        <MapPin className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-[#063B35] block">{area.city}</span>
                          <span className="text-[11px] text-[#617070] block">{area.area}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Regional Operations Card */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl bg-[#063B35] text-white p-7 sm:p-8 space-y-6 relative overflow-hidden shadow-lg border border-[#08453E]">
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#00C875]">
                      OPERATIONS FOCUS
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                      Northstar Central Operations
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80 font-medium">
                      Austin, Texas · 300 Colorado St, Suite 1900, Austin, TX 78701
                    </p>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-white/80 font-medium">Routine Service Hours:</span>
                      <span className="font-semibold text-white">Mon–Fri · 7:00 AM – 6:00 PM</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <span className="text-white/80 font-medium">Urgent Facility Needs:</span>
                      <span className="font-semibold text-[#00C875]">
                        Priority coordination available for emergency service requests
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button 
                      to="/contact" 
                      variant="secondary" 
                      size="md" 
                      withArrow 
                      className="w-full justify-center font-bold min-h-[44px]"
                    >
                      Request Property Service
                    </Button>
                  </div>

                  <p className="text-[11px] text-white/70 text-center">
                    Direct operations dispatch for commercial portfolios in Central Texas
                  </p>
                </div>
              </div>

            </div>
          </div>

        </Container>
      </section>

      {/* 6. Closing Action CTA */}
      <section className="py-16 sm:py-24 bg-[#063B35] text-white border-t border-[#08453E] relative overflow-hidden">
        {/* Subtle background glow */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-[#00B86B]/10 rounded-full blur-3xl pointer-events-none" 
          aria-hidden="true" 
        />
        
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <SectionBadge label="READY TO PLAN YOUR FACILITY SUPPORT?" variant="white" />
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-white">
              BUILD A MORE RELIABLE FACILITY OPERATION.
            </h2>
            
            <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Tell us about your property, current maintenance needs, and operating priorities. We&apos;ll help define an appropriate service approach.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                to="/contact"
                variant="secondary"
                size="lg"
                withArrow
                className="w-full sm:w-auto justify-center font-bold min-h-[44px]"
              >
                REQUEST A FACILITY ASSESSMENT
              </Button>

              <Link
                to="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors text-center min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white"
              >
                EXPLORE SERVICES
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. Back to Home Navigation Action */}
      <BackToHome />

    </div>
  );
};
