'use client'

import React from 'react'
import AdminLayout from '@/components/AdminLayout'
import LogoutButton from '@/components/LogoutButton'
import UserCard from '@/components/UserCard'
import TaskCard from '@/components/TaskCard'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

interface DashboardClientProps {
  currentUser: any
  recentTasks: any[]
  teamMembers: any[]
  invitations: any[]
}

export default function DashboardClient({ 
  currentUser, 
  recentTasks, 
  teamMembers, 
  invitations 
}: DashboardClientProps) {
  const isAdmin = currentUser?.role?.name === 'Admin' || currentUser?.role?.name === 'CEO'

  return (
    <div className="p-4">
      <PageHeader title="Dashboard" subtitle="Welcome back" />
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {currentUser.name.split(' ')[0]}!
              </h2>
              <p className="text-indigo-600 dark:text-indigo-400 text-lg">
                {currentUser.role.name} • {currentUser.department?.name || 'No department'}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Employee ID: {currentUser.employeeId}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/profile"
                className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200"
              >
                Edit Profile
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Tasks</p>
                <p className="text-gray-900 dark:text-white text-2xl font-bold">{recentTasks.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Team Members</p>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Invites</p>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">{invitations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Role Level</p>
                  <p className="text-gray-900 dark:text-white text-2xl font-bold">{currentUser.role.level}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/org-chart"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <div className="text-blue-400 mb-3 group-hover:text-blue-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Organization Chart</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">View team structure and hierarchy</p>
            </Link>

            <Link
              href="/profile"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <div className="text-purple-400 mb-3 group-hover:text-purple-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">My Profile</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">Update your personal information</p>
            </Link>

            {(currentUser.role.level >= 50 || isAdmin) && (
              <Link
                href="/dashboard/management"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <div className="text-green-400 mb-3 group-hover:text-green-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Team Management</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">Manage your team and send invites</p>
              </Link>
            )}

            <Link
              href="/directory"
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
            >
              <div className="text-purple-400 mb-3 group-hover:text-purple-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Employee Directory</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">View profiles, assign tasks, and message colleagues</p>
            </Link>

            {isAdmin && (
              <>
                <Link
                  href="/admin/users"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="text-red-400 mb-3 group-hover:text-red-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">User Management</h4>
                  <p className="text-gray-300 text-sm">Manage all system users</p>
                </Link>

                <Link
                  href="/admin/roles"
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <div className="text-orange-400 mb-3 group-hover:text-orange-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Role Management</h4>
                  <p className="text-gray-300 text-sm">Configure system roles</p>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        {recentTasks.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Recent Tasks</h3>
              <Link
                href="/tasks"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                View all tasks →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTasks.slice(0, 6).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Your Team</h3>
              <Link
                href="/org-chart"
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                View org chart →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.slice(0, 6).map((member) => (
                <UserCard key={member.id} user={member} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Pending Invitations</h3>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{invitation.email}</p>
                      <p className="text-gray-300 text-sm">
                        Invited on {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                      {invitation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
