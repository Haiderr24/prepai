// Dashboard specific types
import type { JsonValue } from '@prisma/client/runtime/library'

export interface JobApplication {
  id: string
  company: string
  position: string
  jobUrl?: string | null
  salaryRange?: string | null
  location?: string | null
  jobType?: string | null
  status: string // Applied, Phone Screen, Interview, Final Round, Offer, Rejected, Withdrawn
  appliedDate: Date
  notes?: string | null
  companyNotes?: string | null
  interviewNotes?: string | null
  aiQuestions?: JsonValue | null
  companyResearch?: JsonValue | null
  personalizedPrep?: JsonValue | null
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