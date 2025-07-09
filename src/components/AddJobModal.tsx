'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { JobFormData, JobApplication } from '@/types/dashboard'

interface AddJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: JobFormData) => Promise<void>
  isSubmitting?: boolean
  editJob?: JobApplication | null
  onUpdate?: (jobId: string, updatedJob: JobApplication) => void
}

export default function AddJobModal({ isOpen, onClose, onSubmit, isSubmitting = false, editJob, onUpdate }: AddJobModalProps) {
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

  const [error, setError] = useState<string | null>(null)

  // Populate form when editing
  useEffect(() => {
    if (editJob) {
      setFormData({
        company: editJob.company,
        position: editJob.position,
        jobUrl: editJob.jobUrl || '',
        location: editJob.location || '',
        salaryRange: editJob.salaryRange || '',
        jobType: editJob.jobType || '',
        notes: editJob.notes || '',
        companyNotes: editJob.companyNotes || '',
      })
    } else {
      setFormData({
        company: '',
        position: '',
        jobUrl: '',
        location: '',
        salaryRange: '',
        jobType: '',
        notes: '',
        companyNotes: '',
      })
    }
  }, [editJob, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.company.trim() || !formData.position.trim()) {
      setError('Company and position are required')
      return
    }

    setError(null)
    try {
      if (editJob && onUpdate) {
        // Update existing job
        const response = await fetch(`/api/jobs/${editJob.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update job application')
        }
        
        const updatedJob = await response.json()
        onUpdate(editJob.id, {
          ...updatedJob,
          appliedDate: new Date(updatedJob.appliedDate),
          createdAt: new Date(updatedJob.createdAt),
          updatedAt: new Date(updatedJob.updatedAt),
        })
      } else {
        // Add new job
        await onSubmit(formData)
      }
      
      // Reset form on success
      setFormData({
        company: '',
        position: '',
        jobUrl: '',
        location: '',
        salaryRange: '',
        jobType: '',
        notes: '',
        companyNotes: '',
      })
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save job application'
      setError(errorMessage)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {editJob ? 'Edit Job Application' : 'Add Job Application'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Job URL */}
              <div>
                <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Job URL
                </label>
                <input
                  type="url"
                  id="jobUrl"
                  name="jobUrl"
                  value={formData.jobUrl}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Salary Range */}
              <div>
                <label htmlFor="salaryRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Job Type */}
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              {/* Application Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Application Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t p-6">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.company.trim() || !formData.position.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (editJob ? 'Updating...' : 'Adding...') : (editJob ? 'Update Application' : 'Add Application')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}