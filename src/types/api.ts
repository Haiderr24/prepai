// API Types for Job Interview Tracker

export interface ApiError {
  error: string
}

export interface ApiSuccess {
  message: string
}

// Job Application Types
export interface JobApplicationInput {
  company: string
  position: string
  jobUrl?: string
  salaryRange?: string
  location?: string
  jobType?: string
  notes?: string
  companyNotes?: string
}

export interface JobApplicationUpdate extends Partial<JobApplicationInput> {
  status?: 'Applied' | 'Phone Screen' | 'Interview' | 'Final Round' | 'Offer' | 'Rejected' | 'Withdrawn'
  interviewNotes?: string
}

// AI Generated Content Types
export interface InterviewQuestions {
  behavioral: string[]
  technical: string[]
  roleSpecific: string[]
  company: string[]
}

export interface CompanyResearch {
  companyOverview: {
    name: string
    industry: string
    size: string
    founded: string
    headquarters: string
    website: string
  }
  culture: {
    values: string[]
    workEnvironment: string
    benefits: string[]
  }
  interviewProcess: {
    rounds: string[]
    timeline: string
    tips: string[]
  }
  recentNews: Array<{
    title: string
    date: string
    summary: string
  }>
  glassdoorInsights: {
    rating: number
    recommendToFriend: number
    ceoApproval: number
    commonPros: string[]
    commonCons: string[]
  }
}

export interface PersonalizedPrep {
  tellMeAboutYourself: {
    structure: string
    example: string
    tips: string[]
  }
  whyThisCompany: {
    structure: string
    example: string
    keyPoints: string[]
  }
  strengths: Array<{
    strength: string
    example: string
    howToDiscuss: string
  }>
  weaknesses: Array<{
    weakness: string
    framingStrategy: string
    improvement: string
  }>
  questionsToAsk: Array<{
    question: string
    why: string
  }>
  salaryNegotiation: {
    strategy: string
    response: string
    tips: string[]
  }
}

// Request body types for AI endpoints
export interface PersonalizedPrepRequest {
  resume?: string
  experience?: string
  skills?: string[]
}

// Import from local types instead of Prisma
import type { JobApplication } from './dashboard'

// Response types for AI endpoints
export interface GenerateQuestionsResponse extends ApiSuccess {
  questions: InterviewQuestions
  jobApplication: JobApplication
}

export interface CompanyResearchResponse extends ApiSuccess {
  research: CompanyResearch
  jobApplication: JobApplication
}

export interface PersonalizedPrepResponse extends ApiSuccess {
  prep: PersonalizedPrep
  jobApplication: JobApplication
}