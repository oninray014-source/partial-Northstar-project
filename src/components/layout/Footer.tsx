import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#063B35] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block">
              <Logo variant="light" size="lg" />
            </Link>
            <p className="text-white/70 text-sm max-w-sm leading-relaxed">
              One partner for everything your commercial property needs. We provide single-source mechanical, electrical, plumbing, and general facility services across Austin and Central Texas.
            </p>

            <div className="space-y-2.5 text-xs text-white/80 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#00B86B] shrink-0 mt-0.5" />
                <span>Austin, Texas • Serving Austin &amp; Central Texas</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00B86B] shrink-0" />
                <span>(512) 555-0190 (Demo Portfolio Dispatch)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#00B86B] shrink-0" />
                <span>dispatch@northstarfacilities.com (Demo Inquiries)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#00B86B] shrink-0" />
                <span>Routine Service: Mon–Fri 7am–6pm | 24/7 Emergency Dispatch</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#00B86B] mb-4">
              Facility Services
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link to="/services#commercial-hvac" className="hover:text-white transition-colors">
                  Commercial HVAC
                </Link>
              </li>
              <li>
                <Link to="/services#electrical" className="hover:text-white transition-colors">
                  Electrical &amp; Power
                </Link>
              </li>
              <li>
                <Link to="/services#plumbing" className="hover:text-white transition-colors">
                  Commercial Plumbing
                </Link>
              </li>
              <li>
                <Link to="/services#general-maintenance" className="hover:text-white transition-colors">
                  General Maintenance
                </Link>
              </li>
              <li>
                <Link to="/services#preventive-maintenance" className="hover:text-white transition-colors">
                  Preventive Maintenance
                </Link>
              </li>
              <li>
                <Link to="/services#emergency-services" className="hover:text-white transition-colors">
                  Emergency Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Industries Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#00B86B] mb-4">
              Industries Served
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link to="/industries#office-buildings" className="hover:text-white transition-colors">
                  Office Buildings
                </Link>
              </li>
              <li>
                <Link to="/industries#retail-spaces" className="hover:text-white transition-colors">
                  Retail Spaces
                </Link>
              </li>
              <li>
                <Link to="/industries#industrial-flex" className="hover:text-white transition-colors">
                  Industrial &amp; Flex Facilities
                </Link>
              </li>
              <li>
                <Link to="/industries#property-management" className="hover:text-white transition-colors">
                  Property Management
                </Link>
              </li>
              <li>
                <Link to="/industries#healthcare-facilities" className="hover:text-white transition-colors">
                  Healthcare Facilities
                </Link>
              </li>
              <li>
                <Link to="/industries#hospitality" className="hover:text-white transition-colors">
                  Hospitality
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation & Workspace Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#00B86B] mb-4">
              Operations &amp; Company
            </h4>
            <ul className="space-y-2 text-sm text-white/75">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Northstar
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact &amp; Dispatch
                </Link>
              </li>
              <li className="pt-2">
                <Link 
                  to="/workspace/dashboard" 
                  className="inline-flex items-center gap-1.5 text-xs text-[#00B86B] hover:text-[#00C875] font-semibold bg-white/10 px-3 py-1.5 rounded-full"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Northstar Workspace CRM</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Central Texas Service Radius Badge */}
        <div className="py-6 border-b border-white/10 text-xs text-white/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/80">Central Texas Coverage:</span>
            <span>Austin Metro • The Domain • Round Rock • Cedar Park • Westlake • Georgetown • San Marcos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00B86B]" />
            <span>Commercial Facility Services • Austin &amp; Central Texas</span>
          </div>
        </div>

        {/* Bottom Bar with Portfolio Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Northstar Facility Services. All rights reserved.</p>
          <div className="flex items-center gap-4 text-center sm:text-right">
            <span className="bg-white/5 px-2.5 py-1 rounded text-white/70 border border-white/10">
              Demo Portfolio Project — Fictional Commercial Business &amp; Operations CRM
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
