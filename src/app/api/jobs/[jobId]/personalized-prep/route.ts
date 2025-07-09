import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
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

    // Check if user has premium access
    if (!user.isPremium) {
      return NextResponse.json({ 
        error: 'Premium feature. Upgrade to access personalized interview preparation.' 
      }, { status: 403 })
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

    // Get user's background from request body (optional)
    // const body = await request.json()
    // const { resume, experience, skills } = body
    // TODO: Use these fields when implementing actual AI integration

    // TODO: Implement OpenAI integration to create personalized prep
    // For now, return a placeholder response
    const personalizedPrep = {
      tellMeAboutYourself: {
        structure: "Present → Past → Future format",
        example: `I'm a ${jobApplication.position} with [X years] of experience specializing in [relevant skills]. Currently, I'm focusing on [current work/projects]. In my recent role at [company], I [key achievement]. I'm excited about the opportunity at ${jobApplication.company} because [specific reason related to role/company].`,
        tips: [
          "Keep it under 2 minutes",
          "Focus on relevant experience",
          "End with why you're interested in this role",
          "Practice until it sounds natural"
        ]
      },
      whyThisCompany: {
        structure: "Company research + Personal connection + Value alignment",
        example: `I'm drawn to ${jobApplication.company} for three main reasons: First, your work in [specific project/initiative] aligns perfectly with my experience in [relevant area]. Second, your company culture of [specific value] resonates with my approach to [work style/value]. Finally, this role offers the opportunity to [specific growth/impact].`,
        keyPoints: [
          "Reference specific company projects or values",
          "Connect to your experience",
          "Show you've done your research",
          "Be genuine and specific"
        ]
      },
      strengths: [
        {
          strength: "Problem-solving",
          example: "In my last role, I identified a bottleneck in our deployment process and implemented an automated solution that reduced deployment time by 60%.",
          howToDiscuss: "Use the STAR method (Situation, Task, Action, Result)"
        },
        {
          strength: "Collaboration",
          example: "I regularly work with cross-functional teams. For instance, I partnered with design and product teams to deliver a feature that increased user engagement by 25%.",
          howToDiscuss: "Emphasize communication and results"
        }
      ],
      weaknesses: [
        {
          weakness: "Perfectionism",
          framingStrategy: "I sometimes spend too much time perfecting details. I've learned to set time limits and focus on MVP first, then iterate.",
          improvement: "Now I use time-boxing and regular check-ins to ensure I'm balancing quality with efficiency."
        }
      ],
      questionsToAsk: [
        {
          question: "What does success look like in this role in the first 90 days?",
          why: "Shows you're thinking about making an immediate impact"
        },
        {
          question: "What are the biggest challenges facing the team right now?",
          why: "Demonstrates problem-solving mindset and genuine interest"
        },
        {
          question: `Can you tell me about the team I'd be working with?`,
          why: "Shows you value collaboration and team fit"
        },
        {
          question: "What opportunities for growth and learning does this role offer?",
          why: "Indicates long-term thinking and ambition"
        }
      ],
      salaryNegotiation: {
        strategy: "Research market rates, know your worth, be prepared to negotiate",
        response: `Based on my research and experience, I'm looking for a range of ${jobApplication.salaryRange || '[market rate]'}. I'm open to discussing the full compensation package.`,
        tips: [
          "Don't accept the first offer immediately",
          "Consider total compensation, not just base salary",
          "Be prepared with market data",
          "Show enthusiasm while negotiating"
        ]
      }
    }

    // Save personalized prep to the job application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.jobId },
      data: {
        personalizedPrep: personalizedPrep
      }
    })

    return NextResponse.json({
      message: 'Personalized interview preparation created successfully',
      prep: personalizedPrep,
      jobApplication: updatedApplication
    })
  } catch (error) {
    console.error('Error creating personalized prep:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}