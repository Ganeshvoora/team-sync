'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string;
  email: string;
  name: string | null;
  profilePictureUrl: string | null;
  managerId: string | null;
  roleId: string | null;
  departmentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: {
    name: string;
  } | null;
}

interface EnhancedNavigationProps {
  currentUser: User;
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 11h8M8 15h8" />
      </svg>
    ),
    notifications: 0
  },
  { 
    name: 'Organization Chart', 
    href: '/org-chart', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    notifications: 0
  },
  { 
    name: 'Directory', 
    href: '/directory', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H5a2 2 0 01-2-2V6a2 2 0 012-2h3m0 12v-2m0 2v2m0-2h4m-4-2H5m3 0v-2m0 2v2m0-2h4m0-2H8m0 0V8m0 0h4m0 0V6m0 2v2m0-2h3a2 2 0 012 2v8a2 2 0 01-2 2h-3m0-2v2m0-2v-2" />
      </svg>
    ),
    notifications: 0
  },
  { 
    name: 'Tasks', 
    href: '/tasks', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    notifications: 7
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    notifications: 0
  },
]

const managementNavigation = [
  { 
    name: 'Team Management', 
    href: '/dashboard/management', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    notifications: 2
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    notifications: 0
  },
]

export default function EnhancedNavigation({ currentUser }: EnhancedNavigationProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  const isManager = currentUser.role?.name === 'Manager' || currentUser.role?.name === 'CEO'

  return (
    <div className={`${isExpanded ? 'w-64' : 'w-20'} h-screen bg-black/20 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div>
              <h1 className="text-xl font-bold text-white">Team-Sync</h1>
              <p className="text-sm text-purple-200">Enterprise Edition</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:bg-white/10"
          >
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
                }
              `}>
                <div className="flex items-center space-x-3">
                  {item.icon}
                  {isExpanded && <span className="font-medium">{item.name}</span>}
                </div>
                {isExpanded && item.notifications > 0 && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {item.notifications}
                  </Badge>
                )}
              </div>
            </Link>
          )
        })}

        {isManager && (
          <div className="pt-4 mt-4 space-y-1 border-t border-white/10">
            <h3 className={`px-3 text-xs font-semibold uppercase text-indigo-300 ${!isExpanded && 'text-center'}`}>
              {isExpanded ? 'Management' : 'Mgmt'}
            </h3>
            {managementNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center p-2 text-sm font-medium rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-500/20 text-white'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                } ${isExpanded ? 'justify-start' : 'justify-center'}`}
              >
                {item.icon}
                {isExpanded && <span className="ml-3">{item.name}</span>}
                {isExpanded && item.notifications > 0 && (
                  <Badge className="ml-auto bg-red-500/80 text-white">{item.notifications}</Badge>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center">
          <img
            className="h-8 w-8 rounded-full"
            src={currentUser.profilePictureUrl || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
            alt={currentUser.name || 'User'}
          />
          {isExpanded && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{currentUser.name}</p>
              <p className="text-xs text-indigo-200">{currentUser.role?.name}</p>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-indigo-200 hover:text-white mt-4">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isExpanded && 'Logout'}
        </Button>
      </div>
    </div>
  )
}
