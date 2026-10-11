import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Wrench, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionBadge } from '../components/ui/SectionBadge';
import { Container } from '../components/ui/Container';
import { HomeScrollSection, useHomeScrollTransitions } from '../components/home/HomeScrollSection';
import { SERVICES, INDUSTRIES, PROCESS_STEPS, DEMO_STATS } from '../data/northstarData';

export const HomePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useHomeScrollTransitions(containerRef);

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-[#F3F7F5] overflow-x-hidden">
      
      {/* 1. HERO SECTION (Scroll-linked: recedes upward when scrolling down toward About) */}
      <HomeScrollSection isFirst zIndex={10} className="pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden">
        <Container size="xl">
          <div className="relative rounded-3xl overflow-hidden bg-[#063B35] text-white border border-[#063B35]/30 shadow-xl">
            
            {/* Background Architecture Photo with subtle architectural overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85"
                alt="Modern commercial architectural building in Central Texas"
                className="w-full h-full object-cover object-center opacity-45 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#063B35]/95 via-[#063B35]/80 to-[#063B35]/45" />
              {/* Subtle architectural grid lines */}
              <div 
                className="absolute inset-0 opacity-10" 
                style={{ 
                  backgroundImage: 'radial-gradient(#00C875 1px, transparent 1px)', 
                  backgroundSize: '24px 24px' 
                }} 
              />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-24 md:py-32 max-w-4xl">
              
              {/* Eyebrow */}
              <div className="mb-6">
                <SectionBadge 
                  label="COMMERCIAL FACILITY SERVICES" 
                  variant="white"
                />
              </div>

              {/* Primary Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight uppercase leading-[1.08] text-white">
                ONE PARTNER FOR EVERYTHING <br className="hidden sm:block" />
                <span className="text-[#00B86B]">YOUR PROPERTY NEEDS.</span>
              </h1>

              {/* Supporting Text */}
              <p className="mt-6 text-base sm:text-xl text-white/85 max-w-2xl font-normal leading-relaxed">
                Reliable commercial maintenance and facility services for businesses across Austin and Central Texas.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4">
                <Button
                  to="/contact"
                  variant="secondary"
                  size="lg"
                  withArrow
                >
                  Request Service
                </Button>

                <Button
                  to="/services"
                  variant="outline"
                  size="lg"
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  Explore Services
                </Button>
              </div>

              {/* Subtle Supporting Indicators */}
              <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#00C875] shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <span>Maintenance</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#00C875] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Reliability</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#00C875] shrink-0">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>People</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#00C875] shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>Long-Term Value</span>
                </div>
              </div>

            </div>

          </div>
        </Container>
      </HomeScrollSection>

      {/* 2. INTRODUCTION / ABOUT SECTION */}
      <HomeScrollSection zIndex={20} className="py-16 md:py-24 bg-white border-y border-[#E1EBE7]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Badge, Heading, Underline */}
            <div data-reveal="header" className="lg:col-span-5 space-y-4">
              <div>
                <SectionBadge label="ABOUT NORTHSTAR" variant="emerald" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase leading-tight">
                YOUR FACILITY, <br />PROPERLY MANAGED.
              </h2>
              <div className="w-16 h-1 bg-[#00B86B] rounded-full mt-2" />
            </div>

            {/* Right Column: Supporting text, cards, CTA */}
            <div className="lg:col-span-7 space-y-6 text-[#102A2A] text-base sm:text-lg leading-relaxed">
              <div data-reveal="lead" className="space-y-4">
                <p className="font-medium text-[#063B35]">
                  Northstar helps businesses keep their properties safe, reliable, and well-maintained while reducing the complexity of managing multiple maintenance vendors.
                </p>
                
                <p className="text-[#617070] text-base">
                  Rather than chasing separate contractors for rooftop HVAC repairs, emergency plumbing leaks, three-phase electrical adjustments, and daily tenant work orders, property managers and commercial owners rely on Northstar as their dedicated single point of contact across Central Texas.
                </p>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div data-reveal="card" className="p-4 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00B86B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#063B35]">Unified Vendor Coordination</h4>
                    <p className="text-xs text-[#617070] mt-0.5">One master agreement and one phone call for every trade issue.</p>
                  </div>
                </div>

                <div data-reveal="card" className="p-4 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#00B86B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-[#063B35]">Predictable Facility Uptime</h4>
                    <p className="text-xs text-[#617070] mt-0.5">Proactive preventive cycles that protect tenant satisfaction and CapEx.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button to="/about" variant="outline" size="md" withArrow>
                  Read Our Full Story
                </Button>
              </div>

            </div>

          </div>
        </Container>
      </HomeScrollSection>

      {/* 3. SERVICES SECTION */}
      <HomeScrollSection zIndex={30} className="py-20 md:py-28 bg-[#F3F7F5]">
        <Container>
          {/* Section Header */}
          <div data-reveal="header" className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="space-y-3">
              <div>
                <SectionBadge label="COMPREHENSIVE CAPABILITIES" variant="emerald" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
                COMMERCIAL FACILITY SERVICES
              </h2>
              <p data-reveal="lead" className="text-[#617070] max-w-xl text-base">
                Commercial maintenance and facility services across Greater Austin and Central Texas.
              </p>
            </div>
            <div>
              <Button to="/services" variant="outline" size="md" withArrow>
                View All Services
              </Button>
            </div>
          </div>

          {/* 6 Visually Strong Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((service) => (
              <div 
                key={service.id}
                data-reveal="card"
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E1EBE7] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Container with Tag */}
                <div className="relative h-56 overflow-hidden bg-slate-900">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Service Number Badge */}
                  <div className="absolute top-4 left-4 bg-[#063B35] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                    {service.number}
                  </div>

                  {/* Urgency Badge */}
                  {service.urgencyLevel && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#063B35] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3 h-3 text-[#00B86B]" />
                      <span>{service.urgencyLevel}</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs text-[#00C875] font-semibold tracking-wide uppercase">
                      {service.tagline}
                    </p>
                    <h3 className="text-xl font-bold tracking-tight">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-sm text-[#617070] leading-relaxed">
                    {service.shortDescription}
                  </p>

                  <div className="pt-3 border-t border-[#E1EBE7] flex items-center justify-between">
                    <Link
                      to={`/services#${service.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-[#063B35] group-hover:text-[#00B86B] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Explore Scope</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/contact?service=${service.id}`}
                      className="w-9 h-9 rounded-full bg-[#F3F7F5] group-hover:bg-[#063B35] text-[#063B35] group-hover:text-white flex items-center justify-center transition-all"
                      title="Request this service"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </HomeScrollSection>

      {/* 4. INDUSTRIES SECTION */}
      <HomeScrollSection zIndex={40} className="py-20 md:py-28 bg-white border-t border-[#E1EBE7]">
        <Container>
          {/* Header */}
          <div data-reveal="header" className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div>
              <SectionBadge label="PORTFOLIO EXPERTISE" variant="emerald" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#063B35] tracking-tight uppercase">
              FACILITIES THAT POWER BUSINESSES
            </h2>
            <p data-reveal="lead" className="text-[#617070] text-base">
              Every property type requires tailored maintenance workflows, compliance standards, and occupant sensitivity.
            </p>
          </div>

          {/* Industry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDUSTRIES.map((industry) => (
              <div
                key={industry.id}
                data-reveal="card"
                className="group relative rounded-3xl overflow-hidden bg-[#F3F7F5] border border-[#E1EBE7] p-6 sm:p-7 flex flex-col justify-between hover:border-[#00B86B]/40 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="h-44 rounded-2xl overflow-hidden mb-5 bg-slate-100 relative">
                    <img 
                      src={industry.image} 
                      alt={industry.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-[#063B35] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {industry.tagline}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#063B35] mb-2">
                    {industry.title}
                  </h3>

                  <p className="text-sm text-[#617070] leading-relaxed mb-4">
                    {industry.description}
                  </p>

                  <div className="space-y-1.5 py-3 border-t border-[#E1EBE7]">
                    <span className="text-[11px] font-bold text-[#063B35] uppercase tracking-wider block">
                      Typical Assets:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {industry.propertyTypes.map((prop, idx) => (
                        <span key={idx} className="text-[11px] bg-white border border-[#E1EBE7] px-2.5 py-1 rounded-md text-[#102A2A]">
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    to={`/industries#${industry.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#063B35] hover:text-[#00B86B] uppercase tracking-wider transition-colors"
                  >
                    <span>View Property Solutions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Button to="/industries" variant="outline" size="md" withArrow>
              Learn More About Our Industry Solutions
            </Button>
          </div>
        </Container>
      </HomeScrollSection>

      {/* 5. PROCESS SECTION */}
      <HomeScrollSection zIndex={50} className="py-20 md:py-28 bg-[#063B35] text-white relative overflow-hidden">
        {/* Subtle geometric line accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00B86B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00C875]/5 rounded-full blur-3xl pointer-events-none" />

        <Container>
          {/* Header */}
          <div data-reveal="header" className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div>
              <SectionBadge label="STREAMLINED OPERATIONS" variant="white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase text-white">
              FROM REQUEST TO RESOLUTION
            </h2>
            <p data-reveal="lead" className="text-white/70 text-base">
              A transparent, five-step facility operating procedure ensuring clear communication, disciplined execution, and documented service history.
            </p>
          </div>

          {/* 5 Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {PROCESS_STEPS.map((step, idx) => (
              <div 
                key={step.step}
                data-process-card
                className="relative bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/10 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-[#00C875] tracking-tight">
                      {step.step}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                      PHASE {idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-wide mb-1">
                    {step.name}
                  </h3>
                  <p className="text-xs text-[#00B86B] font-medium mb-3">
                    {step.tagline}
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-white/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00B86B]" />
                  <span>Clear Service Process</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </HomeScrollSection>

      {/* 6. TRUST / DEMO STATISTICS SECTION */}
      <HomeScrollSection zIndex={60} className="py-20 md:py-24 bg-white border-b border-[#E1EBE7]">
        <Container>
          <div data-reveal="header" className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div>
                <SectionBadge label="OPERATIONAL METRICS" variant="emerald" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                DESIGNED FOR HIGH-VALUE COMMERCIAL ACCOUNTS
              </h2>
            </div>
            <div className="text-xs text-[#617070] bg-[#F3F7F5] border border-[#E1EBE7] px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 self-start md:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Demonstration Statistics for Portfolio Presentation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEMO_STATS.map((stat, idx) => (
              <div 
                key={idx}
                data-reveal="card"
                className="p-7 rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-2"
              >
                <div className="text-3xl sm:text-4xl font-black text-[#063B35] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#00B86B]">
                  {stat.label}
                </div>
                <p className="text-xs text-[#617070] leading-relaxed pt-1">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

          <div data-reveal="card" className="mt-12 p-6 rounded-3xl bg-[#063B35] text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00B86B]/20 flex items-center justify-center text-[#00C875] shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Central Texas Commercial Service Territory</h4>
                <p className="text-xs text-white/70">Serving Austin, The Domain, Round Rock, Cedar Park, Westlake, Georgetown, Buda, and San Marcos.</p>
              </div>
            </div>
            <Button to="/contact" variant="secondary" size="sm" withArrow>
              Schedule Property Walkthrough
            </Button>
          </div>
        </Container>
      </HomeScrollSection>

      {/* 7. FINAL CTA SECTION (isLast: settles into prominence without receding) */}
      <HomeScrollSection isLast zIndex={70} className="py-20 md:py-28 bg-[#F3F7F5]">
        <Container size="md">
          <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-14 text-center shadow-lg relative overflow-hidden">
            <div className="space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-[#00B86B]/15 text-[#063B35] mx-auto flex items-center justify-center">
                <Wrench className="w-8 h-8 text-[#00B86B]" />
              </div>

              {/* Headings */}
              <div data-reveal="header" className="space-y-2">
                <div>
                  <SectionBadge label="READY FOR PROACTIVE CARE?" variant="emerald" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#063B35] tracking-tight uppercase">
                  ONE PARTNER FOR EVERYTHING YOUR PROPERTY NEEDS.
                </h2>
                <p data-reveal="lead" className="text-[#617070] text-sm sm:text-base max-w-lg mx-auto">
                  Connect with our Austin facility operations team today to consolidate your maintenance vendors and protect long-term asset value.
                </p>
              </div>

              {/* Buttons */}
              <div data-reveal="card" className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <Button
                  to="/contact"
                  variant="primary"
                  size="lg"
                  withArrow
                >
                  Request Service
                </Button>

                <Button
                  to="/services"
                  variant="outline"
                  size="lg"
                >
                  Explore All 6 Trades
                </Button>
              </div>

              {/* Features List */}
              <div className="pt-6 border-t border-[#E1EBE7] text-xs text-[#617070] flex flex-wrap items-center justify-center gap-6">
                <span>✓ One Coordinated Partner</span>
                <span>✓ Clear Service Requests</span>
                <span>✓ Centralized Maintenance Support</span>
              </div>
            </div>
          </div>
        </Container>
      </HomeScrollSection>

    </div>
  );
};
