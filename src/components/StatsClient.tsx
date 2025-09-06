'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'

type TeamMemberStat = {
  user: {
    id: string
    name: string
    email: string
    role?: {
      name: string
    }
    department?: {
      name: string
    }
    manager?: {
      id: string
      name: string
    }
  }
  stats: {
    completed: number
    inProgress: number
    notStarted: number
    total: number
  }
}

type TaskStat = {
  status: string
  _count: number
}

type TeamStats = {
  completed: number
  inProgress: number
  notStarted: number
  total: number
}

interface StatsClientProps {
  currentUser: any
  teamMemberStats: TeamMemberStat[]
  weeklyTaskStats: TaskStat[]
  biweeklyTaskStats: TaskStat[]
  monthlyTaskStats: TaskStat[]
  teamStats: TeamStats
  isAdmin: boolean
}

export default function StatsClient({ 
  currentUser, 
  teamMemberStats,
  weeklyTaskStats,
  biweeklyTaskStats,
  monthlyTaskStats,
  teamStats,
  isAdmin
}: StatsClientProps) {
  const [activePeriod, setActivePeriod] = useState('weekly')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Check if user is CEO - they should see all chats regardless of having direct reports
  const isCEO = currentUser.role?.name === 'CEO'
  
  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    return teamMemberStats.filter(memberStat => 
      memberStat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberStat.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (memberStat.user.role?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (memberStat.user.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [teamMemberStats, searchTerm])
  
  // Get active stats based on selected period
  const activeStats = useMemo(() => {
    switch(activePeriod) {
      case 'weekly':
        return weeklyTaskStats
      case 'biweekly':
        return biweeklyTaskStats
      case 'monthly':
        return monthlyTaskStats
      default:
        return weeklyTaskStats
    }
  }, [activePeriod, weeklyTaskStats, biweeklyTaskStats, monthlyTaskStats])
  
  // Prepare chart data
  const statusChartData = useMemo(() => {
    return [
      { name: 'Completed', value: activeStats.find(s => s.status === 'COMPLETED')?._count || 0, color: '#10B981' },
      { name: 'In Progress', value: activeStats.find(s => s.status === 'IN_PROGRESS')?._count || 0, color: '#F59E0B' },
      { name: 'Not Started', value: activeStats.find(s => s.status === 'NOT_STARTED')?._count || 0, color: '#3B82F6' },
      { name: 'On Hold', value: activeStats.find(s => s.status === 'ON_HOLD')?._count || 0, color: '#8B5CF6' }
    ].filter(item => item.value > 0)
  }, [activeStats])
  
  // Prepare priority chart data
  const priorityChartData = useMemo(() => {
    return [
      { name: 'High', value: 30, color: '#EF4444' },
      { name: 'Medium', value: 45, color: '#F59E0B' },
      { name: 'Low', value: 25, color: '#10B981' }
    ]
  }, [])
  
  // Prepare team comparison data for bar chart
  const teamComparisonData = useMemo(() => {
    return filteredMembers
      .slice(0, 8) // Limit to top 8 for readability
      .map(member => ({
        name: member.user.name.split(' ')[0], // Just use first name for chart
        completed: member.stats.completed,
        inProgress: member.stats.inProgress,
        notStarted: member.stats.notStarted
      }))
  }, [filteredMembers])

  // Daily activity data for line chart
  const dailyActivityData = useMemo(() => [
    { date: 'Mon', tasks: 12, completed: 8 },
    { date: 'Tue', tasks: 15, completed: 10 },
    { date: 'Wed', tasks: 18, completed: 14 },
    { date: 'Thu', tasks: 10, completed: 7 },
    { date: 'Fri', tasks: 13, completed: 11 },
    { date: 'Sat', tasks: 5, completed: 4 },
    { date: 'Sun', tasks: 3, completed: 2 }
  ], [])
  
  // Get completion rate for each member
  const getMemberCompletionRate = (member: TeamMemberStat) => {
    if (member.stats.total === 0) return 0
    return Math.round((member.stats.completed / member.stats.total) * 100)
  }

  // Calculate overall team completion rate
  const teamCompletionRate = teamStats.total > 0 
    ? Math.round((teamStats.completed / teamStats.total) * 100) 
    : 0
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Time Period Filter */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button 
                onClick={() => setActivePeriod('weekly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePeriod === 'weekly' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Last 7 Days
              </button>
              <button 
                onClick={() => setActivePeriod('biweekly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePeriod === 'biweekly' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Last 14 Days
              </button>
              <button 
                onClick={() => setActivePeriod('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePeriod === 'monthly' 
                    ? 'bg-indigo-500 text-white shadow-sm' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Last 30 Days
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="w-64">
                <Input
                  placeholder="Search team members..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
          </div>
      
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                  <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.completed}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {teamCompletionRate > 0 && `${teamCompletionRate}% of total`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                  <svg className="w-6 h-6 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.inProgress}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {teamStats.total > 0 && `${Math.round((teamStats.inProgress / teamStats.total) * 100)}% of total`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Not Started</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamStats.notStarted}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {teamStats.total > 0 && `${Math.round((teamStats.notStarted / teamStats.total) * 100)}% of total`}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                  <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{teamMemberStats.length}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Active contributors</p>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-md transition-colors duration-200">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="members"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300"
              >
                Team Members
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300"
              >
                Activity
              </TabsTrigger>
              {(isAdmin || isCEO) && (
                <TabsTrigger 
                  value="chats"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-600 dark:text-gray-300"
                >
                  All Chats
                </TabsTrigger>
              )}
            </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Task Status Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent ? (percent * 100).toFixed(0) : 0)}%)`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        color: 'var(--tooltip-text)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Priority Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Task Priority Distribution</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent ? (percent * 100).toFixed(0) : 0)}%)`}
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        color: 'var(--tooltip-text)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Overdue Tasks Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overdue Tasks</h2>
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableHead className="text-gray-600 dark:text-gray-300">Task Name</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Assignee</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Due Date</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Priority</TableHead>
                  <TableHead className="text-gray-600 dark:text-gray-300">Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium text-gray-900 dark:text-white">Fix login page error</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">John Smith</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">Sept 1, 2025</TableCell>
                  <TableCell><span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full text-xs">High</span></TableCell>
                  <TableCell className="text-red-600 dark:text-red-400">3 days</TableCell>
                </TableRow>
                <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium text-gray-900 dark:text-white">Update user documentation</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">Emily Johnson</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">Aug 30, 2025</TableCell>
                  <TableCell><span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-full text-xs">Medium</span></TableCell>
                  <TableCell className="text-red-600 dark:text-red-400">5 days</TableCell>
                </TableRow>
                <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium text-gray-900 dark:text-white">Implement search feature</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">Alex Lee</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">Sept 2, 2025</TableCell>
                  <TableCell><span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full text-xs">High</span></TableCell>
                  <TableCell className="text-red-600 dark:text-red-400">2 days</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* Team Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Team Member Performance</h2>
            
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableHead className="text-gray-600 dark:text-gray-300">Member</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Role</TableHead>
                    {isAdmin && (
                      <TableHead className="text-gray-600 dark:text-gray-300">Department</TableHead>
                    )}
                    <TableHead className="text-gray-600 dark:text-gray-300 text-right">Completed</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 text-right">In Progress</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 text-right">Not Started</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 text-right">Total</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300 text-right">Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((memberStat) => (
                    <TableRow key={memberStat.user.id} className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-2">
                            {memberStat.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            {memberStat.user.name}
                            {memberStat.user.id === currentUser.id && (
                              <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs px-2 py-1 rounded">You</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{memberStat.user.role?.name || 'N/A'}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-gray-600 dark:text-gray-300">{memberStat.user.department?.name || 'N/A'}</TableCell>
                      )}
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{memberStat.stats.completed}</TableCell>
                      <TableCell className="text-right text-amber-600 dark:text-amber-400">{memberStat.stats.inProgress}</TableCell>
                      <TableCell className="text-right text-blue-600 dark:text-blue-400">{memberStat.stats.notStarted}</TableCell>
                      <TableCell className="text-right text-gray-900 dark:text-white">{memberStat.stats.total}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-emerald-500 dark:bg-emerald-400 h-2.5 rounded-full" 
                              style={{ width: `${getMemberCompletionRate(memberStat)}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-900 dark:text-white">{getMemberCompletionRate(memberStat)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Team Comparison</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teamComparisonData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #e5e7eb',
                      color: '#111827'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="inProgress" fill="#F59E0B" name="In Progress" />
                  <Bar dataKey="notStarted" fill="#3B82F6" name="Not Started" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Activity</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyActivityData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        border: '1px solid #e5e7eb',
                        color: '#111827'
                      }} 
                    />
                    <Legend />
                    <Line type="monotone" dataKey="tasks" stroke="#6366f1" name="Total Tasks" />
                    <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed Tasks" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Task Completed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">John Smith completed "Fix login page error"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Today, 10:30 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">New Task</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Emily Johnson created "Update product roadmap"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Today, 9:15 AM</p>
                  </div>
                </div>
                
                <div className="flex items-start pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Status Changed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Alex Lee moved "Implement search feature" to In Progress</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yesterday, 4:45 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Comment Added</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Maria Garcia commented on "Update user documentation"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Yesterday, 2:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {(isAdmin || isCEO) && (
          <TabsContent value="chats" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mr-3">All Team Chats</h2>
                  {isCEO && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                      CEO Access
                    </span>
                  )}
                </div>
                <div className="w-64">
                  <Input
                    placeholder="Search in conversations..."
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participants</TableHead>
                    <TableHead>Last Message</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">JS</div>
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">EJ</div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">John Smith & Emily Johnson</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Product team</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">We need to discuss the login page redesign...</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">10:30 AM</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        View Chat
                      </button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">AL</div>
                          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">MG</div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Alex Lee & Maria Garcia</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Engineering team</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">The search feature implementation is running behind...</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">09:45 AM</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        View Chat
                      </button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">TS</div>
                          <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">RJ</div>
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">+2</div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Design Team Group Chat</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">4 members</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">Let's review the new wireframes tomorrow morning...</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">Yesterday</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-amber-500"></span>
                        Idle
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        View Chat
                      </button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">EJ</div>
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">JS</div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Emily Johnson & John Smith</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Private conversation</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">I'll send you the updated roadmap by end of day...</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">Sept 3, 2025</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-gray-400"></span>
                        Inactive
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        View Chat
                      </button>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow className="border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">DP</div>
                          <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">SL</div>
                          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm border-2 border-white dark:border-gray-700">+5</div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Company-wide Announcements</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">All team members</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">Important update about our quarterly goals...</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">Sept 1, 2025</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                        View Chat
                      </button>
                    </TableCell>
                  </TableRow>
                  
                  {/* Add a note about CEO visibility */}
                  {isCEO && (
                    <TableRow className="bg-indigo-50 dark:bg-indigo-900 border-gray-100 dark:border-gray-700">
                      <TableCell colSpan={5} className="py-3">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">As CEO, you have visibility to all team communications across the organization</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              <div className="flex justify-center mt-6">
                <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Load More Chats
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chat Analytics</h2>
                {isCEO && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                    CEO Access • Organization-wide visibility
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Total Conversations</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">127</p>
                  <p className="text-xs text-emerald-600">↑ 12% from last month</p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Active Chats Today</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">32</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">↑ 8% from yesterday</p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-gray-600 dark:text-gray-300 text-sm">Avg. Response Time</h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">14 min</p>
                  <p className="text-xs text-red-600 dark:text-red-400">↑ 3 min from last week</p>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
        </div>
      </div>
    </div>
  )
}
