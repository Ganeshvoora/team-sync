'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProjectCreateModal from "./ProjectCreateModal"
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    case 'PLANNING': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'ON_HOLD': return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    case 'COMPLETED': return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    case 'CANCELLED': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }
}

interface ProjectsClientProps {
  currentUser: any
  projects: any[]
  canCreateProjects: boolean
}

export default function ProjectsClient({ currentUser, projects, canCreateProjects }: ProjectsClientProps) {
  const [selectedProject, setSelectedProject] = useState(projects[0] || null)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Filter projects based on current filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Calculate project statistics
  const getProjectStats = (project: any) => {
    const totalTasks = project.tasks?.length || 0
    const completedTasks = project.tasks?.filter((task: any) => task.status === 'COMPLETED').length || 0
    const inProgressTasks = project.tasks?.filter((task: any) => task.status === 'IN_PROGRESS').length || 0
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      total: totalTasks,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: totalTasks - completedTasks - inProgressTasks,
      progress
    }
  }

  const handleProjectCreated = () => {
    window.location.reload() // Refresh to show new project
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Project Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Track and manage all your projects in one place</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </Button>
            
            {canCreateProjects && (
              <Button 
                className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white"
                onClick={() => setShowCreateForm(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Project
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PLANNING">Planning</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <div className="col-span-2 text-gray-600 dark:text-gray-300 flex items-center">
            <span className="text-sm">
              Showing {filteredProjects.length} of {projects.length} projects
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] shadow-sm transition-colors duration-200">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-lg">Projects</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {filteredProjects.length} projects found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {filteredProjects.map((project) => {
                  const stats = getProjectStats(project)
                  return (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedProject?.id === project.id
                          ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{project.name}</h3>
                        <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2">
                        {project.description || 'No description provided'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="text-gray-900 dark:text-white">{stats.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Manager</span>
                          <span className="text-gray-900 dark:text-white">{project.manager?.name}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredProjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>No projects found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] shadow-sm transition-colors duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-xl">{selectedProject.name}</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                        Managed by {selectedProject.manager?.name} • {selectedProject.department?.name}
                      </CardDescription>
                    </div>
                    
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <TabsTrigger 
                        value="overview" 
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tasks" 
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300"
                      >
                        Tasks
                      </TabsTrigger>
                      <TabsTrigger 
                        value="team" 
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300"
                      >
                        Team
                      </TabsTrigger>
                      <TabsTrigger 
                        value="timeline" 
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-300"
                      >
                        Timeline
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                      <div>
                        <label className="text-gray-500 dark:text-gray-400 text-sm font-medium">Description</label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {selectedProject.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-gray-500 dark:text-gray-400 text-sm">Start Date</label>
                            <div className="text-gray-900 dark:text-white font-medium">
                              {selectedProject.startDate ? new Date(selectedProject.startDate).toLocaleDateString() : 'Not set'}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-500 dark:text-gray-400 text-sm">End Date</label>
                            <div className="text-gray-900 dark:text-white font-medium">
                              {selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString() : 'Not set'}
                            </div>
                          </div>
                          <div>
                            <label className="text-gray-500 dark:text-gray-400 text-sm">Budget</label>
                            <div className="text-gray-900 dark:text-white font-medium">
                              {selectedProject.budget ? `$${Number(selectedProject.budget).toLocaleString()}` : 'Not set'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {(() => {
                            const stats = getProjectStats(selectedProject)
                            return (
                              <>
                                <div>
                                  <label className="text-gray-500 dark:text-gray-400 text-sm">Progress</label>
                                  <div className="mt-1">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="text-gray-900 dark:text-white">{stats.progress}% Complete</span>
                                      <span className="text-gray-600 dark:text-gray-300">{stats.completed}/{stats.total} tasks</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                                      <div 
                                        className="bg-indigo-500 dark:bg-indigo-400 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${stats.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-gray-500 dark:text-gray-400 text-sm">Task Breakdown</label>
                                  <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded text-center">
                                      <div className="text-emerald-700 dark:text-emerald-400 text-lg font-bold">{stats.completed}</div>
                                      <div className="text-emerald-600 dark:text-emerald-500 text-xs">Completed</div>
                                    </div>
                                    <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded text-center">
                                      <div className="text-amber-700 dark:text-amber-400 text-lg font-bold">{stats.inProgress}</div>
                                      <div className="text-amber-600 dark:text-amber-500 text-xs">In Progress</div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-4">
                      <div className="space-y-3">
                        {selectedProject.tasks?.length > 0 ? (
                          selectedProject.tasks.map((task: any) => (
                            <div key={task.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-gray-900 dark:text-white font-medium">{task.title}</h4>
                                <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                  {task.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                {task.description || 'No description'}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Assigned to: {task.assignee?.name || 'Unassigned'}
                                </span>
                                {task.dueDate && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>No tasks assigned to this project</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p>Team management feature coming soon</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4">
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Project timeline feature coming soon</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] shadow-sm transition-colors duration-200">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Select a Project</h3>
                    <p>Choose a project from the list to view its details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <ProjectCreateModal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </div>
  )
}
