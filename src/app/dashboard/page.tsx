'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AddJobModal from '@/components/AddJobModal'
import JobDetailModal from '@/components/JobDetailModal'
import { JobApplication, JobFormData } from '@/types/dashboard'
import { ChevronUp, ChevronDown, Edit, Trash2, Brain, LogOut } from 'lucide-react'

type SortField = 'company' | 'position' | 'location' | 'salaryRange' | 'status' | 'appliedDate'
type SortDirection = 'asc' | 'desc'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobApplication[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editJob, setEditJob] = useState<JobApplication | null>(null)
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Table features
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('appliedDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    fetchJobs()
  }, [session, status, router])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      
      const data = await response.json()
      const jobs = data.map((job: JobApplication & { appliedDate: string; createdAt: string; updatedAt: string }) => ({
        ...job,
        appliedDate: new Date(job.appliedDate),
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
      }))
      
      setJobs(jobs)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load jobs'
      setError(errorMessage)
      console.error('Error fetching jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddJob = async (jobData: JobFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    const optimisticJob: JobApplication = {
      id: `temp-${Date.now()}`,
      company: jobData.company,
      position: jobData.position,
      status: 'Applied',
      appliedDate: new Date(),
      location: jobData.location || '',
      salaryRange: jobData.salaryRange || '',
      jobUrl: jobData.jobUrl || '',
      jobType: jobData.jobType || '',
      notes: jobData.notes || '',
      companyNotes: jobData.companyNotes || '',
      interviewNotes: '',
      aiQuestions: null,
      companyResearch: null,
      personalizedPrep: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session?.user?.id || '',
    }
    
    setJobs(prev => [optimisticJob, ...prev])
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add job')
      }
      
      const newJob = await response.json()
      
      setJobs(prev => prev.map(job => 
        job.id === optimisticJob.id 
          ? {
              ...newJob,
              appliedDate: new Date(newJob.appliedDate),
              createdAt: new Date(newJob.createdAt),
              updatedAt: new Date(newJob.updatedAt),
            }
          : job
      ))
    } catch (error) {
      setJobs(prev => prev.filter(job => job.id !== optimisticJob.id))
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleJobUpdate = (jobId: string, updatedJob: JobApplication) => {
    setJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job))
    setSelectedJob(updatedJob)
  }

  const handleJobDelete = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId))
    setSelectedJob(null)
    setIsDetailModalOpen(false)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'interview') {
        filtered = filtered.filter(job => 
          ['Phone Screen', 'Interview', 'Final Round'].includes(job.status)
        )
      } else if (statusFilter === 'closed') {
        filtered = filtered.filter(job => 
          ['Offer', 'Rejected', 'Withdrawn'].includes(job.status)
        )
      } else {
        filtered = filtered.filter(job => job.status === statusFilter)
      }
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const aValue: unknown = a[sortField]
      const bValue: unknown = b[sortField]

      // Handle date sorting
      if (sortField === 'appliedDate') {
        const aTime = (aValue as Date).getTime()
        const bTime = (bValue as Date).getTime()
        
        // Handle null/undefined values
        if (!aTime && !bTime) return 0
        if (!aTime) return 1
        if (!bTime) return -1
        
        // Compare values
        if (aTime < bTime) return sortDirection === 'asc' ? -1 : 1
        if (aTime > bTime) return sortDirection === 'asc' ? 1 : -1
        return 0
      }

      // Handle null/undefined values
      if (!aValue && !bValue) return 0
      if (!aValue) return 1
      if (!bValue) return -1

      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [jobs, searchQuery, statusFilter, sortField, sortDirection])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Phone Screen':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200'
      case 'Interview':
        return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'Final Round':
        return 'bg-violet-100 text-violet-800 border border-violet-200'
      case 'Offer':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-200'
      case 'Withdrawn':
        return 'bg-orange-100 text-orange-800 border border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 text-gray-400" />
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-gray-900" /> : 
      <ChevronDown className="w-4 h-4 text-gray-900" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`transition-all duration-300 ease-in-out ${
        isAddModalOpen || editJob ? 'mr-96' : 'mr-0'
      }`}>
        <div className="max-w-none">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white">Job Applications</h1>
                <p className="text-gray-400 mt-2">Track your job search progress and manage applications</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Signed in as</p>
                  <p className="text-white font-medium">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex gap-4">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search by company or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 placeholder-gray-500 text-gray-900"
                />

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="Applied">Applied</option>
                  <option value="Phone Screen">Phone Screen</option>
                  <option value="Interview">Interview</option>
                  <option value="Final Round">Final Round</option>
                  <option value="interview">All Interviews</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="closed">All Closed</option>
                </select>

                {/* Add Job Button */}
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium border border-gray-800"
                >
                  + Add Job Application
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading applications...</div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No applications found matching your filters.' 
                : 'No job applications yet. Click "Add Job Application" to get started!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      <SortIcon field="company" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center gap-1">
                      Position
                      <SortIcon field="position" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location
                      <SortIcon field="location" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('salaryRange')}
                  >
                    <div className="flex items-center gap-1">
                      Salary
                      <SortIcon field="salaryRange" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('appliedDate')}
                  >
                    <div className="flex items-center gap-1">
                      Applied Date
                      <SortIcon field="appliedDate" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAndSortedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{job.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.location || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.salaryRange || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.appliedDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditJob(job)
                            setIsAddModalOpen(true)
                          }}
                          className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                          title="Edit Job Application"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-1 rounded-md text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all"
                          title="AI-Powered Interview Prep"
                        >
                          <Brain className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this application?')) {
                              try {
                                const response = await fetch(`/api/jobs/${job.id}`, {
                                  method: 'DELETE',
                                })
                                if (response.ok) {
                                  handleJobDelete(job.id)
                                }
                              } catch (error) {
                                console.error('Error deleting job:', error)
                              }
                            }
                          }}
                          className="p-1 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete Job Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>

            {/* Stats */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span>Total: <span className="font-semibold text-gray-900">{jobs.length}</span> applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span>Showing: <span className="font-semibold text-gray-900">{filteredAndSortedJobs.length}</span> applications</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Job Modal */}
        <AddJobModal
          isOpen={isAddModalOpen || !!editJob}
          onClose={() => {
            setIsAddModalOpen(false)
            setEditJob(null)
          }}
          onSubmit={handleAddJob}
          isSubmitting={isSubmitting}
          editJob={editJob}
          onUpdate={handleJobUpdate}
        />

        {/* Job Detail Modal */}
        <JobDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedJob(null)
          }}
          job={selectedJob}
          onUpdate={handleJobUpdate}
          onDelete={handleJobDelete}
        />
        </div>
      </div>
    </div>
  )
}