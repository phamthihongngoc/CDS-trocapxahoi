// Định nghĩa các kiểu dữ liệu cho hệ thống bảo trợ xã hội

export interface User {
  id: string;
  username: string;
  citizenId?: string; // CCCD
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
  createdAt: string;
  isActive: boolean;
}

export const UserRole = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface SupportApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  programId: string;
  programName: string;
  status: ApplicationStatus;
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  documents: Document[];
  contactInfo: ContactInfo;
  householdInfo: HouseholdInfo;
}

export const ApplicationStatus = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export interface SupportProgram {
  id: string;
  name: string;
  description: string;
  category: ProgramCategory;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  supportAmount?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export const ProgramCategory = {
  DISABILITY_SUPPORT: 'disability_support',
  POVERTY_REDUCTION: 'poverty_reduction',
  ORPHAN_SUPPORT: 'orphan_support',
  ELDERLY_CARE: 'elderly_care',
  EMERGENCY_RELIEF: 'emergency_relief',
  SOCIAL_INSURANCE: 'social_insurance'
} as const;

export type ProgramCategory = typeof ProgramCategory[keyof typeof ProgramCategory];

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
}

export interface ContactInfo {
  phone: string;
  email?: string;
  address: string;
  ward: string;
  commune: string;
  district: string;
}

export interface HouseholdInfo {
  householdSize: number;
  monthlyIncome?: number;
  landArea?: number;
  housingCondition: string;
  members: HouseholdMember[];
}

export interface HouseholdMember {
  name: string;
  relationship: string;
  age: number;
  occupation?: string;
  income?: number;
  hasDisability: boolean;
}

export interface Statistics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalBeneficiaries: number;
  totalSupportAmount: number;
  applicationsByProgram: Record<string, number>;
  applicationsByMonth: Record<string, number>;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  publishedAt: string;
  publishedBy: string;
  isActive: boolean;
  category: 'policy' | 'news' | 'announcement';
}
