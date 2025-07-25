import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInterviewQuestions } from '@/lib/openai'

// Helper function to generate dynamic questions based on job details
interface JobApplication {
  company: string
  position: string
  jobType?: string | null
  location?: string | null
}

function generateDynamicQuestions(job: JobApplication) {
  const company = job.company
  const position = job.position
  const jobType = job.jobType || 'Full-time'
  const location = job.location || 'the office'
  
  // Extract key words from position for more targeted questions
  const isSenior = position.toLowerCase().includes('senior') || position.toLowerCase().includes('lead')
  const isManager = position.toLowerCase().includes('manager') || position.toLowerCase().includes('director')
  const isTech = position.toLowerCase().includes('engineer') || position.toLowerCase().includes('developer') || 
                 position.toLowerCase().includes('architect') || position.toLowerCase().includes('data')
  const isDesign = position.toLowerCase().includes('design') || position.toLowerCase().includes('ux') || 
                   position.toLowerCase().includes('ui')
  // const isSales = position.toLowerCase().includes('sales') || position.toLowerCase().includes('business development')
  // const isMarketing = position.toLowerCase().includes('marketing') || position.toLowerCase().includes('growth')
  
  return {
    behavioral: [
      `Tell me about a time when you had to adapt to a significant change at work. How did you handle it?`,
      `Describe a situation where you had to work with a difficult stakeholder or team member. What was your approach?`,
      isManager ? `Share an example of how you've successfully built and motivated a high-performing team.` : 
                  `How do you handle feedback from your manager, especially when it's critical?`,
      `Tell me about a project that didn't go as planned. What did you learn from it?`,
      isSenior ? `Describe a time when you had to influence senior leadership to adopt your recommendation.` :
                 `How do you prioritize multiple tasks when everything seems urgent?`,
      `Give me an example of when you went above and beyond for a customer or colleague.`,
      `Tell me about a time you had to learn something completely new for your job. How did you approach it?`
    ],
    
    technical: isTech ? [
      `Walk me through your experience with the tech stack mentioned in the ${position} role.`,
      `How would you design a scalable system for ${company}'s main product?`,
      `Describe your approach to code reviews and ensuring code quality.`,
      `What's your experience with CI/CD pipelines and deployment strategies?`,
      `How do you stay current with new technologies and determine what's worth adopting?`,
      `Tell me about a particularly challenging bug you've solved. What was your debugging process?`,
      `How would you approach optimizing a slow-performing application?`
    ] : isDesign ? [
      `Walk me through your design process from research to final implementation.`,
      `How do you balance user needs with business requirements in your designs?`,
      `What tools and methods do you use for user research and testing?`,
      `How do you handle design critique and incorporate feedback?`,
      `Describe a time when you had to advocate for a user-centered design decision.`,
      `How do you ensure consistency across different platforms and products?`,
      `What's your approach to designing for accessibility?`
    ] : [
      `What specific skills from your background would transfer well to the ${position} role?`,
      `How do you approach learning new tools or technologies required for your work?`,
      `Describe your experience with data analysis and making data-driven decisions.`,
      `What project management methodologies have you used successfully?`,
      `How do you ensure quality and accuracy in your work?`,
      `Tell me about your experience collaborating with cross-functional teams.`,
      `What tools or systems have you implemented to improve efficiency?`
    ],
    
    roleSpecific: [
      `What specifically interests you about the ${position} role at ${company}?`,
      `How does this position align with your career goals for the next 3-5 years?`,
      isSenior ? `How would you approach building relationships with key stakeholders in your first 90 days?` :
                 `What would your 30-60-90 day plan look like in this role?`,
      `What unique perspective or skills would you bring to our ${position.includes('team') ? position : position + ' team'}?`,
      isManager ? `What's your leadership philosophy and how would it benefit ${company}?` :
                  `How do you see yourself contributing to the team's success?`,
      `Based on your understanding of the role, what do you think the biggest challenges will be?`,
      jobType === 'Remote' ? `How do you maintain productivity and collaboration in a remote environment?` :
                             `How do you feel about ${jobType.toLowerCase()} work at ${location}?`
    ],
    
    company: [
      `What do you know about ${company}'s mission and how does it resonate with you?`,
      `Why ${company} specifically, compared to other companies in the same industry?`,
      `What aspects of ${company}'s culture appeal to you the most?`,
      `How do you see ${company} evolving in the next few years, and how would you contribute to that growth?`,
      `What questions do you have about ${company}'s products or services?`,
      `Based on your research, what do you think ${company} does better than its competitors?`,
      `How would your values and work style fit with what you know about ${company}'s culture?`
    ]
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params;
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


    // Check if job application belongs to user
    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.jobId,
        userId: user.id
      }
    })

    if (!jobApplication) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    // Check for existing AI questions to avoid redundant API calls
    // Skip cache in development mode for testing
    if (jobApplication.aiQuestions && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        message: 'Interview questions already generated',
        questions: jobApplication.aiQuestions,
        jobApplication
      })
    }

    // Generate AI-powered questions using OpenAI
    let questions
    try {
      questions = await generateInterviewQuestions({
        company: jobApplication.company,
        position: jobApplication.position,
        jobDescription: jobApplication.notes || undefined,
        jobType: jobApplication.jobType || undefined,
      })
    } catch (aiError) {
      console.error('OpenAI API failed, using fallback:', aiError)
      // Fallback to dynamic questions if OpenAI fails
      questions = generateDynamicQuestions(jobApplication)
    }

    // Save generated questions to the job application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.jobId },
      data: {
        aiQuestions: questions
      }
    })

    return NextResponse.json({
      message: 'Interview questions generated successfully',
      questions,
      jobApplication: updatedApplication
    })
  } catch (error) {
    console.error('Error generating interview questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}