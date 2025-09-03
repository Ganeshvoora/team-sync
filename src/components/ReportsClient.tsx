'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

interface ReportsClientProps {
  currentUser: any
  analyticsData: any
}

export default function ReportsClient({ currentUser, analyticsData }: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const { overview, departments, projectStats, taskStats } = analyticsData

  // Prepare chart data
  const taskStatusData = taskStats.map((stat: any) => ({
    name: stat.status.replace('_', ' '),
    value: stat._count.status
  }))

  const departmentData = departments.map((dept: any) => ({
    name: dept.name,
    users: dept._count.users,
    projects: dept._count.projects
  }))

  const projectProgressData = projectStats.map((project: any) => {
    const completedTasks = project.tasks.filter((task: any) => task.status === 'COMPLETED').length
    const totalTasks = project._count.tasks
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      progress,
      total: totalTasks,
      completed: completedTasks
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative p-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-indigo-200">Insights and performance metrics for your organization</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-white/20">Projects</TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white/20">Tasks</TabsTrigger>
            <TabsTrigger value="departments" className="data-[state=active]:bg-white/20">Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-indigo-200">Total Users</CardDescription>
                  <CardTitle className="text-3xl text-white">{overview.totalUsers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-green-400 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Active
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-indigo-200">Total Projects</CardDescription>
                  <CardTitle className="text-3xl text-white">{overview.totalProjects}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-400 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    In Progress
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-indigo-200">Total Tasks</CardDescription>
                  <CardTitle className="text-3xl text-white">{overview.totalTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-yellow-400 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Assigned
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-indigo-200">Completed Tasks</CardDescription>
                  <CardTitle className="text-3xl text-white">{overview.completedTasks}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-green-400 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Done
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardDescription className="text-indigo-200">Completion Rate</CardDescription>
                  <CardTitle className="text-3xl text-white">{overview.completionRate}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-purple-400 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Efficiency
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Task Status Distribution</CardTitle>
                  <CardDescription className="text-indigo-200">Current status of all tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {taskStatusData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Department Overview</CardTitle>
                  <CardDescription className="text-indigo-200">Users and projects by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                      <YAxis stroke="rgba(255,255,255,0.6)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="users" fill="#10b981" name="Users" />
                      <Bar dataKey="projects" fill="#3b82f6" name="Projects" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Project Progress</CardTitle>
                <CardDescription className="text-indigo-200">Completion percentage by project</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={projectProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="progress" fill="#8b5cf6" name="Progress %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Task Status Breakdown</CardTitle>
                  <CardDescription className="text-indigo-200">Detailed task status analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {taskStatusData.map((stat: any, index: number) => (
                      <div key={stat.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-white capitalize">{stat.name}</span>
                        </div>
                        <span className="text-indigo-200 font-medium">{stat.value} tasks</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Task Metrics</CardTitle>
                  <CardDescription className="text-indigo-200">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-indigo-200">Completion Rate</span>
                        <span className="text-white">{overview.completionRate}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${overview.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{overview.completedTasks}</div>
                        <div className="text-sm text-indigo-200">Completed</div>
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{overview.totalTasks - overview.completedTasks}</div>
                        <div className="text-sm text-indigo-200">Remaining</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department: any) => (
                <Card key={department.id} className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">{department.name}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      Department overview and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200">Team Members</span>
                        <span className="text-white font-medium">{department._count.users}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-200">Active Projects</span>
                        <span className="text-white font-medium">{department._count.projects}</span>
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="text-sm text-indigo-200">
                          {department.description || 'No description available'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
