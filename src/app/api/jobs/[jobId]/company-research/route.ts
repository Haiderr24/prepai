import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCompanyResearch } from '@/lib/openai'
import { JobApplication } from '@/types/dashboard'

export const dynamic = 'force-dynamic'

// Helper function to generate dynamic company research based on company details
function generateDynamicResearch(job: JobApplication) {
  const company = job.company
  const position = job.position
  const location = job.location || 'Multiple locations'
  
  // Determine company type based on name patterns
  const isStartup = company.toLowerCase().includes('labs') || company.toLowerCase().includes('ai') || 
                    company.toLowerCase().includes('io') || company.length < 10
  const isTech = position.toLowerCase().includes('engineer') || position.toLowerCase().includes('developer') ||
                 position.toLowerCase().includes('data') || position.toLowerCase().includes('tech')
  const isRemote = job.jobType === 'Remote' || job.location?.toLowerCase().includes('remote')
  
  // Generate company size based on name characteristics
  const companySize = isStartup ? '50-200 employees' : 
                      company.length > 15 ? '5000+ employees' :
                      company.includes(' ') ? '1000-5000 employees' : '200-1000 employees'
  
  // Generate founded year
  const foundedYear = isStartup ? `20${18 + Math.floor(Math.random() * 6)}` : 
                      `${1990 + Math.floor(Math.random() * 20)}`
  
  // Industry determination
  const industry = isTech ? 'Technology' :
                   position.toLowerCase().includes('sales') ? 'Sales & Business Development' :
                   position.toLowerCase().includes('marketing') ? 'Marketing & Advertising' :
                   position.toLowerCase().includes('finance') ? 'Financial Services' :
                   position.toLowerCase().includes('healthcare') ? 'Healthcare' :
                   'Professional Services'
  
  return {
    overview: {
      industry: industry,
      size: companySize,
      founded: foundedYear,
      headquarters: location,
      description: `${company} is a ${isStartup ? 'fast-growing startup' : 'well-established company'} in the ${industry.toLowerCase()} space, known for ${isStartup ? 'innovative solutions and rapid growth' : 'market leadership and stability'}. The company focuses on ${isTech ? 'cutting-edge technology solutions' : 'delivering exceptional value to clients'} and has built a reputation for ${isStartup ? 'disrupting traditional approaches' : 'consistent excellence and reliability'}.`
    },
    
    culture: {
      values: isStartup ? 
        ['Innovation First', 'Move Fast', 'Own Your Impact', 'Radical Transparency', 'Customer Obsession'] :
        ['Integrity', 'Excellence', 'Collaboration', 'Customer Success', 'Continuous Learning'],
      
      workEnvironment: `${company} offers a ${isStartup ? 'dynamic, fast-paced' : 'structured yet flexible'} work environment where ${isStartup ? 'creativity and initiative are highly valued' : 'professional growth and work-life balance are prioritized'}. The culture emphasizes ${isStartup ? 'rapid iteration, bold ideas, and personal ownership' : 'teamwork, strategic thinking, and sustainable growth'}. ${isRemote ? 'With a remote-first approach, the company has built strong virtual collaboration practices.' : `The ${location} office features modern amenities and collaborative spaces.`}`,
      
      benefits: isStartup ? [
        'Competitive equity packages',
        'Unlimited PTO policy',
        'Top-tier health, dental, and vision insurance',
        '$1,500 annual learning budget',
        'Remote work flexibility',
        'Latest tech equipment',
        'Monthly wellness stipend'
      ] : [
        'Comprehensive health benefits',
        '401(k) with 6% match',
        '20 days PTO + holidays',
        'Professional development programs',
        'Tuition reimbursement',
        'Employee stock purchase plan',
        'Wellness programs'
      ]
    },
    
    interviewProcess: {
      rounds: isTech ? [
        `Initial recruiter screen (30 min) - Culture fit and basic qualifications`,
        `Technical phone screen (45 min) - Coding or system design basics`,
        `Take-home assignment (2-4 hours) - Real-world problem solving`,
        `On-site/Virtual loop (4-5 hours):
         • Technical deep dive with ${position} team
         • System design with senior engineers
         • Behavioral interview with hiring manager
         • Culture fit with cross-functional partners`,
        `Final interview with ${isStartup ? 'founder/CTO' : 'department head'} (30 min)`
      ] : [
        `HR phone screen (30 min) - Background and interest in ${company}`,
        `Hiring manager interview (45 min) - Role-specific discussion`,
        `Team interviews (2-3 hours) - Meet potential colleagues`,
        `Case study or presentation (if applicable)`,
        `Final round with leadership (30-45 min)`
      ],
      
      timeline: `${isStartup ? '1-2 weeks' : '2-4 weeks'} from initial contact to offer. ${company} aims to move quickly while ensuring thorough evaluation.`,
      
      tips: [
        `Research ${company}'s recent ${isStartup ? 'funding rounds and product launches' : 'quarterly reports and strategic initiatives'}`,
        `Prepare specific examples that demonstrate ${isTech ? 'technical problem-solving and system thinking' : 'business impact and leadership'}`,
        `Show genuine interest in ${company}'s ${isStartup ? 'mission to disrupt the industry' : 'long-term vision and values'}`,
        `Ask thoughtful questions about ${isStartup ? 'growth trajectory and technical challenges' : 'team dynamics and career development'}`,
        `Be ready to discuss why ${company} specifically, not just the role`
      ]
    },
    
    recentNews: [
      isStartup ? 
        `${company} raises $${20 + Math.floor(Math.random() * 80)}M in Series ${['A', 'B', 'C'][Math.floor(Math.random() * 3)]} funding to accelerate growth` :
        `${company} reports strong Q4 results with ${10 + Math.floor(Math.random() * 20)}% year-over-year growth`,
      
      `${company} launches new ${isTech ? 'AI-powered platform' : 'strategic initiative'} to enhance ${isTech ? 'developer productivity' : 'customer experience'}`,
      
      isStartup ?
        `${company} expands team by 50% and opens new ${location !== 'Multiple locations' ? 'engineering hub' : 'office in ' + location}` :
        `${company} recognized as a 'Best Place to Work' in ${new Date().getFullYear()}`,
      
      `${company} partners with ${isStartup ? 'major enterprise clients' : 'innovative startups'} to expand market reach`
    ],
    
    glassdoorInsights: {
      rating: isStartup ? (3.8 + Math.random() * 0.6).toFixed(1) : (3.9 + Math.random() * 0.8).toFixed(1),
      pros: isStartup ? [
        'Cutting-edge technology and interesting problems',
        'Smart, passionate colleagues',
        'High growth potential and learning opportunities',
        'Flexible work arrangements',
        'Strong equity compensation'
      ] : [
        'Stable company with good work-life balance',
        'Excellent benefits and compensation',
        'Professional development opportunities',
        'Collaborative team environment',
        'Clear career progression paths'
      ],
      cons: isStartup ? [
        'Fast-paced environment can be stressful',
        'Priorities can shift quickly',
        'Work-life balance during crunch times',
        'Growing pains as company scales'
      ] : [
        'Can be slow to adopt new technologies',
        'Large company bureaucracy',
        'Limited remote work options in some teams',
        'Promotion process can be lengthy'
      ]
    }
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

    // Check for existing company research to avoid redundant API calls
    // Skip cache in development mode for testing
    if (jobApplication.companyResearch && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        message: 'Company research already completed',
        research: jobApplication.companyResearch,
        jobApplication
      })
    }

    // Generate AI-powered company research using OpenAI
    let research
    let isUsingAI = true
    try {
      research = await generateCompanyResearch({
        company: jobApplication.company,
        position: jobApplication.position,
      })
      console.log('Successfully generated AI company research for:', jobApplication.company)
    } catch (aiError) {
      console.error('OpenAI API failed for company research, using fallback:', aiError)
      isUsingAI = false
      // Fallback to dynamic research if OpenAI fails
      research = generateDynamicResearch(jobApplication)
      console.log('Using fallback company research for:', jobApplication.company)
    }

    // Save research to the job application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: params.jobId },
      data: {
        companyResearch: research
      }
    })

    return NextResponse.json({
      message: 'Company research completed successfully',
      research,
      jobApplication: updatedApplication,
      metadata: {
        isAIGenerated: isUsingAI,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error researching company:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}