export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
export type ProjectStatus = 'Planning' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';

export interface Lead {
  id: string;
  name: string;
  company: string;
  position?: string;
  address?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  socialContact?: string;
  status: LeadStatus;
  value: number;
  serviceIds?: string[];
  source: string;
  notes?: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  industry?: string;
  website?: string;
  leadId?: string;
  ownerId: string;
  createdAt: any;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName?: string;
  status: ProjectStatus;
  budget: number;
  productLink?: string;
  startDate: string;
  endDate: string;
  description?: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'Admin' | 'Manager' | 'Member';
  createdAt: any;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  features: string[];
  ownerId: string;
}
