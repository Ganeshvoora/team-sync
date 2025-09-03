import React from 'react'
import Link from 'next/link'
import NotificationBell from './NotificationBell'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Navigation */}
      <div className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {subtitle && (
                <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                  {subtitle}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-4">
                <Link href="/dashboard" className="text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Dashboard
                </Link>
                <Link href="/directory" className="text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Directory
                </Link>
                <Link href="/org-chart" className="text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Org Chart
                </Link>
                <Link href="/admin/users" className="text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Users
                </Link>
                <Link href="/admin/roles" className="text-white hover:text-blue-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Roles
                </Link>
              </nav>
              <NotificationBell />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
