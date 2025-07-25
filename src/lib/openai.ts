import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory rate limiting (in production, use Redis or database)
// const rateLimits = new Map<string, { count: number; resetTime: number }>();

// function checkRateLimit(userId: string, maxRequests = 10, windowMs = 60000): boolean {
//   const now = Date.now();
//   const userLimit = rateLimits.get(userId);
  
//   if (!userLimit || now > userLimit.resetTime) {
//     rateLimits.set(userId, { count: 1, resetTime: now + windowMs });
//     return true;
//   }
  
//   if (userLimit.count >= maxRequests) {
//     return false;
//   }
  
//   userLimit.count++;
//   return true;
// }

export interface GenerateQuestionsParams {
  company: string;
  position: string;
  jobDescription?: string;
  jobType?: string;
}

export interface CompanyResearchParams {
  company: string;
  position?: string;
}

export interface PersonalizedPrepParams {
  company: string;
  position: string;
  userBackground?: string;
  jobDescription?: string;
}

export async function generateInterviewQuestions(params: GenerateQuestionsParams) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior hiring manager and interview specialist who has conducted 500+ interviews at top tech companies like Google, Meta, Amazon, and Microsoft. You understand each company's unique interview style, what they actually look for, and the real questions they ask. Generate questions that feel authentic to each company's interview process, not generic template questions. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: `I'm preparing for an interview at ${params.company} for a ${params.position} role${params.jobType ? ` (${params.jobType})` : ''}${params.jobDescription ? `. Job requirements: ${params.jobDescription}` : '.'}.

Generate interview questions that reflect ${params.company}'s actual interview style and this specific role:

**Behavioral Questions (5-6 questions):**
- Use ${params.company}'s known leadership principles/values in scenarios
- Include situations specific to ${params.position} responsibilities  
- Ask about handling real challenges this role faces
- Include follow-up probing questions that interviewers actually ask
- Focus on examples that demonstrate skills critical for success at ${params.company}

**Technical Interview Prep Focus:**
- What technical areas ${params.company} typically emphasizes (algorithms, system design, coding, architecture, etc.)
- Specific topics to study based on ${params.company}'s known interview style
- Interview format ${params.company} uses (whiteboard, pair programming, take-home, live coding, etc.)
- What ${params.company} values in technical interviews (clean code, communication, problem-solving approach, etc.)
- Concrete preparation recommendations tailored to ${params.company}'s process

**Role-Specific Questions (5-6 questions):**
- Ask about specific scenarios this ${params.position} would encounter
- Include questions about collaboration with other teams/roles
- Ask about prioritization and decision-making in this context
- Include questions about growth and impact in this specific role
- Ask about handling competing priorities typical for this position

**Company-Specific Questions (4-5 questions):**
- Reference specific products, services, or recent company news
- Ask about ${params.company}'s mission/values and personal alignment
- Include questions about why ${params.company} vs competitors
- Ask about understanding of ${params.company}'s business model/strategy
- Include questions about ${params.company}'s culture and work environment

Make questions challenging but fair, specific to ${params.company}'s interview style, and directly relevant to succeeding in this ${params.position} role. Avoid generic questions that could apply to any company or role.

IMPORTANT: Return ONLY a valid JSON object with exactly these keys: behavioral, technical, roleSpecific, company. Do not include any explanatory text before or after the JSON.

Example format:
{
  "behavioral": ["Question 1", "Question 2"],
  "technical": {
    "focus_areas": ["algorithms", "system design"],
    "key_topics": ["trees and graphs", "distributed systems"],
    "interview_style": ["whiteboard coding", "pair programming"],
    "company_values": ["clean code", "problem-solving approach"],
    "prep_recommendations": ["Practice LeetCode medium", "Study system design"]
  },
  "roleSpecific": ["Question 1", "Question 2"],
  "company": ["Question 1", "Question 2"]
}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content generated');

    console.log('OpenAI Raw Response:', content); // Debug log

    // Parse the response - GPT-4 should return structured JSON
    try {
      const parsed = JSON.parse(content);
      console.log('Parsed JSON:', parsed); // Debug log
      return {
        behavioral: parsed.behavioral || [],
        technical: parsed.technical || {
          focus_areas: ["algorithms", "problem solving"],
          key_topics: ["data structures", "coding fundamentals"],
          interview_style: ["whiteboard coding", "behavioral discussion"],
          company_values: ["clean code", "clear communication"],
          prep_recommendations: ["Practice coding problems", "Review CS fundamentals"]
        },
        roleSpecific: parsed.roleSpecific || parsed.role_specific || [],
        company: parsed.company || [],
      };
    } catch {
      console.log('JSON parsing failed, trying text extraction'); // Debug log
      
      // If JSON parsing fails, return some sample questions for now
      console.log('Returning fallback sample questions');
      return {
        behavioral: [
          `Tell me about a time you had to work with a difficult team member while working on a ${params.position} project.`,
          `Describe a situation where you had to meet a tight deadline in your ${params.position} role.`,
          `How do you prioritize tasks when everything seems urgent?`,
          `Give me an example of when you had to learn something completely new for your job.`,
          `Tell me about a time you had to adapt to a significant change at work.`
        ],
        technical: {
          focus_areas: ["General technical skills", "Problem solving", "System understanding"],
          key_topics: [`Technologies relevant to ${params.position}`, "Debugging and troubleshooting", "Best practices and methodologies"],
          interview_style: ["Technical discussion", "Problem-solving scenarios", "Experience-based questions"],
          company_values: ["Technical competency", "Learning mindset", "Problem-solving approach"],
          prep_recommendations: [`Review ${params.position} core technologies`, "Practice explaining technical concepts", "Prepare examples of problem-solving"]
        },
        roleSpecific: [
          `What specifically interests you about the ${params.position} role at ${params.company}?`,
          `How does this position align with your career goals?`,
          `What unique value would you bring to our ${params.position} team?`,
          `What do you think will be the biggest challenges in this ${params.position} role?`,
          `How would you approach your first 90 days in this position?`
        ],
        company: [
          `What attracts you to ${params.company} specifically?`,
          `Why ${params.company} over other companies in the same industry?`,
          `What do you know about ${params.company}'s culture and values?`,
          `How do you see ${params.company} evolving in the next few years?`,
          `What questions do you have about ${params.company}'s products or services?`
        ]
      };
    }
  } catch (error: unknown) {
    console.error('Error generating interview questions:', error);
    
    // Provide specific error messages for common issues
    if (error && typeof error === 'object' && 'status' in error) {
      const errorStatus = (error as { status: number }).status;
      if (errorStatus === 429) {
        throw new Error('OpenAI API quota exceeded. Please check your billing settings.')
      } else if (errorStatus === 401) {
        throw new Error('OpenAI API key is invalid. Please check your configuration.')
      } else if (errorStatus >= 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.')
      }
    }
    
    throw new Error('Failed to generate interview questions')
  }
}

export async function generateCompanyResearch(params: CompanyResearchParams) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior career strategist and company research specialist. Provide detailed, accurate insights about companies that will help job candidates prepare effectively for interviews. Always respond with valid JSON only - no other text."
        },
        {
          role: "user",
          content: `Research ${params.company}${params.position ? ` for ${params.position} role` : ''}. 

RESPOND WITH ONLY VALID JSON - NO OTHER TEXT:

{
  "industry": "Technology",
  "size": "500-1000 employees", 
  "founded": "2010",
  "headquarters": "San Francisco, CA",
  "description": "Brief 1-2 sentence company description",
  "values": ["Innovation", "Teamwork", "Excellence"],
  "work_culture": "Single sentence about work environment",
  "interview_rounds": ["Phone Screen", "Technical", "Final Round"],
  "interview_timeline": "2-3 weeks",
  "recent_news": ["Recent development 1", "Recent development 2", "Recent development 3"],
  "employee_pros": ["Good benefit 1", "Good benefit 2", "Good benefit 3"],
  "employee_cons": ["Challenge 1", "Challenge 2"]
}

Keep responses concise. Return valid JSON only.`
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content generated');

    console.log('Company Research Raw Response:', content); // Debug log

    // Clean the content - remove any text before/after JSON
    let cleanContent = content.trim();
    
    // Find JSON boundaries if there's extra text
    const jsonStart = cleanContent.indexOf('{');
    const jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }

    try {
      const parsed = JSON.parse(cleanContent);
      console.log('Company Research Parsed JSON:', parsed); // Debug log
      
      // Convert flat structure to expected nested format for frontend
      return {
        overview: {
          industry: parsed.industry || "Technology",
          size: parsed.size || "Unknown",
          founded: parsed.founded || "Unknown", 
          headquarters: parsed.headquarters || "Unknown",
          description: parsed.description || `${params.company} is a company in the industry.`
        },
        culture: {
          values: parsed.values || ["Innovation", "Excellence", "Collaboration"],
          workEnvironment: parsed.work_culture || "Professional work environment focused on results."
        },
        interviewProcess: {
          rounds: parsed.interview_rounds || ["Phone Screen", "Technical Interview", "Final Round"],
          timeline: parsed.interview_timeline || "2-4 weeks"
        },
        recentNews: parsed.recent_news || [
          `${params.company} continues to grow in the market`,
          "Recent strategic initiatives show strong performance",
          "Company maintains competitive position in industry"
        ],
        glassdoorInsights: {
          pros: parsed.employee_pros || ["Good compensation", "Interesting work", "Professional growth"],
          cons: parsed.employee_cons || ["Fast-paced environment", "High expectations"]
        },
      };
    } catch {
      console.log('Company Research JSON parsing failed'); // Debug log
      console.log('Failed content:', cleanContent.substring(0, 200)); // Show first 200 chars
      
      // Return well-structured fallback
      return {
        overview: {
          industry: "Technology",
          size: "Mid-size company",
          founded: "2000s", 
          headquarters: "United States",
          description: `${params.company} is a growing company known for innovation and quality products/services.`
        },
        culture: {
          values: ["Innovation", "Excellence", "Customer Focus"],
          workEnvironment: "Collaborative environment that values professional growth and work-life balance."
        },
        interviewProcess: {
          rounds: ["Initial Screen", "Technical/Behavioral Interview", "Final Round"],
          timeline: "2-3 weeks typical process"
        },
        recentNews: [
          `${params.company} continues expansion and growth`,
          "Strong market performance in recent quarters",
          "Investment in new technologies and talent"
        ],
        glassdoorInsights: {
          pros: ["Competitive compensation", "Growth opportunities", "Good team culture"],
          cons: ["Fast-paced environment", "High performance expectations"]
        },
      };
    }
  } catch (error: unknown) {
    console.error('Error generating company research:', error);
    
    // Provide specific error messages for common issues
    if (error && typeof error === 'object' && 'status' in error) {
      const errorStatus = (error as { status: number }).status;
      if (errorStatus === 429) {
        throw new Error('OpenAI API quota exceeded. Please check your billing settings.')
      } else if (errorStatus === 401) {
        throw new Error('OpenAI API key is invalid. Please check your configuration.')
      } else if (errorStatus >= 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.')
      }
    }
    
    throw new Error('Failed to generate company research')
  }
}

export async function generatePersonalizedPrep(params: PersonalizedPrepParams) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an executive interview coach with expertise in helping professionals craft compelling, authentic responses. Create personalized content that feels natural and genuine, not generic or templated. Use storytelling principles and the STAR method where appropriate. Focus on actionable advice."
        },
        {
          role: "user",
          content: `Interview prep tips for ${params.company} ${params.position} role${params.userBackground ? `. Background: ${params.userBackground}` : ''}${params.jobDescription ? `. Job: ${params.jobDescription}` : ''}. 

RESPOND WITH ONLY VALID JSON - NO OTHER TEXT:

{
  "tell_me_about_yourself_tips": ["Key talking point 1", "Key talking point 2", "Key talking point 3"],
  "why_this_company_tips": ["Research point to mention", "Company value that resonates", "Specific reason for interest"],
  "strength_tips": ["Relevant strength for role", "How to demonstrate it", "Example situation to mention"],
  "weakness_tips": ["Honest weakness to share", "How you're improving it", "Progress you've made"],
  "questions_to_ask": ["Thoughtful question 1", "Thoughtful question 2", "Thoughtful question 3", "Thoughtful question 4", "Thoughtful question 5"],
  "salary_negotiation_tips": ["Research tip", "Timing tip", "Negotiation approach"]
}

Focus on actionable talking points and strategic tips, not scripted answers.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No content generated');

    try {
      const parsed = JSON.parse(content);
      return {
        tellMeAboutYourself: parsed.tell_me_about_yourself_tips || ["Highlight relevant experience", "Connect background to role", "Show enthusiasm for opportunity"],
        whyThisCompany: parsed.why_this_company_tips || ["Mention specific company research", "Align with company values", "Explain role fit"],
        strength: parsed.strength_tips || ["Choose role-relevant strength", "Provide concrete example", "Show measurable impact"],
        weakness: parsed.weakness_tips || ["Share honest weakness", "Explain improvement plan", "Demonstrate growth mindset"],
        questionsToAsk: parsed.questions_to_ask || [
          "What does success look like in this role?",
          "Can you tell me about the team I'd be working with?",
          "What are the biggest challenges facing the team right now?",
          "How does this role contribute to the company's goals?",
          "What opportunities are there for professional development?"
        ],
        salaryNegotiation: parsed.salary_negotiation_tips || ["Research market rates", "Wait for appropriate timing", "Focus on total compensation package"],
      };
    } catch {
      // Return structured fallback tips
      return {
        tellMeAboutYourself: [`Highlight your ${params.position} experience`, "Connect your background to this specific role", `Show genuine interest in ${params.company}`],
        whyThisCompany: [`Research ${params.company}'s recent achievements`, "Mention specific company values that resonate", "Explain why this role fits your career goals"],
        strength: ["Choose a strength directly relevant to this position", "Prepare a specific STAR method example", "Quantify your impact where possible"],
        weakness: ["Select a real weakness you're actively improving", "Explain the steps you're taking to address it", "Show progress you've already made"],
        questionsToAsk: [
          "What does success look like in this role?",
          "Can you tell me about the team I'd be working with?",
          "What are the biggest challenges facing the team right now?",
          "How does this role contribute to the company's goals?",
          "What opportunities are there for professional development?"
        ],
        salaryNegotiation: ["Research market rates for this position and location", "Wait for them to bring up compensation first", "Be prepared to discuss your value proposition"],
      };
    }
  } catch (error: unknown) {
    console.error('Error generating personalized prep:', error);
    
    // Provide specific error messages for common issues
    if (error && typeof error === 'object' && 'status' in error) {
      const errorStatus = (error as { status: number }).status;
      if (errorStatus === 429) {
        throw new Error('OpenAI API quota exceeded. Please check your billing settings.')
      } else if (errorStatus === 401) {
        throw new Error('OpenAI API key is invalid. Please check your configuration.')
      } else if (errorStatus >= 500) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.')
      }
    }
    
    throw new Error('Failed to generate personalized preparation')
  }
}