import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mark this route as dynamic since it uses database operations
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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

    const jobApplications = await prisma.jobApplication.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(jobApplications)
  } catch (error) {
    console.error('Error fetching job applications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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


    const body = await request.json()
    const { 
      company, 
      position, 
      jobUrl, 
      salaryRange, 
      location, 
      jobType,
      notes,
      companyNotes
    } = body

    // Validate required fields
    if (!company || company.trim().length === 0) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    if (!position || position.trim().length === 0) {
      return NextResponse.json({ error: 'Position is required' }, { status: 400 })
    }

    const jobApplication = await prisma.jobApplication.create({
      data: {
        company: company.trim(),
        position: position.trim(),
        jobUrl,
        salaryRange,
        location,
        jobType,
        notes,
        companyNotes,
        userId: user.id
      }
    })

    return NextResponse.json(jobApplication, { status: 201 })
  } catch (error) {
    console.error('Error creating job application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}