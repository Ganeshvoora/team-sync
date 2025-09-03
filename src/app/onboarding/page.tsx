'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    skills: '',
    bio: '',
    employeeId: '',
    location: '',
    profilePictureUrl: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setMessage('Authentication error. Please log in again.')
        return
      }

      // Submit application via API route
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          ...formData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('Application submitted successfully! Please wait for admin approval.')
        // Redirect to pending approval page after 2 seconds
        setTimeout(() => {
          router.push('/pending-approval')
        }, 2000)
      } else {
        setMessage(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Complete Your Profile
              </h2>
              <p className="text-green-200">
                Help us set up your Team-Sync account by providing some additional information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-green-200 mb-2">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-green-200 mb-2">
                    Contact Number *
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="+1234567890"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-green-200 mb-2">
                  Employee ID
                </label>
                <input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Optional employee ID"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-green-200 mb-2">
                  Skills & Technologies
                </label>
                <input
                  id="skills"
                  name="skills"
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., JavaScript, React, Python, Project Management"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-green-200 mb-2">
                  Brief Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us a bit about yourself and your professional background..."
                  value={formData.bio}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-green-200 mb-2">
                    Location *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., San Francisco, CA"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-green-200 mb-2">
                    Profile Picture URL (Optional)
                  </label>
                  <input
                    id="profilePictureUrl"
                    name="profilePictureUrl"
                    type="url"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.profilePictureUrl}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center justify-center">
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Submitting Application...' : 'Submit Application'}
                </div>
              </button>

              {message && (
                <div className={`text-center p-4 rounded-xl text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-500/20 border border-green-500/30 text-green-200' 
                    : 'bg-red-500/20 border border-red-500/30 text-red-200'
                }`}>
                  <div className="flex items-center justify-center">
                    {message.includes('successfully') ? (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {message}
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-green-200 text-sm">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p>Your application will be reviewed by an administrator. You&apos;ll receive access to your dashboard once approved. This typically takes 1-2 business days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
