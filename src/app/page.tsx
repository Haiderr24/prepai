'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, Sparkles, Building, FileText, CheckCircle } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Interview Questions',
      description: "Get tailored interview questions specific to the role and company you're applying to."
    },
    {
      icon: <Building className="h-6 w-6" />,
      title: 'Company Research',
      description: "Deep insights into company culture, interview process, and what they're looking for."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Personalized Interview Prep',
      description: 'Custom answers for "tell me about yourself" and other common interview questions.'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Job Application Tracking',
      description: 'Keep all your applications organized in one place with notes and status updates.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Free AI-Powered
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Interview Preparation
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
              PrepAI helps you ace your interviews with personalized questions, company research, and tailored preparation - all powered by AI and completely free.
            </p>
            <div className="flex justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="mt-4 text-gray-500 text-sm">No credit card required • Always free</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-xl text-gray-400">
              Powered by advanced AI to give you the edge in your job search
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900 p-8 rounded-lg border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                    {feature.icon}
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why PrepAI?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                100%
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Free Forever</h3>
              <p className="text-gray-400">No hidden fees, no premium tiers. All features are free for everyone.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                AI
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Powered by GPT-4</h3>
              <p className="text-gray-400">Get intelligent, personalized preparation powered by cutting-edge AI.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                ∞
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Unlimited Use</h3>
              <p className="text-gray-400">Track unlimited applications and generate as much AI content as you need.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Ace Your Interviews?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers using PrepAI to land their dream jobs.
          </p>
          {session ? (
            <Link
              href="/dashboard"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Now
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>© 2025 PrepAI. Free AI-powered interview preparation for everyone.</p>
        </div>
      </footer>
    </div>
  )
}