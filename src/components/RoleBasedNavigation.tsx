'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LogoutButton from './LogoutButton'
import NotificationBell from './NotificationBell'

// Define navigation items for different roles
const getUserNavigation = (userRole?: string) => {
  const baseNavigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 11h8M8 15h8" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager', 'Associate']
    },
    { 
      name: 'Organization Chart', 
      href: '/org-chart', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager', 'Associate']
    },
    { 
      name: 'Employee Directory', 
      href: '/directory', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager', 'Associate']
    },
    { 
      name: 'Tasks', 
      href: '/tasks', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager', 'Associate']
    },
    { 
      name: 'Projects', 
      href: '/projects', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager']
    },
    { 
      name: 'Reports', 
      href: '/reports', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager']
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin', 'Director', 'Manager', 'Associate']
    }
  ]

  // Add admin-specific navigation
  const adminNavigation = [
    { 
      name: 'Admin Panel', 
      href: '/admin', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      notifications: 0,
      roles: ['CEO', 'Admin']
    }
  ]

  // Filter navigation based on user role
  let navigation = baseNavigation.filter(item => 
    !userRole || item.roles.includes(userRole)
  )

  // Add admin navigation for admin users
  if (userRole === 'CEO' || userRole === 'Admin') {
    navigation = [...navigation, ...adminNavigation]
  }

  return navigation
}

interface RoleBasedNavigationProps {
  currentUser?: {
    id: string
    name: string
    email: string
    role?: {
      name: string
      level: number
    } | null
  } | null
}

export default function RoleBasedNavigation({ currentUser }: RoleBasedNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  
  const navigation = getUserNavigation(currentUser?.role?.name)

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Team-Sync</h1>
              <p className="text-xs text-slate-300">Enterprise Edition</p>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2">
          {currentUser && <NotificationBell />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-300 hover:text-white hover:bg-slate-700 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div className={`
                flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}>
                <div className="flex items-center space-x-3">
                  <div className={`${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </div>
                {!isCollapsed && item.notifications > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                    {item.notifications}
                  </Badge>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-700">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {currentUser ? getUserInitials(currentUser.name) : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {currentUser?.name || 'User'}
                </div>
                <div className="text-slate-400 text-xs truncate">
                  {currentUser?.role?.name || 'Role'}
                </div>
              </div>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer">
              <span className="text-white font-medium text-sm">
                {currentUser ? getUserInitials(currentUser.name) : 'U'}
              </span>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  )
}
