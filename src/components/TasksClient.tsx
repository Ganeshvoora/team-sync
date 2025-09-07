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
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    case 'IN_PROGRESS': return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    case 'NOT_STARTED': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'ON_HOLD': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'CANCELLED': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'HIGH': return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    case 'MEDIUM': return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    case 'LOW': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
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

  // Get list of direct report IDs
  const directReportIds = teamMembers
    .filter(member => member.managerId === currentUser.id)
    .map(member => member.id);
    
  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority
    
    // Enhanced assignee filtering
    let matchesAssignee = false;
    if (filterAssignee === 'ALL') {
      matchesAssignee = true;
    } else if (filterAssignee === 'ME') {
      matchesAssignee = task.assigneeId === currentUser.id;
    } else if (filterAssignee === 'DIRECT_REPORTS') {
      matchesAssignee = directReportIds.includes(task.assigneeId);
    } else if (filterAssignee === 'OTHERS') {
      matchesAssignee = task.assigneeId !== currentUser.id && !directReportIds.includes(task.assigneeId);
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Check if the selected task is overdue
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate && taskToUpdate.dueDate) {
      const dueDate = new Date(taskToUpdate.dueDate);
      const today = new Date();
      
      // Set both dates to midnight for accurate day comparison
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        // Task is overdue
        alert("This task is overdue. Status updates are not allowed, but you can still add comments.");
        return;
      }
    }
    
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
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update task status");
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert("An error occurred while updating the task status");
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
  <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Task Management</h1>
            <p className="text-gray-700 dark:text-gray-300">Organize, track, and complete your work efficiently</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-gray-800 dark:text-gray-200">Filter</span>
            </Button>
            
            <Button 
              variant="outline" 
              className={`border-gray-400 dark:border-gray-400 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${bulkMode ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
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
                    className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white dark:text-white"
                  onClick={handleQuickSelfAssign}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Self-Assign Task
                </Button>
                
                <Button 
                    className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white dark:text-white"
                  onClick={() => setShowCreateForm(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {teamMembers.filter(member => member.id !== currentUser.id).length > 0 
                    ? 'Assign to Team' 
                    : 'Create New Task'}
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
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-green-300"
          />
          
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="Filter by assignee" className="text-gray-800 dark:text-gray-200" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tasks</SelectItem>
              <SelectItem value="ME">My Tasks</SelectItem>
              <SelectItem value="DIRECT_REPORTS">My Direct Reports</SelectItem>
              <SelectItem value="OTHERS">Other Team Tasks</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="Filter by status" className="text-gray-800 dark:text-gray-200" />
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
            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
              <SelectValue placeholder="Filter by priority" className="text-gray-800 dark:text-gray-200" />
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
            <span className="text-sm text-gray-700 dark:text-green-200">
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
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl transition-colors duration-200 h-[calc(100vh-200px)]">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white text-lg">Tasks</CardTitle>
                <CardDescription className="text-gray-700 dark:text-gray-400">
                  {filteredTasks.length} tasks found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedTask?.id === task.id
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400'
                        : selectedTasks.includes(task.id)
                        ? 'bg-blue-100 border-blue-500/50 dark:bg-blue-900/20'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
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
                            className="mt-1 w-4 h-4 text-green-600 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded focus:ring-green-500"
                          />
                        )}
                        <div 
                          className="flex-1"
                          onClick={() => !bulkMode && setSelectedTask(task)}
                        >
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{task.title}</h3>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-green-200 text-xs mb-3 line-clamp-2">
                      <span className="text-gray-700 dark:text-green-200">{task.description || 'No description provided'}</span>
                    </p>
                    
                    <div 
                      className="flex items-center justify-between"
                      onClick={() => !bulkMode && setSelectedTask(task)}
                    >
                      <Badge className={`text-xs ${getPriorityColor(task.priority || 'MEDIUM')}`}>
                        {task.priority || 'Medium'}
                      </Badge>
                      
                      <span className="text-gray-600 dark:text-green-300 text-xs">
                        <span className="text-gray-800 dark:text-green-300">{task.assignee?.name || 'Unassigned'}{task.assigneeId === currentUser.id && ' (Me)'}</span>
                      </span>
                    </div>

                    {task.dueDate && (
                      <div 
                        className={`mt-2 text-xs ${
                          new Date(task.dueDate) < new Date() 
                            ? "text-red-500 font-semibold flex items-center"
                            : "text-green-700 dark:text-green-300"
                        }`}
                        onClick={() => !bulkMode && setSelectedTask(task)}
                      >
                        {new Date(task.dueDate) < new Date() && (
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        Due: {new Date(task.dueDate).toLocaleDateString()} 
                        {new Date(task.dueDate) < new Date() && " (Overdue)"}
                      </div>
                    )}
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-green-300">
                    <svg className="w-16 h-16 mx-auto mb-4 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-700 dark:text-green-300">No tasks found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Details */}
          <div className="lg:col-span-2">
            {selectedTask ? (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl transition-colors duration-200 h-[calc(100vh-200px)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white text-xl font-bold">{selectedTask.title}</CardTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-400 mt-1">
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
                    <TabsList className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <TabsTrigger value="details" className="data-[state=active]:bg-gray-200 dark:bg-gray-700">Details</TabsTrigger>
                      <TabsTrigger value="comments" className="data-[state=active]:bg-gray-200 dark:bg-gray-700">Comments</TabsTrigger>
                      <TabsTrigger value="activity" className="data-[state=active]:bg-gray-200 dark:bg-gray-700">Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                      <div>
                        <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Description</label>
                        <p className="text-gray-900 dark:text-white mt-1">
                          <span className="text-gray-800 dark:text-white">{selectedTask.description || 'No description provided'}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Assigned To</label>
                            <div className="text-gray-800 dark:text-white font-semibold">{selectedTask.assignee?.name || 'Unassigned'}</div>
                          </div>
                          <div>
                            <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Assigned By</label>
                            <div className="text-gray-800 dark:text-white font-semibold">{selectedTask.assigner?.name || 'Unknown'}</div>
                          </div>
                          {selectedTask.dueDate && (
                            <div>
                              <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Due Date</label>
                              <div className="text-gray-800 dark:text-white font-semibold">{new Date(selectedTask.dueDate).toLocaleDateString()}</div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Status</label>
                            {selectedTask.dueDate && new Date(selectedTask.dueDate) < new Date() ? (
                              <div>
                                <Select 
                                  value={selectedTask.status} 
                                  disabled={true}
                                >
                                  <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-white mt-1 cursor-not-allowed opacity-60">
                                    <SelectValue className="text-gray-800 dark:text-white" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={selectedTask.status}>{selectedTask.status.replace('_', ' ')}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="text-red-400 text-xs mt-1 flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-red-500 font-semibold">Overdue tasks cannot be updated</span>
                                </div>
                              </div>
                            ) : (
                              <Select 
                                value={selectedTask.status} 
                                onValueChange={(value: string) => updateTaskStatus(selectedTask.id, value)}
                              >
                                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white mt-1">
                                  <SelectValue className="text-gray-800 dark:text-white" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                  <SelectItem value="COMPLETED">Completed</SelectItem>
                                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div>
                            <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Created</label>
                            <div className="text-gray-800 dark:text-white font-semibold">{new Date(selectedTask.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <label className="text-gray-700 dark:text-green-200 text-sm font-semibold">Last Updated</label>
                            <div className="text-gray-800 dark:text-white font-semibold">{new Date(selectedTask.updatedAt).toLocaleDateString()}</div>
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
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200 h-[calc(100vh-200px)]">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-700 dark:text-gray-400">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Select a Task</h3>
                    <p className="text-gray-700 dark:text-gray-400">Choose a task from the list to view its details</p>
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
