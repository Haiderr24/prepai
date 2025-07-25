import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params;
  try {
    const { prisma } = await import('@/lib/prisma')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.jobId,
        userId: user.id
      }
    })

    if (!jobApplication) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    return NextResponse.json(jobApplication)
  } catch (error) {
    console.error('Error fetching job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params;
  try {
    const { prisma } = await import('@/lib/prisma')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if job application belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.jobId,
        userId: user.id
      }
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      company, 
      position, 
      jobUrl, 
      salaryRange, 
      location, 
      jobType,
      status,
      notes,
      companyNotes,
      interviewNotes
    } = body

    // Validate required fields if provided
    if (company !== undefined && company.trim().length === 0) {
      return NextResponse.json({ error: 'Company name cannot be empty' }, { status: 400 })
    }

    if (position !== undefined && position.trim().length === 0) {
      return NextResponse.json({ error: 'Position cannot be empty' }, { status: 400 })
    }

    // Validate status if provided
    const validStatuses = ['Applied', 'Phone Screen', 'Interview', 'Final Round', 'Offer', 'Rejected', 'Withdrawn']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.jobId },
      data: {
        ...(company && { company: company.trim() }),
        ...(position && { position: position.trim() }),
        ...(jobUrl !== undefined && { jobUrl }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(location !== undefined && { location }),
        ...(jobType !== undefined && { jobType }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(companyNotes !== undefined && { companyNotes }),
        ...(interviewNotes !== undefined && { interviewNotes })
      }
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params;
  try {
    const { prisma } = await import('@/lib/prisma')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if job application belongs to user
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.jobId,
        userId: user.id
      }
    })

    if (!existingApplication) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    await prisma.jobApplication.delete({
      where: { id: params.jobId }
    })

    return NextResponse.json({ message: 'Job application deleted successfully' })
  } catch (error) {
    console.error('Error deleting job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}