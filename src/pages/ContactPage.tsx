import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Send,
  ClipboardList,
  Users,
  Wrench
} from 'lucide-react';
import { Container } from '../components/ui/Container';
import { SectionBadge } from '../components/ui/SectionBadge';
import { Button } from '../components/ui/Button';
import { BackToHome } from '../components/ui/BackToHome';
import { SERVICES, SERVICE_AREAS } from '../data/northstarData';
import { PropertyType, ContactMethod, CRMLead } from '../types';
import { submitPublicInquiry } from '../services/leadsService';

const PROPERTY_TYPES: PropertyType[] = [
  'Office Buildings',
  'Retail Spaces',
  'Property Management',
  'Healthcare Facilities',
  'Hospitality',
  'Industrial / Flex Space',
  'Other Commercial'
];

// Normalization map mapping short and long-form property sector titles to canonical PropertyType
const PROPERTY_TYPE_MAP: Record<string, PropertyType> = {
  'office buildings': 'Office Buildings',
  'commercial office & corporate campuses': 'Office Buildings',
  'commercial office': 'Office Buildings',
  'retail spaces': 'Retail Spaces',
  'retail centers & commercial showrooms': 'Retail Spaces',
  'healthcare facilities': 'Healthcare Facilities',
  'healthcare & medical facilities': 'Healthcare Facilities',
  'hospitality': 'Hospitality',
  'hospitality & venue properties': 'Hospitality',
  'industrial / flex space': 'Industrial / Flex Space',
  'industrial & flex facilities': 'Industrial / Flex Space',
  'industrial / flex': 'Industrial / Flex Space',
  'property management': 'Property Management',
  'other commercial': 'Other Commercial'
};

const normalizePropertyType = (raw: string | null): PropertyType | '' => {
  if (!raw) return '';
  const decoded = decodeURIComponent(raw).trim();
  const lower = decoded.toLowerCase();
  if (PROPERTY_TYPE_MAP[lower]) {
    return PROPERTY_TYPE_MAP[lower];
  }
  // Check direct exact match with PROPERTY_TYPES
  const matched = PROPERTY_TYPES.find(pt => pt.toLowerCase() === lower);
  return matched || '';
};

const normalizeService = (raw: string | null): string => {
  if (!raw) return '';
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  const matchedService = SERVICES.find(s => s.id.toLowerCase() === decoded);
  return matchedService ? matchedService.id : '';
};

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawServiceParam = searchParams.get('service');
  const rawPropertyTypeParam = searchParams.get('propertyType');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    serviceNeeded: normalizeService(rawServiceParam),
    propertyType: normalizePropertyType(rawPropertyTypeParam),
    propertyAddress: '',
    message: '',
    preferredContactMethod: 'phone' as ContactMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<CRMLead | null>(null);

  useEffect(() => {
    const validService = normalizeService(rawServiceParam);
    const validPropertyType = normalizePropertyType(rawPropertyTypeParam);

    if (validService) {
      setFormData((prev) => ({ ...prev, serviceNeeded: validService }));
    }
    if (validPropertyType) {
      setFormData((prev) => ({ ...prev, propertyType: validPropertyType }));
    }
  }, [rawServiceParam, rawPropertyTypeParam]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.company.trim()) newErrors.company = 'Company or property name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Contact phone number is required';
    }
    if (!formData.serviceNeeded) newErrors.serviceNeeded = 'Please select a primary facility discipline';
    if (!formData.propertyType) newErrors.propertyType = 'Please select a commercial property environment';
    if (!formData.propertyAddress.trim()) newErrors.propertyAddress = 'Property address or location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { leadCode, error } = await submitPublicInquiry({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        serviceNeeded: formData.serviceNeeded,
        propertyType: formData.propertyType,
        propertyAddress: formData.propertyAddress,
        message: formData.message,
        preferredContactMethod: formData.preferredContactMethod,
      });

      if (error || !leadCode) {
        setSubmitError(error?.message || 'Unable to submit your service inquiry. Please try again or call dispatch directly.');
        setIsSubmitting(false);
        return;
      }

      const receiptLead: CRMLead = {
        id: leadCode,
        name: formData.name,
        email: formData.email,
        company: formData.company,
        phone: formData.phone,
        serviceNeeded: formData.serviceNeeded,
        propertyType: formData.propertyType as PropertyType,
        propertyAddress: formData.propertyAddress,
        message: formData.message,
        preferredContactMethod: formData.preferredContactMethod,
        status: 'new',
        priority: formData.serviceNeeded === 'emergency-services' ? 'critical' : 'standard',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

      setSubmittedLead(receiptLead);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmittedLead(null);
    setSubmitError(null);
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      serviceNeeded: '',
      propertyType: '',
      propertyAddress: '',
      message: '',
      preferredContactMethod: 'phone',
    });
    setErrors({});
  };

  return (
    <div className="bg-[#F3F7F5] min-h-screen">
      
      {/* 1. Contact Hero */}
      <section className="bg-[#063B35] text-white py-14 sm:py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-15 bg-[radial-gradient(#00C875_1px,transparent_1px)] [background-size:20px_20px]" 
          aria-hidden="true"
        />
        
        <Container>
          <div className="max-w-3xl space-y-3">
            <SectionBadge label="COMMERCIAL SERVICE INQUIRY" variant="white" />
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight uppercase leading-tight">
              REQUEST COMMERCIAL PROPERTY SERVICE
            </h1>
            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
              Connect with our Austin facility operations team for commercial building service, site reviews, preventive maintenance, and coordinated multi-trade support across Central Texas.
            </p>
          </div>
        </Container>
      </section>

      {/* 2. Main Content Area */}
      <section className="py-12 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
            
            {/* Left Column: Form or Confirmation State */}
            <div className="lg:col-span-8">
              
              {submittedLead ? (
                /* CONFIRMATION / RECEIPT STATE */
                <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-14 shadow-sm space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#00B86B]/15 text-[#00B86B] flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B86B]/10 text-[#063B35] text-xs font-bold uppercase tracking-wider">
                      <span>Tracking ID: {submittedLead.id}</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
                      REQUEST RECEIVED
                    </h2>
                    <p className="text-base text-[#102A2A] font-medium">
                      Thanks for contacting Northstar. Our team will review your request and follow up with you shortly.
                    </p>
                  </div>

                  {/* Request Summary Receipt */}
                  <div className="p-6 rounded-2xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
                      <span className="text-[#617070]">Company / Property:</span>
                      <span className="font-semibold text-[#063B35]">{submittedLead.company}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
                      <span className="text-[#617070]">Contact Name:</span>
                      <span className="font-semibold text-[#063B35]">{submittedLead.name} ({submittedLead.phone})</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
                      <span className="text-[#617070]">Primary Trade Requested:</span>
                      <span className="font-semibold text-[#063B35] capitalize">{submittedLead.serviceNeeded.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#E1EBE7] pb-2">
                      <span className="text-[#617070]">Property Address:</span>
                      <span className="font-semibold text-[#063B35] text-right">{submittedLead.propertyAddress}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-[#617070]">Preferred Response:</span>
                      <span className="font-semibold text-[#00B86B] uppercase">{submittedLead.preferredContactMethod}</span>
                    </div>
                  </div>

                  {/* Next Steps Info */}
                  <div className="p-4 rounded-xl bg-[#063B35]/5 border border-[#063B35]/10 text-xs text-[#063B35] flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#00B86B] shrink-0" />
                    <span>
                      An operations coordinator has been assigned to this ticket. For urgent situations, you may also call Austin dispatch directly at (512) 555-0190.
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <Link
                      to="/workspace/leads"
                      className="px-6 py-3.5 rounded-full bg-[#063B35] hover:bg-[#042925] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-sm min-h-[44px]"
                    >
                      <span>View Lead in Workspace CRM</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#00C875]" />
                    </Link>

                    <Link
                      to="/services"
                      className="px-6 py-3.5 rounded-full border border-[#063B35] text-xs font-bold text-[#063B35] hover:bg-[#F3F7F5] transition-colors min-h-[44px] inline-flex items-center gap-1.5"
                    >
                      <span>Explore Services</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-3.5 rounded-full text-xs font-semibold text-[#617070] hover:text-[#063B35] hover:bg-[#F3F7F5] transition-colors min-h-[44px]"
                    >
                      Submit Another Service Request
                    </button>
                  </div>
                </div>
              ) : (
                /* INQUIRY FORM */
                <div className="bg-white rounded-3xl border border-[#E1EBE7] p-8 sm:p-12 shadow-sm space-y-6">
                  
                  {/* Contextual Emergency Alert Banner */}
                  {formData.serviceNeeded === 'emergency-services' && (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#063B35] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>URGENT FACILITY NEED</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#102A2A] leading-relaxed max-w-xl">
                          For active mechanical failures, water intrusion, electrical issues, or other critical facility conditions, call the Northstar dispatch desk directly while submitting this request.
                        </p>
                      </div>
                      <a
                        href="tel:5125550190"
                        className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#063B35] text-white text-xs font-bold hover:bg-[#042925] transition-colors shadow-xs min-h-[44px]"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#00C875]" />
                        <span>Call (512) 555-0190</span>
                      </a>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-[#063B35] tracking-tight uppercase">
                      Commercial Service Inquiry
                    </h2>
                    <p className="text-xs sm:text-sm text-[#617070]">
                      Fill out the form below. All commercial service requests are routed directly to our Central Texas dispatch desk.
                    </p>
                  </div>

                  {/* Submission Error Banner */}
                  {submitError && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-900">Submission Error</p>
                          <p className="text-red-700 mt-0.5">{submitError}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitError(null)}
                        className="text-red-700 hover:text-red-900 font-bold px-2 py-1 text-xs shrink-0 min-h-[32px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    
                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label 
                          htmlFor="full-name" 
                          className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="full-name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Marcus Vance"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                            errors.name ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                          }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label 
                          htmlFor="work-email" 
                          className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                        >
                          Work Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="work-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. mvance@capitalcrest.com"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                            errors.email ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Company & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label 
                          htmlFor="company-property-name" 
                          className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                        >
                          Company / Property Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="company-property-name"
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="e.g. Capital Crest Property Partners"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                            errors.company ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                          }`}
                        />
                        {errors.company && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.company}
                          </p>
                        )}
                      </div>

                      <div>
                        <label 
                          htmlFor="phone-number" 
                          className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                        >
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="phone-number"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. (512) 555-0149"
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                            errors.phone ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Primary Facility Discipline & Commercial Property Environment */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label 
                          htmlFor="service-needed" 
                          className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                        >
                          Primary Facility Discipline <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="service-needed"
                          value={formData.serviceNeeded}
                          onChange={(e) => setFormData({ ...formData, serviceNeeded: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                            errors.serviceNeeded ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                          }`}
                        >
                          <option value="">Select Primary Service Discipline...</option>
                          {SERVICES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.number} — {s.title}
                            </option>
                          ))}
                        </select>
                        {errors.serviceNeeded && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.serviceNeeded}
                          </p>
                        )}
                      </div>

                      <div>
                        <label 
                          htmlFor="property-type" 
                          className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                        >
                          Commercial Property Environment <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="property-type"
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                            errors.propertyType ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                          }`}
                        >
                          <option value="">Select Property Environment...</option>
                          {PROPERTY_TYPES.map((pt) => (
                            <option key={pt} value={pt}>
                              {pt}
                            </option>
                          ))}
                        </select>
                        {errors.propertyType && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.propertyType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Property Address */}
                    <div>
                      <label 
                        htmlFor="property-address" 
                        className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                      >
                        Property Address / Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="property-address"
                        type="text"
                        value={formData.propertyAddress}
                        onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                        placeholder="e.g. 701 Brazos St, Suite 400, Austin, TX 78701"
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all min-h-[44px] ${
                          errors.propertyAddress ? 'border-red-400 bg-red-50/20' : 'border-[#E1EBE7] bg-[#F3F7F5]/50'
                        }`}
                      />
                      {errors.propertyAddress && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.propertyAddress}
                        </p>
                      )}
                    </div>

                    {/* Row 5: Message */}
                    <div>
                      <label 
                        htmlFor="message" 
                        className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-1.5"
                      >
                        Message / Scope of Issue
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Provide details on equipment symptoms, tenant impact, square footage, or maintenance requirements..."
                        className="w-full px-4 py-3 rounded-xl border border-[#E1EBE7] bg-[#F3F7F5]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B86B] transition-all"
                      />
                    </div>

                    {/* Row 6: Preferred Contact Method */}
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#063B35] mb-2">
                        Preferred Contact Method
                      </span>
                      <div className="flex flex-wrap gap-5 text-xs font-medium text-[#102A2A]">
                        <label 
                          htmlFor="preferred-contact-phone" 
                          className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
                        >
                          <input
                            id="preferred-contact-phone"
                            type="radio"
                            name="contactMethod"
                            value="phone"
                            checked={formData.preferredContactMethod === 'phone'}
                            onChange={() => setFormData({ ...formData, preferredContactMethod: 'phone' })}
                            className="text-[#00B86B] focus:ring-[#00B86B] w-4 h-4"
                          />
                          <span>Phone Call</span>
                        </label>
                        <label 
                          htmlFor="preferred-contact-email" 
                          className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
                        >
                          <input
                            id="preferred-contact-email"
                            type="radio"
                            name="contactMethod"
                            value="email"
                            checked={formData.preferredContactMethod === 'email'}
                            onChange={() => setFormData({ ...formData, preferredContactMethod: 'email' })}
                            className="text-[#00B86B] focus:ring-[#00B86B] w-4 h-4"
                          />
                          <span>Work Email</span>
                        </label>
                        <label 
                          htmlFor="preferred-contact-either" 
                          className="inline-flex items-center gap-2 cursor-pointer min-h-[44px]"
                        >
                          <input
                            id="preferred-contact-either"
                            type="radio"
                            name="contactMethod"
                            value="either"
                            checked={formData.preferredContactMethod === 'either'}
                            onChange={() => setFormData({ ...formData, preferredContactMethod: 'either' })}
                            className="text-[#00B86B] focus:ring-[#00B86B] w-4 h-4"
                          />
                          <span>Either Method</span>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto font-bold min-h-[44px]"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Submitting Commercial Inquiry...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span>Submit Commercial Service Request</span>
                            <Send className="w-4 h-4 ml-1" />
                          </span>
                        )}
                      </Button>
                    </div>

                  </form>
                </div>
              )}

            </div>

            {/* Right Column: Austin Contact Info & Portfolio Notes */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Austin Dispatch Box */}
              <div className="bg-[#063B35] text-white rounded-3xl p-7 sm:p-8 space-y-6 shadow-md border border-[#08453E]">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#00C875]">
                    Direct Commercial Desk
                  </span>
                  <h3 className="text-xl font-bold">Austin Operations Center</h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-white/80">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#00B86B] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Central Texas Headquarters</p>
                      <p className="text-white/70">Austin, Texas</p>
                      <p className="text-white/70">Serving Austin &amp; Central Texas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#00B86B] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Work Order &amp; Dispatch Desk</p>
                      <a href="tel:5125550190" className="text-white/90 hover:text-[#00C875] transition-colors">
                        (512) 555-0190
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#00B86B] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Commercial Accounts</p>
                      <a href="mailto:dispatch@northstarfacilities.com" className="text-white/90 hover:text-[#00C875] transition-colors">
                        dispatch@northstarfacilities.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#00B86B] shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-white">Facility Coverage Hours</p>
                      <p className="text-white/70">Standard: M–F 7:00am – 6:00pm</p>
                      <p className="text-[#00C875] font-semibold">Priority Emergency Coordination</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs text-white/60 leading-relaxed">
                  Serving Travis, Williamson, Hays, Bastrop, Caldwell, and Burnet counties.
                </div>
              </div>

              {/* Demo Notice Box */}
              <div className="bg-white rounded-3xl border border-[#E1EBE7] p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                  <Sparkles className="w-4 h-4" />
                  <span>Portfolio Project Notice</span>
                </div>
                <p className="text-xs text-[#617070] leading-relaxed">
                  Northstar Facility Services is a fictional commercial property maintenance company created for portfolio demonstration. Contact details and phone numbers are non-production demo placeholders.
                </p>
                <div className="pt-2">
                  <Link
                    to="/workspace/dashboard"
                    className="text-xs font-bold text-[#063B35] hover:text-[#00B86B] inline-flex items-center gap-1 min-h-[44px]"
                  >
                    <span>View in CRM Workspace →</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* 3. What Happens After You Submit */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#E1EBE7]">
        <Container>
          <div className="max-w-3xl mb-12 sm:mb-14 space-y-3">
            <SectionBadge label="SERVICE WORKFLOW" variant="emerald" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#063B35] tracking-tight uppercase">
              WHAT HAPPENS AFTER YOU SUBMIT
            </h2>
            <p className="text-sm sm:text-base text-[#617070] leading-relaxed">
              Our commercial intake process ensures every inquiry receives disciplined evaluation and rapid routing to the right facility specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-1 rounded-md border border-[#00B86B]/20">
                  01
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#063B35] text-[#00C875] flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#063B35] tracking-tight uppercase">
                INTAKE &amp; FACILITY TRIAGE
              </h3>
              <p className="text-xs sm:text-sm text-[#617070] leading-relaxed">
                Your request is reviewed by the Northstar operations desk and categorized by service need and property context.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-1 rounded-md border border-[#00B86B]/20">
                  02
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#063B35] text-[#00C875] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#063B35] tracking-tight uppercase">
                SITE REVIEW &amp; SCOPE ASSESSMENT
              </h3>
              <p className="text-xs sm:text-sm text-[#617070] leading-relaxed">
                An operations coordinator follows up using your preferred contact method to clarify scope, site conditions, and next steps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F3F7F5] border border-[#E1EBE7] space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#00B86B] bg-[#00B86B]/10 px-2.5 py-1 rounded-md border border-[#00B86B]/20">
                  03
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#063B35] text-[#00C875] flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#063B35] tracking-tight uppercase">
                WORK ORDER OR SCHEDULED ASSESSMENT
              </h3>
              <p className="text-xs sm:text-sm text-[#617070] leading-relaxed">
                Northstar coordinates the appropriate service path, whether that means a scheduled assessment, maintenance visit, or priority service response.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Back to Home Navigation Action */}
      <BackToHome />

    </div>
  );
};
