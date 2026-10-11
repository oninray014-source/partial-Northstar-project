export type ServiceCategory = 
  | 'commercial-hvac'
  | 'electrical'
  | 'plumbing'
  | 'general-maintenance'
  | 'preventive-maintenance'
  | 'emergency-services';

export interface ServiceItem {
  id: ServiceCategory;
  number: string;
  title: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  features: string[];
  capabilities: string[];
  urgencyLevel?: string;
}

export interface IndustryItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  challengesSolved: string[];
  propertyTypes: string[];
  keyBenefits: string[];
}

export interface ProcessStep {
  step: string;
  name: string;
  tagline: string;
  description: string;
}

export interface DemoStat {
  label: string;
  value: string;
  subtext: string;
}

export type PropertyType = 
  | 'Office Buildings'
  | 'Retail Spaces'
  | 'Property Management'
  | 'Healthcare Facilities'
  | 'Hospitality'
  | 'Industrial / Flex Space'
  | 'Other Commercial';

export interface CommercialProperty {
  id: string;
  name: string;
  clientCompany: string;
  propertyType: PropertyType;
  address: string;
  squareFootage: string;
  primaryContact?: {
    name: string;
    email: string;
    phone: string;
  };
  equipmentTags: string[];
  status: 'active' | 'under-assessment' | 'inactive';
  pmCycle?: string;
  createdAt: string;
}

export type ContactMethod = 'phone' | 'email' | 'either';

export interface ServiceInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  serviceNeeded: ServiceCategory | string;
  propertyType: PropertyType | string;
  propertyAddress: string;
  message: string;
  preferredContactMethod: ContactMethod;
  status: 'new' | 'assessing' | 'scheduled' | 'dispatched' | 'closed';
  priority?: 'critical' | 'high' | 'standard';
}

export interface CRMLead extends ServiceInquiry {
  assignedTechnician?: string;
  estimatedValue?: string;
  facilitySquareFootage?: string;
  propertyId?: string;
}

export interface FacilityTask {
  id: string;
  title: string;
  description?: string;
  propertyId?: string;
  leadId?: string;
  serviceCategory: ServiceCategory;
  assignedTechnician?: string;
  priority: 'critical' | 'high' | 'standard';
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WorkOrderJobNote {
  id: string;
  workOrderId: string;
  authorId: string | null;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
}

export interface AssignableTechnician {
  id: string;
  fullName: string;
  jobTitle?: string;
  discipline?: string;
}
