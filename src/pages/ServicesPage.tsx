import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  PhoneCall, 
  ArrowRight,
  ArrowDown,
  Building2,
  MapPin,
  FileCheck,
  ChevronDown,
  CalendarCheck,
  Layers,
  Users,
  Check
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionBadge } from '../components/ui/SectionBadge';
import { Button } from '../components/ui/Button';
import { BackToHome } from '../components/ui/BackToHome';
import { SERVICES } from '../data/northstarData';

export const ServicesPage: React.FC = () => {
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

  // Group services into three commercial categories
  const coreTrades = SERVICES.filter(s => ['commercial-hvac', 'electrical', 'plumbing'].includes(s.id));
  const facilityPrograms = SERVICES.filter(s => ['general-maintenance', 'preventive-maintenance'].includes(s.id));
  const urgentResponse = SERVICES.filter(s => ['emergency-services'].includes(s.id));

  return (
    <div className="bg-[#F3F7F5] min-h-screen">
      
      {/* 1. Services Page Hero with Architectural Context */}
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
                <SectionBadge label="COMMERCIAL FACILITY SERVICES" variant="white" />
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase leading-[1.15] text-white">
                SPECIALIZED COMMERCIAL FACILITY SERVICES
              </h1>
              
              <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl">
                From routine preventive maintenance to multi-trade field dispatch, Northstar provides property managers, building owners, and portfolio operators with coordinated facility support and single-source accountability across Central Texas.
              </p>
              
              {/* Primary and Secondary CTA Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button 
                  to="/contact" 
                  variant="primary" 
                  size="lg" 
                  withArrow
                  className="shadow-lg hover:shadow-xl font-bold"
                >
                  Request Service / Contract Inquiry
                </Button>
                
                <a
                  href="#commercial-hvac"
                  onClick={(e) => handleJump(e, 'commercial-hvac')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
                  title="Explore commercial service details below"
                >
                  <span>Explore Services</span>
                  <ArrowDown className="w-4 h-4 text-[#00C875]" />
                </a>
              </div>
            </div>

            {/* Right Column: Commercial Property Operations Context Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-7 backdrop-blur-md space-y-5 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C875] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                      Austin Metro Dispatch
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-white/60">
                    MSA & On-Demand
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Coordinated multi-trade service delivery for Class A & B commercial offices, flex industrial warehouses, and retail centers throughout Greater Austin.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 text-xs text-white/90">
                    <Building2 className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" />
                    <span><strong>Single-Point Accountability:</strong> 6 core trade scopes consolidated under one master agreement and field point of contact.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-white/90">
                    <MapPin className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" />
                    <span><strong>Regional Coverage:</strong> Rapid response across Travis, Williamson, and Hays counties.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-white/90">
                    <FileCheck className="w-4 h-4 text-[#00C875] shrink-0 mt-0.5" />
                    <span><strong>Transparent Operations:</strong> Digital work orders, photographic closeout reports, and itemized invoicing.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 2. Quick-Jump Service Navigation Dock */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-white/15">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00C875]">
                Direct Service Jump Navigation
              </span>
              <span className="text-xs text-white/60">
                Select a commercial service to review capabilities and scope:
              </span>
            </div>

            {/* Category-Organized Quick Jump Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              
              {/* Category 1: Core Trades */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">
                    Core Trades
                  </span>
                  <span className="text-[10px] text-white/40 uppercase font-mono">
                    3 Trades
                  </span>
                </div>
                <div className="space-y-1.5">
                  {coreTrades.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={(e) => handleJump(e, s.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-[#00C875]/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-mono font-bold text-[#00C875] bg-[#00C875]/15 px-2 py-0.5 rounded">
                          {s.number}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00C875] transition-colors truncate">
                          {s.title}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#00C875] group-hover:translate-y-0.5 transition-all shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Category 2: Facility Programs */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">
                    Facility Programs
                  </span>
                  <span className="text-[10px] text-white/40 uppercase font-mono">
                    2 Programs
                  </span>
                </div>
                <div className="space-y-1.5">
                  {facilityPrograms.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={(e) => handleJump(e, s.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-[#00C875]/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-mono font-bold text-[#00C875] bg-[#00C875]/15 px-2 py-0.5 rounded">
                          {s.number}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00C875] transition-colors truncate">
                          {s.title}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#00C875] group-hover:translate-y-0.5 transition-all shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Category 3: Urgent Response */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/70">
                    Urgent Response
                  </span>
                  <span className="text-[10px] text-red-300 uppercase font-mono font-bold">
                    24/7 Priority
                  </span>
                </div>
                <div className="space-y-1.5">
                  {urgentResponse.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={(e) => handleJump(e, s.id)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 hover:border-red-400/50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-mono font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded">
                          {s.number}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00C875] transition-colors block truncate">
                            {s.title}
                          </span>
                          <span className="text-[11px] text-white/50 block truncate">
                            Austin Critical Dispatch
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-[#00C875] group-hover:translate-y-0.5 transition-all shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </Container>
      </section>

      {/* Services List Detail Sections: Three Commercial Operational Groups */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="space-y-20 sm:space-y-28">

            {/* GROUP 1: CORE TRADES */}
            <div className="space-y-10">
              {/* Group 1 Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-[#E1EBE7]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-0.5 rounded-full">
                      Operational Group 01
                    </span>
                    <span className="text-xs text-[#617070] font-medium">• Commercial Physical Plant</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                    Core Trades
                  </h2>
                  <p className="text-sm text-[#617070] mt-1 max-w-2xl">
                    Licensed, code-compliant commercial trade specialists managing primary mechanical, power, and plumbing infrastructure.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold text-[#617070] shrink-0">
                  Services 01 — 03
                </div>
              </div>

              {/* Core Trades Cards */}
              <div className="space-y-10 sm:space-y-14">
                {coreTrades.map((service) => (
                  <article
                    key={service.id}
                    id={service.id}
                    className="scroll-mt-32 bg-white rounded-3xl border border-[#E1EBE7] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      
                      {/* Media Column */}
                      <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[440px] bg-slate-900">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                        
                        {/* Top Badges on Image */}
                        <div className="absolute top-6 left-6 flex items-center gap-2">
                          <span className="bg-[#063B35] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm">
                            {service.number}
                          </span>
                          {service.urgencyLevel && (
                            <span className="bg-white/95 backdrop-blur-sm text-[#063B35] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                              <Clock className="w-3.5 h-3.5 text-[#00B86B]" />
                              <span>{service.urgencyLevel}</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom Context Badge (NO duplicate title!) */}
                        <div className="absolute bottom-5 left-6">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15">
                            Central Texas Field Service
                          </span>
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                        <div className="space-y-5">
                          
                          {/* 1. Category & Number Eyebrow */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00B86B]">
                              {service.number} • Core Trade
                            </span>
                          </div>

                          {/* 2. Dominant Title */}
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                              {service.title}
                            </h3>
                            {/* 3. Short Commercial Value Statement */}
                            <p className="text-sm font-semibold text-[#063B35]/90 mt-1">
                              {service.tagline}
                            </p>
                          </div>

                          {/* 4. Primary Service Description */}
                          <p className="text-sm text-[#506160] leading-relaxed">
                            {service.fullDescription}
                          </p>

                          {/* 5. Key Capabilities */}
                          <div className="pt-2 border-t border-[#F0F5F2]">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B35] mb-2.5">
                              Key Capabilities & Technical Scope:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {service.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-[#102A2A]">
                                  <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 6. Typical Commercial Applications */}
                          <div className="pt-2">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#617070] mb-2">
                              Typical Commercial Applications:
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {service.capabilities.map((cap, idx) => (
                                <span
                                  key={idx}
                                  className="bg-[#F3F7F5] text-[#102A2A] text-xs font-medium px-2.5 py-1 rounded-md border border-[#E1EBE7]"
                                >
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* 7. Action Bar & CTA */}
                        <div className="pt-6 mt-6 border-t border-[#E1EBE7] flex flex-wrap items-center justify-between gap-4">
                          <div className="text-xs text-[#617070]">
                            Available for on-demand dispatch or multi-year preventive service contracts.
                          </div>

                          <Button
                            to={`/contact?service=${service.id}`}
                            variant="primary"
                            size="md"
                            withArrow
                          >
                            Request {service.title}
                          </Button>
                        </div>

                      </div>

                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* GROUP 2: FACILITY PROGRAMS */}
            <div className="space-y-10">
              {/* Group 2 Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-[#E1EBE7]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-0.5 rounded-full">
                      Operational Group 02
                    </span>
                    <span className="text-xs text-[#617070] font-medium">• Building Operations</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                    Facility Programs
                  </h2>
                  <p className="text-sm text-[#617070] mt-1 max-w-2xl">
                    Structured day-to-day maintenance and scheduled preventive agreements designed to protect capital assets and ensure operational continuity.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold text-[#617070] shrink-0">
                  Services 04 — 05
                </div>
              </div>

              {/* Facility Programs Cards */}
              <div className="space-y-10 sm:space-y-14">
                {facilityPrograms.map((service) => {
                  const isPreventive = service.id === 'preventive-maintenance';

                  return (
                    <article
                      key={service.id}
                      id={service.id}
                      className={`scroll-mt-32 bg-white rounded-3xl overflow-hidden transition-all ${
                        isPreventive 
                          ? 'border-2 border-[#00B86B]/50 shadow-md hover:shadow-lg' 
                          : 'border border-[#E1EBE7] shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* Modest visual banner for Preventive Maintenance */}
                      {isPreventive && (
                        <div className="bg-[#063B35] text-white px-6 py-2.5 flex items-center justify-between text-xs border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <CalendarCheck className="w-4 h-4 text-[#00C875]" />
                            <span className="font-bold uppercase tracking-wider">
                              Ongoing Facility Program • Asset Protection & Planned Maintenance
                            </span>
                          </div>
                          <span className="hidden sm:inline text-white/70 font-mono text-[11px]">
                            Quarterly & Annual Contracts
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                        
                        {/* Media Column */}
                        <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[440px] bg-slate-900">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                          
                          {/* Top Badges on Image */}
                          <div className="absolute top-6 left-6 flex items-center gap-2">
                            <span className="bg-[#063B35] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm">
                              {service.number}
                            </span>
                            {service.urgencyLevel && (
                              <span className="bg-white/95 backdrop-blur-sm text-[#063B35] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                                <Clock className="w-3.5 h-3.5 text-[#00B86B]" />
                                <span>{service.urgencyLevel}</span>
                              </span>
                            )}
                          </div>

                          {/* Bottom Context Badge (NO duplicate title!) */}
                          <div className="absolute bottom-5 left-6">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15">
                              {isPreventive ? 'Planned Maintenance Program' : 'Routine Facility Care'}
                            </span>
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                          <div className="space-y-5">
                            
                            {/* 1. Category & Number Eyebrow */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00B86B]">
                                {service.number} • {isPreventive ? 'Core Scheduled Program' : 'Facility Program'}
                              </span>
                            </div>

                            {/* 2. Dominant Title */}
                            <div>
                              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                                {service.title}
                              </h3>
                              {/* 3. Short Commercial Value Statement */}
                              <p className="text-sm font-semibold text-[#063B35]/90 mt-1">
                                {service.tagline}
                              </p>
                            </div>

                            {/* 4. Primary Service Description */}
                            <p className="text-sm text-[#506160] leading-relaxed">
                              {service.fullDescription}
                            </p>

                            {/* 5. Key Capabilities */}
                            <div className="pt-2 border-t border-[#F0F5F2]">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B35] mb-2.5">
                                Key Capabilities & Technical Scope:
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {service.features.map((feat, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-xs text-[#102A2A]">
                                    <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 6. Typical Commercial Applications */}
                            <div className="pt-2">
                              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#617070] mb-2">
                                Typical Commercial Applications:
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {service.capabilities.map((cap, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-[#F3F7F5] text-[#102A2A] text-xs font-medium px-2.5 py-1 rounded-md border border-[#E1EBE7]"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* 7. Action Bar & CTA */}
                          <div className="pt-6 mt-6 border-t border-[#E1EBE7] flex flex-wrap items-center justify-between gap-4">
                            <div className="text-xs text-[#617070]">
                              {isPreventive 
                                ? 'Digital logs, asset tagging, and multi-facility contract options.'
                                : 'Available for routine service tickets or scheduled facility upkeep.'}
                            </div>

                            <Button
                              to={`/contact?service=${service.id}`}
                              variant="primary"
                              size="md"
                              withArrow
                            >
                              {isPreventive ? 'Inquire About Maintenance Plan' : `Request ${service.title}`}
                            </Button>
                          </div>

                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* GROUP 3: URGENT RESPONSE */}
            <div className="space-y-10">
              {/* Group 3 Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5 border-b border-[#E1EBE7]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-red-700 bg-red-500/10 px-2.5 py-0.5 rounded-full">
                      Operational Group 03
                    </span>
                    <span className="text-xs text-[#617070] font-medium">• Critical Incident Response</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                    Urgent Response
                  </h2>
                  <p className="text-sm text-[#617070] mt-1 max-w-2xl">
                    Rapid field mobilization across Greater Austin to isolate hazards, stabilize property operations, and protect physical assets.
                  </p>
                </div>
                <div className="text-xs font-mono font-semibold text-red-600 shrink-0">
                  Service 06 • 24/7 Priority
                </div>
              </div>

              {/* Emergency Services Card */}
              <div className="space-y-10">
                {urgentResponse.map((service) => (
                  <article
                    key={service.id}
                    id={service.id}
                    className="scroll-mt-32 bg-white rounded-3xl border border-red-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Urgency Dispatch Top Ribbon */}
                    <div className="bg-[#063B35] text-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                        <span className="font-bold uppercase tracking-wider text-red-200">
                          Austin Regional Priority Dispatch
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-white/80 font-mono text-[11px]">
                        <span>Travis • Williamson • Hays Counties</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      
                      {/* Media Column */}
                      <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-[440px] bg-slate-900">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                        
                        {/* Top Badges on Image */}
                        <div className="absolute top-6 left-6 flex items-center gap-2">
                          <span className="bg-[#063B35] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider shadow-sm">
                            {service.number}
                          </span>
                          <span className="bg-white/95 backdrop-blur-sm text-red-700 border border-red-200/80 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-red-600" />
                            <span>Urgent Priority Dispatch</span>
                          </span>
                        </div>

                        {/* Bottom Context Badge (NO duplicate title!) */}
                        <div className="absolute bottom-5 left-6">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15">
                            Active Incident Stabilization
                          </span>
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                        <div className="space-y-5">
                          
                          {/* 1. Category & Number Eyebrow */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600">
                              {service.number} • Urgent Response
                            </span>
                          </div>

                          {/* 2. Dominant Title */}
                          <div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                              {service.title}
                            </h3>
                            {/* 3. Short Commercial Value Statement */}
                            <p className="text-sm font-semibold text-[#063B35]/90 mt-1">
                              {service.tagline}
                            </p>
                          </div>

                          {/* 4. Primary Service Description */}
                          <p className="text-sm text-[#506160] leading-relaxed">
                            {service.fullDescription}
                          </p>

                          {/* 5. Key Capabilities */}
                          <div className="pt-2 border-t border-[#F0F5F2]">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#063B35] mb-2.5">
                              Key Capabilities & Technical Scope:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {service.features.map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-[#102A2A]">
                                  <CheckCircle2 className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 6. Typical Commercial Applications */}
                          <div className="pt-2">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#617070] mb-2">
                              Typical Commercial Scenarios:
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {service.capabilities.map((cap, idx) => (
                                <span
                                  key={idx}
                                  className="bg-[#F3F7F5] text-[#102A2A] text-xs font-medium px-2.5 py-1 rounded-md border border-[#E1EBE7]"
                                >
                                  {cap}
                                </span>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* 7. Action Bar & CTA */}
                        <div className="pt-6 mt-6 border-t border-[#E1EBE7] flex flex-wrap items-center justify-between gap-4">
                          <div className="text-xs text-[#617070]">
                            For active leaks, power loss, or immediate structural hazards.
                          </div>

                          <div className="flex items-center gap-3">
                            <a
                              href="tel:5125550190"
                              className="inline-flex items-center gap-2 text-xs font-bold text-[#063B35] bg-[#F3F7F5] hover:bg-[#E1EBE7] px-4 py-2.5 rounded-full border border-[#E1EBE7] transition-colors focus:outline-none focus:ring-2 focus:ring-[#00B86B] min-h-[44px]"
                              title="Call Austin Emergency Dispatch Line"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-[#00B86B]" />
                              <span>(512) 555-0190</span>
                            </a>

                            <Button
                              to={`/contact?service=${service.id}`}
                              variant="primary"
                              size="md"
                              withArrow
                            >
                              Request Emergency Dispatch
                            </Button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </article>
                ))}
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* SECTION 1 — SERVICE DELIVERY FRAMEWORK */}
      <section className="py-20 sm:py-24 bg-white border-t border-[#E1EBE7]">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="mb-3">
              <SectionBadge label="OPERATIONAL PROCESS" variant="emerald" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
              BUILT FOR COMMERCIAL OPERATIONS
            </h2>
            <p className="text-base sm:text-lg text-[#506160] mt-3 leading-relaxed">
              From the first service request through field completion, Northstar keeps commercial facility work coordinated, documented, and easy to track.
            </p>
          </div>

          {/* 4-Step Process Grid */}
          <div className="relative">
            {/* Desktop Connector Line */}
            <div 
              className="hidden lg:block absolute top-[52px] left-12 right-12 h-0.5 bg-[#E1EBE7] z-0" 
              aria-hidden="true" 
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 01 */}
              <div className="bg-[#F3F7F5] rounded-2xl p-6 sm:p-7 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#063B35] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm mb-6">
                    01
                  </div>
                  <h3 className="text-sm font-mono font-bold text-[#063B35] tracking-wider uppercase mb-2">
                    01 — COORDINATE
                  </h3>
                  <p className="text-sm text-[#506160] leading-relaxed">
                    Capture the request, property details, access requirements, and service scope.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-[11px] font-mono font-semibold text-[#00B86B] uppercase tracking-wider">
                  Request Intake
                </div>
              </div>

              {/* Step 02 */}
              <div className="bg-[#F3F7F5] rounded-2xl p-6 sm:p-7 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#063B35] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm mb-6">
                    02
                  </div>
                  <h3 className="text-sm font-mono font-bold text-[#063B35] tracking-wider uppercase mb-2">
                    02 — TRIAGE
                  </h3>
                  <p className="text-sm text-[#506160] leading-relaxed">
                    Prioritize the issue, identify the appropriate trade, and establish the next action.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-[11px] font-mono font-semibold text-[#00B86B] uppercase tracking-wider">
                  Trade Assignment
                </div>
              </div>

              {/* Step 03 */}
              <div className="bg-[#F3F7F5] rounded-2xl p-6 sm:p-7 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#063B35] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm mb-6">
                    03
                  </div>
                  <h3 className="text-sm font-mono font-bold text-[#063B35] tracking-wider uppercase mb-2">
                    03 — EXECUTE
                  </h3>
                  <p className="text-sm text-[#506160] leading-relaxed">
                    Coordinate the right field service scope and keep stakeholders aligned through completion.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-[11px] font-mono font-semibold text-[#00B86B] uppercase tracking-wider">
                  Field Operations
                </div>
              </div>

              {/* Step 04 */}
              <div className="bg-[#F3F7F5] rounded-2xl p-6 sm:p-7 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#063B35] text-white flex items-center justify-center font-mono font-bold text-sm shadow-sm mb-6">
                    04
                  </div>
                  <h3 className="text-sm font-mono font-bold text-[#063B35] tracking-wider uppercase mb-2">
                    04 — CLOSE OUT
                  </h3>
                  <p className="text-sm text-[#506160] leading-relaxed">
                    Document completed work with digital work orders, service notes, and photographic closeout details.
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-[11px] font-mono font-semibold text-[#00B86B] uppercase tracking-wider">
                  Work Order Records
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 2 — ENGAGEMENT MODELS */}
      <section className="py-20 sm:py-24 bg-[#F3F7F5] border-t border-[#E1EBE7]">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="mb-3">
              <SectionBadge label="COMMERCIAL ENGAGEMENT" variant="emerald" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
              FLEXIBLE SERVICE MODELS FOR EVERY PROPERTY
            </h2>
            <p className="text-base sm:text-lg text-[#506160] mt-3 leading-relaxed">
              Choose the level of support that fits your property, maintenance program, and operational needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* CARD 01: ON-DEMAND WORK ORDERS */}
            <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-10 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#617070]">
                    01 • Task-Based Service
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#063B35] tracking-tight uppercase mt-1">
                    ON-DEMAND WORK ORDERS
                  </h3>
                  <p className="text-sm text-[#506160] mt-3 leading-relaxed">
                    For individual repairs, maintenance requests, inspections, and project-based facility work.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0F5F2] space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#063B35] block mb-2">
                    Included Scopes:
                  </span>
                  {[
                    'Single-service requests',
                    'Multi-trade work orders',
                    'Property inspections',
                    'Repair and replacement scopes'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#102A2A]">
                      <Check className="w-4 h-4 text-[#00B86B] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#E1EBE7]">
                <Button
                  to="/contact?service=general-maintenance"
                  variant="outline"
                  size="md"
                  withArrow
                  className="w-full justify-center font-bold"
                >
                  Request Service
                </Button>
              </div>
            </div>

            {/* CARD 02: PREVENTIVE MAINTENANCE PROGRAMS */}
            <div className="bg-white rounded-3xl border-2 border-[#00B86B]/60 p-8 sm:p-10 flex flex-col justify-between shadow-md hover:shadow-lg transition-all relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#063B35] text-white text-[11px] font-mono font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-[#00B86B]/30 whitespace-nowrap">
                <CalendarCheck className="w-3.5 h-3.5 text-[#00C875]" />
                <span>Core Facility Program</span>
              </div>

              <div className="space-y-6 pt-2">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00B86B]">
                    02 • Scheduled Program
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#063B35] tracking-tight uppercase mt-1">
                    PREVENTIVE MAINTENANCE PROGRAMS
                  </h3>
                  <p className="text-sm text-[#506160] mt-3 leading-relaxed">
                    For properties that need a structured approach to recurring maintenance and asset protection.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0F5F2] space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#063B35] block mb-2">
                    Program Elements:
                  </span>
                  {[
                    'Scheduled maintenance',
                    'Recurring service visits',
                    'Asset-focused maintenance planning',
                    'Service documentation'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#102A2A]">
                      <Check className="w-4 h-4 text-[#00B86B] shrink-0" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#E1EBE7]">
                <Button
                  to="/contact?service=preventive-maintenance"
                  variant="primary"
                  size="md"
                  withArrow
                  className="w-full justify-center font-bold shadow-md"
                >
                  Discuss a Maintenance Plan
                </Button>
              </div>
            </div>

            {/* CARD 03: PRIORITY EMERGENCY RESPONSE */}
            <div className="bg-white rounded-3xl border border-red-200/80 p-8 sm:p-10 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-600">
                      03 • Urgent Response
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      24/7 Priority
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#063B35] tracking-tight uppercase mt-1">
                    PRIORITY EMERGENCY RESPONSE
                  </h3>
                  <p className="text-sm text-[#506160] mt-3 leading-relaxed">
                    For urgent facility issues that require coordinated incident response and rapid dispatch.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0F5F2] space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#063B35] block mb-2">
                    Response Scope:
                  </span>
                  {[
                    'Critical building issues',
                    'Emergency trade dispatch',
                    'Incident stabilization',
                    'Priority coordination'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#102A2A]">
                      <Check className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-[#E1EBE7]">
                <Button
                  to="/contact?service=emergency-services"
                  variant="primary"
                  size="md"
                  withArrow
                  className="w-full justify-center font-bold bg-[#063B35] hover:bg-[#042925] text-white"
                >
                  Request Emergency Service
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 3 — PORTFOLIO / MULTI-PROPERTY SUPPORT */}
      <section className="py-20 sm:py-24 bg-white border-t border-[#E1EBE7]">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="mb-3">
              <SectionBadge label="PORTFOLIO OPERATIONS" variant="emerald" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
              ONE OPERATING PARTNER ACROSS YOUR PROPERTY PORTFOLIO
            </h2>
            <p className="text-base sm:text-lg text-[#506160] mt-3 leading-relaxed">
              Coordinate recurring maintenance, repair requests, and facility service activity across multiple commercial properties through a single operational point of contact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Block 1 */}
            <div className="bg-[#F3F7F5] rounded-3xl p-8 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E1EBE7] flex items-center justify-center text-[#063B35] shadow-xs mb-6">
                  <Building2 className="w-6 h-6 text-[#00B86B]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#063B35] tracking-tight uppercase mb-2">
                  MULTI-SITE COORDINATION
                </h3>
                <p className="text-sm text-[#506160] leading-relaxed">
                  Organize service activity across multiple commercial locations.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-xs font-medium text-[#617070]">
                Single operational point of contact for portfolio property managers.
              </div>
            </div>

            {/* Block 2 */}
            <div className="bg-[#F3F7F5] rounded-3xl p-8 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E1EBE7] flex items-center justify-center text-[#063B35] shadow-xs mb-6">
                  <Layers className="w-6 h-6 text-[#00B86B]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#063B35] tracking-tight uppercase mb-2">
                  CONSISTENT WORKFLOWS
                </h3>
                <p className="text-sm text-[#506160] leading-relaxed">
                  Use repeatable service and documentation processes across properties.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-xs font-medium text-[#617070]">
                Standardized intake, dispatch protocols, and work order records.
              </div>
            </div>

            {/* Block 3 */}
            <div className="bg-[#F3F7F5] rounded-3xl p-8 border border-[#E1EBE7] flex flex-col justify-between hover:border-[#00B86B]/40 hover:-translate-y-0.5 transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E1EBE7] flex items-center justify-center text-[#063B35] shadow-xs mb-6">
                  <Users className="w-6 h-6 text-[#00B86B]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#063B35] tracking-tight uppercase mb-2">
                  CENTRALIZED COMMUNICATION
                </h3>
                <p className="text-sm text-[#506160] leading-relaxed">
                  Keep property teams, service requests, and completion details connected.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-[#E1EBE7]/60 text-xs font-medium text-[#617070]">
                Clear operational transparency for owners and on-site teams.
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Emergency Callout Box (Preserved) */}
      <section className="py-12 bg-[#F3F7F5] border-y border-[#E1EBE7]">
        <Container>
          <div className="rounded-3xl bg-[#063B35] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Critical Property Emergency?</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Active Leak, Power Interruption, or HVAC Outage?
              </h3>
              <p className="text-white/80 text-sm">
                Our Austin emergency dispatch coordinates response for urgent commercial facility issues across Travis, Williamson, and Hays counties.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <a
                href="tel:5125550190"
                className="inline-flex items-center gap-2.5 bg-[#00B86B] hover:bg-[#00C875] text-[#063B35] font-bold px-6 py-3.5 rounded-full shadow-lg transition-all"
                title="Commercial Dispatch Line"
              >
                <PhoneCall className="w-4 h-4" />
                <span>(512) 555-0190</span>
              </a>

              <Button
                to="/contact?service=emergency-services"
                variant="outline"
                className="text-white border-white/40 hover:bg-white/10"
              >
                Submit Emergency Ticket
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* SECTION 4 — FINAL COMMERCIAL CTA */}
      <section className="py-20 sm:py-24 bg-white border-b border-[#E1EBE7]">
        <Container>
          <div className="rounded-3xl bg-[#063B35] text-white p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-md">
            {/* Subtle architectural grid pattern */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#00C875 1px, transparent 1px)', 
                backgroundSize: '24px 24px' 
              }} 
            />

            <div className="relative z-10 max-w-2xl space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00C875] bg-[#00C875]/15 px-3 py-1 rounded-full border border-[#00C875]/25">
                  READY TO PLAN YOUR NEXT SERVICE?
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase leading-[1.15] text-white">
                LET'S BUILD A MORE RELIABLE FACILITY OPERATION.
              </h2>

              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Tell us what your property needs, and we'll help define the right service scope, maintenance approach, or next operational step.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  to="/contact"
                  variant="primary"
                  size="lg"
                  withArrow
                  className="shadow-lg hover:shadow-xl font-bold"
                >
                  Request Service
                </Button>

                <Button
                  to="/industries"
                  variant="outline"
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/10 hover:border-white/50"
                >
                  Explore Industries
                </Button>
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
