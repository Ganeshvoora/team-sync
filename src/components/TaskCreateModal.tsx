'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
  teamMembers: any[]
  currentUser: any
}

export default function TaskCreateModal({ isOpen, onClose, onTaskCreated, teamMembers, currentUser }: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: currentUser.id, // Default to self-assignment
    priority: 'MEDIUM',
    dueDate: '',
    projectId: ''
  })
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/tasks/data')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onTaskCreated()
        onClose()
        setFormData({
          title: '',
          description: '',
          assigneeId: currentUser.id, // Reset to self-assignment
          priority: 'MEDIUM',
          dueDate: '',
          projectId: ''
        })
      }
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">
                {formData.assigneeId === currentUser.id ? 'Create Self-Assigned Task' : 'Create New Task'}
              </CardTitle>
              <CardDescription className="text-green-200">
                {formData.assigneeId === currentUser.id 
                  ? 'Create a task for yourself to track your work'
                  : 'Assign a new task to a team member'
                }
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {dataLoading ? (
            <div className="text-center py-8 text-green-300">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-green-200 text-sm font-medium block mb-1">
                  Task Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  className="bg-white/10 border-white/20 text-white placeholder-green-300"
                  required
                />
              </div>

              <div>
                <label className="text-green-200 text-sm font-medium block mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  className="bg-white/10 border-white/20 text-white placeholder-green-300 min-h-[80px]"
                />
              </div>

              <div>
                <label className="text-green-200 text-sm font-medium block mb-1">
                  Assign To *
                </label>
                <Select
                  value={formData.assigneeId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assigneeId: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key={currentUser.id} value={currentUser.id}>
                      🙋‍♂️ {currentUser.name} (Me) - Self Assignment
                    </SelectItem>
                    {teamMembers.filter(user => user.id !== currentUser.id).map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        👤 {user.name} ({user.role?.name}) 
                        {user.department?.name && ` - ${user.department.name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-green-200 text-sm font-medium block mb-1">
                  Priority
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-green-200 text-sm font-medium block mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div>
                <label className="text-green-200 text-sm font-medium block mb-1">
                  Project (Optional)
                </label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white"
                  disabled={loading || !formData.title}
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
