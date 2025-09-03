'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PendingApplication {
  id: string
  email: string
  name: string
  contactNumber: string
  skills: string | null
  bio: string | null
  employeeId: string | null
  location: string | null
  profilePictureUrl: string | null
  createdAt: Date | string
}

interface Role {
  id: string
  name: string
  level: number
}

interface User {
  id: string
  name: string
  role: Role
}

interface ApplicationCardProps {
  application: PendingApplication
  allRoles: Role[]
  allUsers: User[]
}

export default function ApplicationCard({ application, allRoles, allUsers }: ApplicationCardProps) {
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedManager, setSelectedManager] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    if (!selectedRole) {
      alert('Please select a role')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          action: 'APPROVE',
          roleId: selectedRole,
          managerId: selectedManager || null,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message)
        router.refresh()
      } else {
        alert(result.error || 'Failed to approve application')
      }
    } catch (error) {
      console.error('Error approving application:', error)
      alert('An error occurred while approving the application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this application?')) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          action: 'REJECT',
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert(result.message)
        router.refresh()
      } else {
        alert(result.error || 'Failed to reject application')
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('An error occurred while rejecting the application')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-14 w-14">
              <div className="h-14 w-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-lg">
                  {application.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    {application.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {application.contactNumber}
                  </p>
                </div>
                <div className="space-y-2">
                  {application.employeeId && (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        ID: {application.employeeId}
                      </span>
                    </div>
                  )}
                  {application.location && (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        📍 {application.location}
                      </span>
                    </div>
                  )}
                  {application.profilePictureUrl && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Profile Picture</p>
                      <img 
                        src={application.profilePictureUrl} 
                        alt={`${application.name}'s profile`}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  {application.skills && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Skills</p>
                      <p className="text-sm text-gray-700 mt-1">{application.skills}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {application.bio && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bio</p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-3">{application.bio}</p>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="ml-6 flex flex-col space-y-4 flex-shrink-0">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Assign Role</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                required 
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              >
                <option value="">Select Role</option>
                {allRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide">Assign Manager</label>
              <select 
                value={selectedManager} 
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              >
                <option value="">No Manager</option>
                {allUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isProcessing || !selectedRole}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              <div className="flex items-center justify-center">
                {isProcessing && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isProcessing ? 'Processing...' : '✓ Approve'}
              </div>
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              <div className="flex items-center justify-center">
                {isProcessing && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isProcessing ? 'Processing...' : '✕ Reject'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
