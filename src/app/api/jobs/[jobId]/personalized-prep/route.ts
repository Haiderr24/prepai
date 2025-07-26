import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generatePersonalizedPrep } from '@/lib/openai'
import { JobApplication } from '@/types/dashboard'

export const dynamic = 'force-dynamic'

// interface User {
//   id: string
//   name?: string | null
//   email: string
// }

// Helper function to generate dynamic personalized prep
function generateDynamicPrep(job: JobApplication) {
  const company = job.company
  const position = job.position
  // const userName = user.name || 'candidate'
  
  const isSenior = position.toLowerCase().includes('senior') || position.toLowerCase().includes('lead')
  // const isManager = position.toLowerCase().includes('manager') || position.toLowerCase().includes('director')
  const isTech = position.toLowerCase().includes('engineer') || position.toLowerCase().includes('developer') ||
                 position.toLowerCase().includes('architect') || position.toLowerCase().includes('data')
  const isStartup = company.toLowerCase().includes('labs') || company.toLowerCase().includes('ai') || 
                    company.toLowerCase().includes('io') || company.length < 10
  
  const experience = isSenior ? '5+ years' : '3-5 years'
  const skillArea = isTech ? 'software development' : 
                   position.toLowerCase().includes('design') ? 'design' :
                   position.toLowerCase().includes('sales') ? 'sales' :
                   position.toLowerCase().includes('marketing') ? 'marketing' :
                   'your field'
  
  return {
    tellMeAboutYourself: `I'm a ${position} with ${experience} of experience specializing in ${skillArea}. Currently, I'm focusing on ${isTech ? 'building scalable solutions and mentoring junior developers' : 'driving results and collaborating with cross-functional teams'}. In my recent role, I ${isTech ? 'led the development of a key feature that improved system performance by 40%' : 'spearheaded a project that increased team productivity by 30%'}. I'm excited about the opportunity at ${company} because ${isStartup ? 'I thrive in fast-paced environments where I can make a direct impact' : 'I want to contribute to a company with such a strong reputation for innovation and excellence'}. This role represents the perfect next step in my career, combining my technical expertise with my passion for ${isTech ? 'solving complex problems' : 'delivering exceptional results'}.`,
    
    whyThisCompany: `I'm drawn to ${company} for several compelling reasons. First, your work in ${isTech ? 'cutting-edge technology' : 'industry leadership'} aligns perfectly with my experience in ${skillArea}. I'm particularly impressed by ${isStartup ? 'your rapid growth and innovative approach to solving real-world problems' : 'your commitment to excellence and your track record of successful projects'}. Second, your company culture of ${isStartup ? 'innovation, agility, and ownership' : 'collaboration, integrity, and continuous learning'} resonates strongly with my professional values. Finally, this ${position} role offers the opportunity to ${isSenior ? 'lead strategic initiatives and mentor the next generation of talent' : 'grow my skills while making meaningful contributions to impactful projects'}. I believe ${company} is where I can make my greatest contribution while continuing to develop professionally.`,
    
    strength: `My greatest strength is my ability to ${isTech ? 'architect solutions that balance technical excellence with business needs' : 'build relationships and drive results through effective collaboration'}. For example, ${isTech ? 'in my last role, I designed a microservices architecture that reduced deployment time by 60% while improving system reliability. I worked closely with product managers to ensure the solution met both technical requirements and business objectives.' : 'I recently led a cross-functional project that required aligning multiple stakeholders with competing priorities. By establishing clear communication channels and focusing on shared goals, we delivered the project 20% ahead of schedule.'} This demonstrates my ability to ${isTech ? 'think strategically about technology choices while keeping the bigger picture in mind' : 'navigate complex organizational dynamics while maintaining focus on outcomes'}. I believe this skill would be valuable at ${company} because ${isStartup ? 'in a fast-growing company, the ability to balance multiple priorities and think systemically is crucial' : 'success in complex organizations requires both technical competence and strong collaborative skills'}.`,
    
    weakness: `One area I've been working to improve is ${isTech ? 'balancing perfectionism with delivery speed' : 'delegating more effectively'}. ${isTech ? 'I naturally want to ensure every line of code is optimal, but I\'ve learned that sometimes good enough is better than perfect when it comes to meeting deadlines' : 'I tend to want to handle complex tasks myself rather than delegating them, especially when I know I can do them quickly'}. To address this, I've ${isTech ? 'implemented time-boxing techniques and regular code reviews to ensure quality while maintaining velocity' : 'started using a structured approach to task delegation, including clear specifications and regular check-ins'}. This has helped me ${isTech ? 'ship features faster while maintaining high standards' : 'build stronger team capacity while ensuring quality outcomes'}. I'm continuing to refine this balance, and I believe it's made me a more effective ${isTech ? 'developer' : 'team member'}.`,
    
    questionsToAsk: [
      `What does success look like in this ${position} role in the first 90 days?`,
      `What are the biggest technical challenges facing the team right now?`,
      `Can you tell me about the team I'd be working with and how this role fits into the broader organization?`,
      `What opportunities for professional growth and learning does ${company} offer?`,
      `How does ${company} approach ${isTech ? 'code quality and technical debt' : 'performance management and career development'}?`,
      `What do you enjoy most about working at ${company}?`,
      `How has the company culture evolved as you've grown?`
    ],
    
    salaryNegotiation: `Based on my research of market rates for ${position} roles in ${job.location || 'this area'} and my ${experience} of experience, I'm looking for a total compensation package in the ${job.salaryRange || '$80k-$120k'} range. I'm particularly interested in ${isStartup ? 'the equity opportunity and the chance to grow with the company' : 'the comprehensive benefits package and long-term career growth potential'}. I'm open to discussing the full compensation structure to find a package that works for both of us. I'm excited about the opportunity to contribute to ${company} and I'm confident that my skills and experience would add significant value to your team.`
  }
}

export async function POST(
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
    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        id: params.jobId,
        userId: user.id
      }
    })

    if (!jobApplication) {
      return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
    }

    // Check for existing personalized prep to avoid redundant API calls
    // Skip cache in development mode for testing
    if (jobApplication.personalizedPrep && process.env.NODE_ENV !== 'development') {
      console.log('🔄 Returning cached personalized prep for:', jobApplication.company)
      const response = NextResponse.json({
        message: 'Personalized prep already created (cached)',
        prep: jobApplication.personalizedPrep,
        jobApplication,
        metadata: {
          isAIGenerated: null, // Unknown for cached data
          generatedAt: new Date().toISOString(),
          apiKeyStatus: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
          environment: process.env.NODE_ENV || 'unknown',
          cached: true
        }
      })
      
      response.headers.set('X-AI-Status', 'cached')
      response.headers.set('X-API-Key-Status', process.env.OPENAI_API_KEY ? 'present' : 'missing')
      
      return response
    }

    // Log environment status
    console.log('Personalized Prep Debug:', {
      hasApiKey: !!process.env.OPENAI_API_KEY,
      keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NONE',
      environment: process.env.NODE_ENV,
      company: jobApplication.company
    })

    // Generate AI-powered personalized prep using OpenAI
    let personalizedPrep
    let isUsingAI = true
    let errorDetails = null
    
    try {
      console.log('Attempting OpenAI personalized prep generation...')
      personalizedPrep = await generatePersonalizedPrep({
        company: jobApplication.company,
        position: jobApplication.position,
        userBackground: user.name || 'candidate',
        jobDescription: jobApplication.notes || undefined,
      })
      console.log('✅ Successfully generated AI personalized prep for:', jobApplication.company)
    } catch (aiError) {
      console.error('❌ OpenAI API failed for personalized prep:', {
        error: aiError,
        message: aiError instanceof Error ? aiError.message : 'Unknown error',
        company: jobApplication.company
      })
      
      errorDetails = aiError instanceof Error ? aiError.message : 'Unknown error'
      isUsingAI = false
      
      // Fallback to dynamic prep if OpenAI fails
      personalizedPrep = generateDynamicPrep(jobApplication)
      console.log('🔄 Using fallback personalized prep for:', jobApplication.company)
    }

    // Save personalized prep to the job application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.jobId },
      data: {
        personalizedPrep: personalizedPrep
      }
    })

    const response = NextResponse.json({
      message: 'Personalized interview preparation created successfully',
      prep: personalizedPrep,
      jobApplication: updatedApplication,
      metadata: {
        isAIGenerated: isUsingAI,
        generatedAt: new Date().toISOString(),
        apiKeyStatus: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        environment: process.env.NODE_ENV || 'unknown',
        errorDetails: errorDetails
      }
    })
    
    // Add debug headers
    response.headers.set('X-AI-Status', isUsingAI ? 'openai' : 'fallback')
    response.headers.set('X-API-Key-Status', process.env.OPENAI_API_KEY ? 'present' : 'missing')
    
    return response
  } catch (error) {
    console.error('Error creating personalized prep:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}