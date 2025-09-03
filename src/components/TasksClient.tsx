'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TaskCreateModal from "./TaskCreateModal"
import TaskComments from "./TaskComments"
import TaskActivity from "./TaskActivity"
import TaskStats from "./TaskStats"
import BulkOperations from "./BulkOperations"

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'IN_PROGRESS': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'NOT_STARTED': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'ON_HOLD': return 'bg-red-500/20 text-red-300 border-red-500/30'
    case 'CANCELLED': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'bg-red-500/20 text-red-300 border-red-500/30'
    case 'HIGH': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'LOW': return 'bg-green-500/20 text-green-300 border-green-500/30'
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

interface TasksClientProps {
  currentUser: any
  tasks: any[]
  canCreateTasks: boolean
  teamMembers: any[]
}

export default function TasksClient({ currentUser, tasks: initialTasks, canCreateTasks, teamMembers }: TasksClientProps) {
  // Keep a local copy of tasks that we can update
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTask, setSelectedTask] = useState(initialTasks[0] || null)
  const [activeTab, setActiveTab] = useState('details')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [filterAssignee, setFilterAssignee] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [bulkMode, setBulkMode] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Optimize refreshes by preventing unnecessary API calls
  const refreshTasks = async () => {
    // Don't refresh if we're already refreshing
    if (isRefreshing) return;
    
    // Only refresh if it's been at least 10 seconds since the last refresh
    const now = new Date();
    if ((now.getTime() - lastRefreshTime.getTime()) < 10000) return;
    
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const newTasks = await response.json();
        setTasks(newTasks);
        setLastRefreshTime(now);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      setIsRefreshing(false);
    }
  }

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority
    const matchesAssignee = filterAssignee === 'ALL' || 
                           (filterAssignee === 'ME' && task.assigneeId === currentUser.id) ||
                           (filterAssignee === 'OTHERS' && task.assigneeId !== currentUser.id)
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/tasks/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      })
      
      if (response.ok) {
        // Get the updated task from the server response
        const updatedTask = await response.json();
        
        // Create a new array with the updated task
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        );
        
        // Update the tasks array in state
        setTasks(updatedTasks);
        
        // Update the selected task if applicable
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleTaskCreated = () => {
    window.location.reload() // Refresh to show new task
  }

  const handleQuickSelfAssign = () => {
    setShowCreateForm(true)
    // The form will already default to self-assignment
  }

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleSelectAll = () => {
    setSelectedTasks(filteredTasks.map(task => task.id))
  }

  const handleClearSelection = () => {
    setSelectedTasks([])
    setBulkMode(false)
  }

  const handleBulkOperationComplete = () => {
    window.location.reload() // Refresh to show updated tasks
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-green-200">Organize, track, and complete your work efficiently</p>
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </Button>
            
            <Button 
              variant="outline" 
              className={`border-white/20 text-white hover:bg-white/10 ${bulkMode ? 'bg-white/20' : ''}`}
              onClick={() => {
                setBulkMode(!bulkMode)
                if (bulkMode) {
                  setSelectedTasks([])
                }
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {bulkMode ? 'Exit Bulk' : 'Bulk Edit'}
            </Button>

            {canCreateTasks && (
              <>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={handleQuickSelfAssign}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Self-Assign Task
                </Button>
                
                <Button 
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                  onClick={() => setShowCreateForm(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Assign to Team
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder-green-300"
          />
          
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tasks</SelectItem>
              <SelectItem value="ME">My Tasks</SelectItem>
              <SelectItem value="OTHERS">Team Tasks</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="NOT_STARTED">Not Started</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="ON_HOLD">On Hold</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-white/80 flex items-center">
            <span className="text-sm">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
        </div>

        {/* Task Statistics Dashboard */}
        <TaskStats tasks={tasks} currentUser={currentUser} />

        {/* Bulk Operations */}
        {bulkMode && (
          <BulkOperations
            tasks={tasks}
            selectedTasks={selectedTasks}
            onTaskSelect={handleTaskSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onBulkOperationComplete={handleBulkOperationComplete}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="text-white text-lg">Tasks</CardTitle>
                <CardDescription className="text-green-200">
                  {filteredTasks.length} tasks found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                      selectedTask?.id === task.id
                        ? 'bg-white/10 border-green-500/50'
                        : selectedTasks.includes(task.id)
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-2 flex-1">
                        {bulkMode && (
                          <input
                            type="checkbox"
                            checked={selectedTasks.includes(task.id)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleTaskSelect(task.id)
                            }}
                            className="mt-1 w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                          />
                        )}
                        <div 
                          className="flex-1"
                          onClick={() => !bulkMode && setSelectedTask(task)}
                        >
                          <h3 className="font-medium text-white text-sm">{task.title}</h3>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-green-200 text-xs mb-3 line-clamp-2">
                      {task.description || 'No description provided'}
                    </p>
                    
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => !bulkMode && setSelectedTask(task)}
                    >
                      <Badge className={`text-xs ${getPriorityColor(task.priority || 'MEDIUM')}`}>
                        {task.priority || 'Medium'}
                      </Badge>
                      
                      <span className="text-green-300 text-xs">
                        {task.assignee?.name || 'Unassigned'}
                        {task.assigneeId === currentUser.id && ' (Me)'}
                      </span>
                    </div>

                    {task.dueDate && (
                      <div 
                        className="mt-2 text-xs text-green-300"
                        onClick={() => !bulkMode && setSelectedTask(task)}
                      >
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-green-300">
                    <svg className="w-16 h-16 mx-auto mb-4 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p>No tasks found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Details */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-[calc(100vh-200px)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-xl">{selectedTask.title}</CardTitle>
                      <CardDescription className="text-green-200 mt-1">
                        Task Details and Management
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedTask.status)}>
                        {selectedTask.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(selectedTask.priority || 'MEDIUM')}>
                        {selectedTask.priority || 'Medium'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-white/10 border-white/20">
                      <TabsTrigger value="details" className="data-[state=active]:bg-white/20">Details</TabsTrigger>
                      <TabsTrigger value="comments" className="data-[state=active]:bg-white/20">Comments</TabsTrigger>
                      <TabsTrigger value="activity" className="data-[state=active]:bg-white/20">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                      <div>
                        <label className="text-green-200 text-sm font-medium">Description</label>
                        <p className="text-white mt-1">
                          {selectedTask.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-green-200 text-sm">Assigned To</label>
                            <div className="text-white font-medium">{selectedTask.assignee?.name || 'Unassigned'}</div>
                          </div>
                          <div>
                            <label className="text-green-200 text-sm">Assigned By</label>
                            <div className="text-white font-medium">{selectedTask.assigner?.name || 'Unknown'}</div>
                          </div>
                          {selectedTask.dueDate && (
                            <div>
                              <label className="text-green-200 text-sm">Due Date</label>
                              <div className="text-white font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-green-200 text-sm">Status</label>
                            <Select 
                              value={selectedTask.status} 
                              onValueChange={(value: string) => updateTaskStatus(selectedTask.id, value)}
                            >
                              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-green-200 text-sm">Created</label>
                            <div className="text-white font-medium">{new Date(selectedTask.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <label className="text-green-200 text-sm">Last Updated</label>
                            <div className="text-white font-medium">{new Date(selectedTask.updatedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="comments" className="space-y-4">
                      <TaskComments taskId={selectedTask.id} />
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <TaskActivity taskId={selectedTask.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-[calc(100vh-200px)]">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-green-300">
                    <svg className="w-20 h-20 mx-auto mb-4 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">Select a Task</h3>
                    <p>Choose a task from the list to view its details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        <TaskCreateModal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onTaskCreated={handleTaskCreated}
          teamMembers={teamMembers}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}
