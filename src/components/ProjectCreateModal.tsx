'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: () => void
}

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreated }: ProjectCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
    departmentId: '',
    budget: '',
    startDate: '',
    endDate: ''
  })
  const [managers, setManagers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/projects/data')
      if (response.ok) {
        const data = await response.json()
        setManagers(data.managers)
        setDepartments(data.departments)
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
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onProjectCreated()
        onClose()
        setFormData({
          name: '',
          description: '',
          managerId: '',
          departmentId: '',
          budget: '',
          startDate: '',
          endDate: ''
        })
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  <Card className="w-full max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 dark:text-white text-xl">Create New Project</CardTitle>
              <CardDescription className="text-gray-600 dark:text-blue-200">
                Start a new project and assign a manager
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {dataLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-blue-300">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-700 dark:text-blue-200 text-sm font-medium block mb-1">
                  Project Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-blue-300"
                  required
                />
              </div>

              <div>
                <label className="text-blue-200 text-sm font-medium block mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-blue-300 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium block mb-1">
                    Project Manager *
                  </label>
                  <Select
                    value={formData.managerId}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, managerId: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name} ({manager.role?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-blue-200 text-sm font-medium block mb-1">
                    Department *
                  </label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, departmentId: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name} ({department._count.users} members)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-blue-200 text-sm font-medium block mb-1">
                  Budget (Optional)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="Enter budget amount"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-blue-200 text-sm font-medium block mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="text-blue-200 text-sm font-medium block mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  disabled={loading || !formData.name || !formData.managerId || !formData.departmentId}
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
