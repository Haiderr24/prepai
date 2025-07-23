'use client'

import { useState, useEffect } from 'react'
import { X, Edit3, Trash2, Sparkles, Building, FileText } from 'lucide-react'
import { JobApplication, JobFormData } from '@/types/dashboard'

interface JobDetailModalProps {
  isOpen: boolean
  onClose: () => void
  job: JobApplication | null
  onUpdate: (jobId: string, updatedJob: JobApplication) => void
  onDelete: (jobId: string) => void
  isPremium?: boolean
}

const STATUS_OPTIONS = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Final Round',
  'Offer',
  'Rejected',
  'Withdrawn'
]


export default function JobDetailModal({ 
  isOpen, 
  onClose, 
  job, 
  onUpdate, 
  onDelete,
  isPremium = false 
}: JobDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({
    company: '',
    position: '',
    jobUrl: '',
    location: '',
    salaryRange: '',
    jobType: '',
    notes: '',
    companyNotes: '',
  })
  const [status, setStatus] = useState('')
  const [interviewNotes, setInterviewNotes] = useState('')
  
  // AI Feature States
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isResearchingCompany, setIsResearchingCompany] = useState(false)
  const [isCreatingPrep, setIsCreatingPrep] = useState(false)
  const [aiQuestions, setAiQuestions] = useState<any>(null)
  const [companyResearch, setCompanyResearch] = useState<any>(null)
  const [personalizedPrep, setPersonalizedPrep] = useState<any>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [activeAiView, setActiveAiView] = useState<'questions' | 'research' | 'prep' | null>(null)

  // Reset form when job changes
  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company,
        position: job.position,
        jobUrl: job.jobUrl || '',
        location: job.location || '',
        salaryRange: job.salaryRange || '',
        jobType: job.jobType || '',
        notes: job.notes || '',
        companyNotes: job.companyNotes || '',
      })
      setStatus(job.status)
      setInterviewNotes(job.interviewNotes || '')
      setIsEditing(false)
      setError(null)
    }
  }, [job])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!job || !formData.company.trim() || !formData.position.trim()) {
      setError('Company and position are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status,
          interviewNotes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update job')
      }

      const updatedJob = await response.json()
      
      // Convert date strings back to Date objects
      const jobWithDates = {
        ...updatedJob,
        appliedDate: new Date(updatedJob.appliedDate),
        createdAt: new Date(updatedJob.createdAt),
        updatedAt: new Date(updatedJob.updatedAt),
      }

      onUpdate(job.id, jobWithDates)
      setIsEditing(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update job'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!job) return
    
    if (!confirm('Are you sure you want to delete this job application? This cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete job')
      }

      onDelete(job.id)
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete job'
      setError(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'status') {
      setStatus(value)
    } else if (name === 'interviewNotes') {
      setInterviewNotes(value)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // AI Feature Handlers
  const handleGenerateQuestions = async () => {
    if (!job) return
    
    setIsGeneratingQuestions(true)
    setAiError(null)
    
    try {
      const response = await fetch(`/api/jobs/${job.id}/generate-questions`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate questions')
      }
      
      const data = await response.json()
      setAiQuestions(data.questions)
      setActiveAiView('questions')
      
      // Update local job state if questions were saved
      if (data.jobApplication) {
        onUpdate(job.id, {
          ...job,
          aiQuestions: data.questions
        })
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to generate questions')
    } finally {
      setIsGeneratingQuestions(false)
    }
  }
  
  const handleResearchCompany = async () => {
    if (!job) return
    
    setIsResearchingCompany(true)
    setAiError(null)
    
    try {
      const response = await fetch(`/api/jobs/${job.id}/company-research`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to research company')
      }
      
      const data = await response.json()
      setCompanyResearch(data.research)
      setActiveAiView('research')
      
      // Update local job state if research was saved
      if (data.jobApplication) {
        onUpdate(job.id, {
          ...job,
          companyResearch: data.research
        })
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to research company')
    } finally {
      setIsResearchingCompany(false)
    }
  }
  
  const handleCreatePrep = async () => {
    if (!job) return
    
    setIsCreatingPrep(true)
    setAiError(null)
    
    try {
      const response = await fetch(`/api/jobs/${job.id}/personalized-prep`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create prep')
      }
      
      const data = await response.json()
      setPersonalizedPrep(data.prep)
      setActiveAiView('prep')
      
      // Update local job state if prep was saved
      if (data.jobApplication) {
        onUpdate(job.id, {
          ...job,
          personalizedPrep: data.prep
        })
      }
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Failed to create prep')
    } finally {
      setIsCreatingPrep(false)
    }
  }

  if (!isOpen || !job) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{job.company}</h2>
              <p className="text-gray-600">{job.position}</p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Company */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      id="salaryRange"
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Job Type */}
                  <div>
                    <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select job type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Job URL */}
                <div>
                  <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Job URL
                  </label>
                  <input
                    type="url"
                    id="jobUrl"
                    name="jobUrl"
                    value={formData.jobUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Application Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Application Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Company Notes */}
                <div>
                  <label htmlFor="companyNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Notes
                  </label>
                  <textarea
                    id="companyNotes"
                    name="companyNotes"
                    value={formData.companyNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Interview Notes */}
                <div>
                  <label htmlFor="interviewNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Notes
                  </label>
                  <textarea
                    id="interviewNotes"
                    name="interviewNotes"
                    value={interviewNotes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.company.trim() || !formData.position.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Application'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        status === 'Applied' ? 'bg-gray-100 text-gray-800' :
                        status === 'Phone Screen' ? 'bg-blue-100 text-blue-800' :
                        status === 'Interview' ? 'bg-blue-100 text-blue-800' :
                        status === 'Final Round' ? 'bg-purple-100 text-purple-800' :
                        status === 'Offer' ? 'bg-green-100 text-green-800' :
                        status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Applied Date</h3>
                    <p className="text-gray-900">{formatDate(job.appliedDate)}</p>
                  </div>

                  {job.location && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                      <p className="text-gray-900">{job.location}</p>
                    </div>
                  )}

                  {job.salaryRange && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Salary Range</h3>
                      <p className="text-gray-900">{job.salaryRange}</p>
                    </div>
                  )}

                  {job.jobType && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Job Type</h3>
                      <p className="text-gray-900">{job.jobType}</p>
                    </div>
                  )}

                  {job.jobUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Job URL</h3>
                      <a 
                        href={job.jobUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View Job Posting
                      </a>
                    </div>
                  )}
                </div>

                {/* Notes Sections */}
                {(job.notes || job.companyNotes || job.interviewNotes) && (
                  <div className="space-y-6">
                    {job.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Application Notes</h3>
                        <p className="text-gray-900 whitespace-pre-wrap">{job.notes}</p>
                      </div>
                    )}

                    {job.companyNotes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Company Notes</h3>
                        <p className="text-gray-900 whitespace-pre-wrap">{job.companyNotes}</p>
                      </div>
                    )}

                    {job.interviewNotes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Interview Notes</h3>
                        <p className="text-gray-900 whitespace-pre-wrap">{job.interviewNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Features Section */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">AI-Powered Interview Prep</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Generate Questions */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border">
                      <div className="flex items-center mb-3">
                        <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Interview Questions</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate AI-powered interview questions tailored to this role and company.
                      </p>
                      <button 
                        onClick={handleGenerateQuestions}
                        disabled={isGeneratingQuestions}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGeneratingQuestions ? 'Generating...' : 'Generate Questions'}
                      </button>
                    </div>

                    {/* Company Research */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border">
                      <div className="flex items-center mb-3">
                        <Building className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Company Research</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Get AI-powered insights about the company, culture, and interview process.
                      </p>
                      <button 
                        onClick={handleResearchCompany}
                        disabled={isResearchingCompany}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isResearchingCompany ? 'Researching...' : 'Research Company'}
                      </button>
                    </div>

                    {/* Personalized Prep */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Personalized Prep</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Create AI-powered personalized interview answers tailored to this role.
                      </p>
                      <button 
                        onClick={handleCreatePrep}
                        disabled={isCreatingPrep}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {isCreatingPrep ? 'Creating...' : 'Create Prep'}
                      </button>
                    </div>
                  </div>

                </div>
                
                {/* AI Generated Content Display */}
                {activeAiView && (
                  <div className="mt-8 border-t pt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {activeAiView === 'questions' && 'Interview Questions'}
                        {activeAiView === 'research' && 'Company Research'}
                        {activeAiView === 'prep' && 'Personalized Interview Prep'}
                      </h3>
                      <button 
                        onClick={() => setActiveAiView(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {aiError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{aiError}</p>
                      </div>
                    )}
                    
                    {/* Interview Questions Display */}
                    {activeAiView === 'questions' && aiQuestions && (
                      <div className="space-y-8">
                        {/* Behavioral Questions */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Behavioral Questions
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(aiQuestions, 'behavioral')?.map((q: string, i: number) => (
                              <div key={i} className="flex items-start">
                                <span className="text-blue-500 mr-3 mt-1 flex-shrink-0">•</span>
                                <span className="text-gray-700 leading-relaxed">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Technical Interview Prep Focus */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Technical Interview Prep Focus
                          </h4>
                          {getTypedValue<Record<string, unknown>>(aiQuestions, 'technical') && 
                           typeof getTypedValue<Record<string, unknown>>(aiQuestions, 'technical') === 'object' && 
                           !Array.isArray(getTypedValue<Record<string, unknown>>(aiQuestions, 'technical')) ? (
                            <div className="space-y-6">
                              {getTypedValue<string[]>(aiQuestions, 'technical.focus_areas') && (
                                <div>
                                  <h5 className="text-md font-medium text-gray-800 mb-3">Focus Areas:</h5>
                                  <div className="space-y-2 ml-4">
                                    {getTypedValue<string[]>(aiQuestions, 'technical.focus_areas')?.map((area: string, i: number) => (
                                      <div key={i} className="flex items-start">
                                        <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                        <span className="text-gray-700 leading-relaxed">{area}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {getTypedValue<string[]>(aiQuestions, 'technical.key_topics') && (
                                <div>
                                  <h5 className="text-md font-medium text-gray-800 mb-3">Key Topics to Study:</h5>
                                  <div className="space-y-2 ml-4">
                                    {getTypedValue<string[]>(aiQuestions, 'technical.key_topics')?.map((topic: string, i: number) => (
                                      <div key={i} className="flex items-start">
                                        <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                        <span className="text-gray-700 leading-relaxed">{topic}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {getTypedValue<string[]>(aiQuestions, 'technical.interview_style') && (
                                <div>
                                  <h5 className="text-md font-medium text-gray-800 mb-3">Interview Style:</h5>
                                  <div className="space-y-2 ml-4">
                                    {getTypedValue<string[]>(aiQuestions, 'technical.interview_style')?.map((style: string, i: number) => (
                                      <div key={i} className="flex items-start">
                                        <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                        <span className="text-gray-700 leading-relaxed">{style}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {getTypedValue<string[]>(aiQuestions, 'technical.company_values') && (
                                <div>
                                  <h5 className="text-md font-medium text-gray-800 mb-3">What They Value:</h5>
                                  <div className="space-y-2 ml-4">
                                    {getTypedValue<string[]>(aiQuestions, 'technical.company_values')?.map((value: string, i: number) => (
                                      <div key={i} className="flex items-start">
                                        <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                        <span className="text-gray-700 leading-relaxed">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {getTypedValue<string[]>(aiQuestions, 'technical.prep_recommendations') && (
                                <div>
                                  <h5 className="text-md font-medium text-gray-800 mb-3">Preparation Recommendations:</h5>
                                  <div className="space-y-2 ml-4">
                                    {getTypedValue<string[]>(aiQuestions, 'technical.prep_recommendations')?.map((rec: string, i: number) => (
                                      <div key={i} className="flex items-start">
                                        <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                        <span className="text-gray-700 leading-relaxed">{rec}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {getTypedValue<string[]>(aiQuestions, 'technical')?.map((q: string, i: number) => (
                                <div key={i} className="flex items-start">
                                  <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                  <span className="text-gray-700 leading-relaxed">{q}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Role-Specific Questions */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Role-Specific Questions
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(aiQuestions, 'roleSpecific')?.map((q: string, i: number) => (
                              <div key={i} className="flex items-start">
                                <span className="text-purple-500 mr-3 mt-1 flex-shrink-0">•</span>
                                <span className="text-gray-700 leading-relaxed">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Company-Specific Questions */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Company-Specific Questions
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(aiQuestions, 'company')?.map((q: string, i: number) => (
                              <div key={i} className="flex items-start">
                                <span className="text-orange-500 mr-3 mt-1 flex-shrink-0">•</span>
                                <span className="text-gray-700 leading-relaxed">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Company Research Display */}
                    {activeAiView === 'research' && companyResearch && (
                      <div className="space-y-6">
                        {getTypedValue<Record<string, unknown>>(companyResearch, 'overview') && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Company Overview</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {getTypedValue<string>(companyResearch, 'overview.industry') && (
                                <p className="text-gray-700 mb-2"><strong>Industry:</strong> {getTypedValue<string>(companyResearch, 'overview.industry')}</p>
                              )}
                              {getTypedValue<string>(companyResearch, 'overview.description') && (
                                <p className="text-gray-600">{getTypedValue<string>(companyResearch, 'overview.description')}</p>
                              )}
                              {getTypedValue<string>(companyResearch, 'overview.size') && (
                                <p className="text-gray-700 mt-2"><strong>Size:</strong> {getTypedValue<string>(companyResearch, 'overview.size')}</p>
                              )}
                              {getTypedValue<string>(companyResearch, 'overview.founded') && (
                                <p className="text-gray-700"><strong>Founded:</strong> {getTypedValue<string>(companyResearch, 'overview.founded')}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {getTypedValue<Record<string, unknown>>(companyResearch, 'culture') && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Company Culture</h4>
                            <div className="bg-blue-50 p-4 rounded-lg">
                              {getTypedValue<string[]>(companyResearch, 'culture.values') && (
                                <p className="text-gray-700 mb-2"><strong>Values:</strong> {getTypedValue<string[]>(companyResearch, 'culture.values')?.join(', ')}</p>
                              )}
                              {getTypedValue<string>(companyResearch, 'culture.workEnvironment') && (
                                <p className="text-gray-700"><strong>Work Environment:</strong> {getTypedValue<string>(companyResearch, 'culture.workEnvironment')}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {getTypedValue<Record<string, unknown>>(companyResearch, 'interviewProcess') && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Interview Process</h4>
                            <div className="bg-green-50 p-4 rounded-lg">
                              {getTypedValue<string[]>(companyResearch, 'interviewProcess.rounds') && (
                                <div className="mb-2">
                                  <strong>Typical Rounds:</strong>
                                  <ul className="mt-1 ml-4">
                                    {getTypedValue<string[]>(companyResearch, 'interviewProcess.rounds')?.map((round: string, i: number) => (
                                      <li key={i} className="text-gray-700">• {round}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {getTypedValue<string>(companyResearch, 'interviewProcess.timeline') && (
                                <p className="text-gray-700"><strong>Timeline:</strong> {getTypedValue<string>(companyResearch, 'interviewProcess.timeline')}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {getTypedValue<string[]>(companyResearch, 'recentNews') && getTypedValue<string[]>(companyResearch, 'recentNews')!.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Recent News</h4>
                            <ul className="space-y-2">
                              {getTypedValue<string[]>(companyResearch, 'recentNews')?.map((news: string, i: number) => (
                                <li key={i} className="text-gray-700 bg-gray-50 p-3 rounded">• {news}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {getTypedValue<Record<string, unknown>>(companyResearch, 'glassdoorInsights') && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Employee Insights</h4>
                            <div className="bg-purple-50 p-4 rounded-lg">
                              {getTypedValue<string[]>(companyResearch, 'glassdoorInsights.pros') && (
                                <div className="mb-3">
                                  <strong className="text-green-700">Pros:</strong>
                                  <ul className="mt-1 ml-4">
                                    {getTypedValue<string[]>(companyResearch, 'glassdoorInsights.pros')?.map((pro: string, i: number) => (
                                      <li key={i} className="text-gray-700">+ {pro}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {getTypedValue<string[]>(companyResearch, 'glassdoorInsights.cons') && (
                                <div>
                                  <strong className="text-red-700">Cons:</strong>
                                  <ul className="mt-1 ml-4">
                                    {getTypedValue<string[]>(companyResearch, 'glassdoorInsights.cons')?.map((con: string, i: number) => (
                                      <li key={i} className="text-gray-700">- {con}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Personalized Prep Display */}
                    {activeAiView === 'prep' && personalizedPrep && (
                      <div className="space-y-8">
                        {/* Tell Me About Yourself Tips */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Tell Me About Yourself - Key Tips
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(personalizedPrep, 'tellMeAboutYourself') 
                              ? getTypedValue<string[]>(personalizedPrep, 'tellMeAboutYourself')?.map((tip: string, i: number) => (
                                  <div key={i} className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1 flex-shrink-0">•</span>
                                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                                  </div>
                                ))
                              : <div className="text-gray-700 leading-relaxed">{getTypedValue<string>(personalizedPrep, 'tellMeAboutYourself') || ''}</div>
                            }
                          </div>
                        </div>
                        
                        {/* Why This Company Tips */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Why This Company? - Key Tips
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(personalizedPrep, 'whyThisCompany') 
                              ? getTypedValue<string[]>(personalizedPrep, 'whyThisCompany')?.map((tip: string, i: number) => (
                                  <div key={i} className="flex items-start">
                                    <span className="text-indigo-500 mr-3 mt-1 flex-shrink-0">•</span>
                                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                                  </div>
                                ))
                              : <div className="text-gray-700 leading-relaxed">{getTypedValue<string>(personalizedPrep, 'whyThisCompany') || ''}</div>
                            }
                          </div>
                        </div>
                        
                        {/* Greatest Strength Tips */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Your Greatest Strength - Key Tips
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(personalizedPrep, 'strength') 
                              ? getTypedValue<string[]>(personalizedPrep, 'strength')?.map((tip: string, i: number) => (
                                  <div key={i} className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1 flex-shrink-0">•</span>
                                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                                  </div>
                                ))
                              : <div className="text-gray-700 leading-relaxed">{getTypedValue<string>(personalizedPrep, 'strength') || ''}</div>
                            }
                          </div>
                        </div>
                        
                        {/* Greatest Weakness Tips */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Your Greatest Weakness - Key Tips
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(personalizedPrep, 'weakness') 
                              ? getTypedValue<string[]>(personalizedPrep, 'weakness')?.map((tip: string, i: number) => (
                                  <div key={i} className="flex items-start">
                                    <span className="text-amber-500 mr-3 mt-1 flex-shrink-0">•</span>
                                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                                  </div>
                                ))
                              : <div className="text-gray-700 leading-relaxed">{getTypedValue<string>(personalizedPrep, 'weakness') || ''}</div>
                            }
                          </div>
                        </div>
                        
                        {/* Questions to Ask */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Questions to Ask the Interviewer
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(personalizedPrep, 'questionsToAsk')?.map((q: string, i: number) => (
                              <div key={i} className="flex items-start">
                                <span className="text-purple-500 mr-3 mt-1 flex-shrink-0">•</span>
                                <span className="text-gray-700 leading-relaxed">{q}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Salary Negotiation Tips */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                            Salary Negotiation Tips
                          </h4>
                          <div className="space-y-3">
                            {getTypedValue<string[]>(personalizedPrep, 'salaryNegotiation') 
                              ? getTypedValue<string[]>(personalizedPrep, 'salaryNegotiation')?.map((tip: string, i: number) => (
                                  <div key={i} className="flex items-start">
                                    <span className="text-emerald-500 mr-3 mt-1 flex-shrink-0">•</span>
                                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                                  </div>
                                ))
                              : <div className="text-gray-700 leading-relaxed">{getTypedValue<string>(personalizedPrep, 'salaryNegotiation') || ''}</div>
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}