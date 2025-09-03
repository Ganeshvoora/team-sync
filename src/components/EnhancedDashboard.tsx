'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

// Mock data for enhanced dashboard
const taskStatusData = [
  { name: 'Not Started', value: 12, color: '#ef4444' },
  { name: 'In Progress', value: 8, color: '#f59e0b' },
  { name: 'Completed', value: 25, color: '#10b981' },
  { name: 'On Hold', value: 3, color: '#6b7280' }
]

const teamProductivityData = [
  { name: 'Alice Johnson', completed: 8, inProgress: 3, total: 11 },
  { name: 'Bob Smith', completed: 12, inProgress: 2, total: 14 },
  { name: 'Carol Wilson', completed: 6, inProgress: 5, total: 11 },
  { name: 'David Brown', completed: 10, inProgress: 1, total: 11 }
]

const weeklyTrendsData = [
  { week: 'Week 1', completed: 15, assigned: 20 },
  { week: 'Week 2', completed: 22, assigned: 18 },
  { week: 'Week 3', completed: 18, assigned: 25 },
  { week: 'Week 4', completed: 25, assigned: 22 }
]

const departmentData = [
  { name: 'Engineering', tasks: 45, members: 12, completion: 78 },
  { name: 'Design', tasks: 23, members: 5, completion: 85 },
  { name: 'Marketing', tasks: 18, members: 7, completion: 72 },
  { name: 'Sales', tasks: 31, members: 9, completion: 65 }
]

export default function EnhancedDashboard() {
  const [timeFilter, setTimeFilter] = useState('week')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-purple-200">Comprehensive insights into team performance and productivity</p>
          </div>
          
          <Tabs value={timeFilter} onValueChange={setTimeFilter} className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <TabsList className="bg-transparent">
              <TabsTrigger value="week" className="data-[state=active]:bg-white/20 text-white">This Week</TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-white/20 text-white">This Month</TabsTrigger>
              <TabsTrigger value="quarter" className="data-[state=active]:bg-white/20 text-white">This Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">48</div>
              <div className="text-sm text-purple-200">+12% from last week</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">74%</div>
              <div className="text-sm text-purple-200">+5% from last week</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Avg. Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">2.3</div>
              <div className="text-sm text-purple-200">days per task</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-sm text-purple-200">-2 from last week</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Distribution */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Task Status Distribution</CardTitle>
              <CardDescription className="text-purple-200">Current status breakdown of all tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label
                    labelLine={false}
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Productivity */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Team Productivity</CardTitle>
              <CardDescription className="text-purple-200">Tasks completed vs. in progress by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamProductivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#e5e7eb" fontSize={12} />
                  <YAxis stroke="#e5e7eb" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trends and Departments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trends */}
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Weekly Trends</CardTitle>
              <CardDescription className="text-purple-200">Task completion and assignment trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="week" stroke="#e5e7eb" fontSize={12} />
                  <YAxis stroke="#e5e7eb" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} name="Completed" />
                  <Line type="monotone" dataKey="assigned" stroke="#3b82f6" strokeWidth={3} name="Assigned" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Overview */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Department Overview</CardTitle>
              <CardDescription className="text-purple-200">Performance by department</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{dept.name}</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {dept.completion}%
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-purple-200">
                    <span>{dept.tasks} tasks</span>
                    <span>{dept.members} members</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dept.completion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-purple-200">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                View Team
              </Button>
              <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
                View Reports
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
