// Dashboard specific types

export interface JobApplication {
  id: string
  company: string
  position: string
  jobUrl?: string
  salaryRange?: string
  location?: string
  jobType?: string
  status: string // Applied, Phone Screen, Interview, Final Round, Offer, Rejected, Withdrawn
  appliedDate: Date
  notes?: string
  companyNotes?: string
  interviewNotes?: string
  aiQuestions?: Record<string, unknown> | null
  companyResearch?: Record<string, unknown> | null
  personalizedPrep?: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface JobFormData {
  company: string
  position: string
  jobUrl?: string
  location?: string
  salaryRange?: string
  jobType?: string
  notes?: string
  companyNotes?: string
}