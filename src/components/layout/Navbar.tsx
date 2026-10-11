import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, PhoneCall } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Industries', path: '/industries' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Top Austin Service & Workspace Banner */}
      <div className="bg-[#063B35] text-white/90 text-xs border-b border-white/10 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Austin & Central Texas Commercial Service
            </span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline text-white/70">
              Coordinated Maintenance Support
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="tel:5125550190" 
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
              title="Demo Commercial Dispatch Phone"
            >
              <PhoneCall className="w-3 h-3 text-[#00C875]" />
              <span className="hidden sm:inline">(512) 555-0190</span>
              <span className="sm:hidden">Call</span>
            </a>
            <span className="text-white/30">|</span>
            <Link 
              to="/workspace/dashboard" 
              className="inline-flex items-center gap-1 text-[#00C875] hover:text-white transition-colors font-medium text-[11px] bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded"
              title="Access Northstar Internal Operations CRM"
            >
              <Shield className="w-3 h-3" />
              <span>Workspace CRM</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-[100] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E1EBE7] py-3'
            : 'bg-white border-b border-[#E1EBE7] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B86B] rounded-lg" 
            aria-label="Northstar Facility Services Home"
          >
            <Logo variant="dark" size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B86B] ${
                    isActive
                      ? 'text-[#063B35] bg-[#F3F7F5] font-semibold'
                      : 'text-[#617070] hover:text-[#063B35] hover:bg-black/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              to="/contact"
              variant="primary"
              size="md"
              withArrow
            >
              Request Service
            </Button>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              to="/contact"
              variant="primary"
              size="sm"
              className="px-3"
            >
              Request
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#063B35] hover:bg-[#F3F7F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B86B]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E1EBE7] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B86B] ${
                      isActive
                        ? 'bg-[#F3F7F5] text-[#063B35] font-semibold'
                        : 'text-[#617070] hover:bg-[#F3F7F5] hover:text-[#063B35]'
                    }`
                  }
                >
                  {link.name}
                  <span className="text-xs text-[#00B86B]">→</span>
                </NavLink>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E1EBE7] space-y-2">
              <Button
                to="/contact"
                variant="primary"
                size="md"
                withArrow
                className="w-full justify-between"
              >
                Request Service
              </Button>

              <Link
                to="/workspace/dashboard"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-[#063B35]/20 text-xs font-semibold text-[#063B35] bg-[#F3F7F5] hover:bg-white"
              >
                <Shield className="w-3.5 h-3.5 text-[#00B86B]" />
                <span>Open Staff Workspace CRM</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
