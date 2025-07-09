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
                        Generate company-specific interview questions based on the role and company.
                      </p>
                      {isPremium ? (
                        <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          Generate Questions
                        </button>
                      ) : (
                        <div>
                          <button className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
                            Generate Questions
                          </button>
                          <p className="text-xs text-gray-500 mt-2">Premium feature</p>
                        </div>
                      )}
                    </div>

                    {/* Company Research */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border">
                      <div className="flex items-center mb-3">
                        <Building className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Company Research</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Get deep insights about the company, culture, and interview process.
                      </p>
                      {isPremium ? (
                        <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                          Research Company
                        </button>
                      ) : (
                        <div>
                          <button className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
                            Research Company
                          </button>
                          <p className="text-xs text-gray-500 mt-2">Premium feature</p>
                        </div>
                      )}
                    </div>

                    {/* Personalized Prep */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-lg border">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Personalized Prep</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Create personalized &quot;tell me about yourself&quot; and other key answers.
                      </p>
                      {isPremium ? (
                        <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                          Create Prep
                        </button>
                      ) : (
                        <div>
                          <button className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed">
                            Create Prep
                          </button>
                          <p className="text-xs text-gray-500 mt-2">Premium feature</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upgrade Prompt for Free Users */}
                  {!isPremium && (
                    <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold mb-1">Unlock AI-Powered Interview Prep</h4>
                          <p className="text-blue-100">Get personalized questions, company research, and interview preparation for just $12/month.</p>
                        </div>
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors">
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}