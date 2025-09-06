'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BulkOperationsProps {
  tasks: any[]
  selectedTasks: string[]
  onTaskSelect: (taskId: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkOperationComplete: () => void
}

export default function BulkOperations({ 
  tasks, 
  selectedTasks, 
  onTaskSelect, 
  onSelectAll, 
  onClearSelection,
  onBulkOperationComplete 
}: BulkOperationsProps) {
  const [operation, setOperation] = useState('')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const handleBulkOperation = async () => {
    if (selectedTasks.length === 0 || !operation) return

    setLoading(true)
    try {
      let requestData: any = { taskIds: selectedTasks, action: operation }

      switch (operation) {
        case 'status':
          requestData.data = { status: value }
          break
        case 'priority':
          requestData.data = { priority: value }
          break
        case 'assignee':
          requestData.data = { assigneeId: value }
          break
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedTasks.length} tasks? This action cannot be undone.`)) {
            setLoading(false)
            return
          }
          break
      }

      const response = await fetch('/api/tasks/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        onBulkOperationComplete()
        onClearSelection()
        setOperation('')
        setValue('')
      } else {
        const error = await response.json()
        console.error('Bulk operation failed:', error.error)
        alert('Operation failed: ' + error.error)
      }
    } catch (error) {
      console.error('Error performing bulk operation:', error)
      alert('An error occurred while performing the operation')
    } finally {
      setLoading(false)
    }
  }

  const getUsers = () => {
    const users = new Map()
    tasks.forEach(task => {
      if (task.assignee && !users.has(task.assignee.id)) {
        users.set(task.assignee.id, task.assignee)
      }
      if (task.assigner && !users.has(task.assigner.id)) {
        users.set(task.assigner.id, task.assigner)
      }
    })
    return Array.from(users.values())
  }

  if (selectedTasks.length === 0) {
    return (
  <Card className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 mb-6">
        <CardContent className="p-6">
          <div className="text-center text-gray-700 dark:text-green-300">
            <svg className="w-12 h-12 mx-auto mb-4 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Bulk Operations</p>
            <p className="text-sm text-gray-600 dark:text-green-200">Select tasks to perform bulk operations</p>
            <Button
              onClick={onSelectAll}
              variant="outline"
              className="mt-4 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20"
            >
              Select All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
  <Card className="bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 mb-6">
      <CardHeader>
  <CardTitle className="text-gray-900 dark:text-white">Bulk Operations</CardTitle>
  <CardDescription className="text-gray-600 dark:text-green-200">
          {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onClearSelection}
            variant="outline"
            size="sm"
            className="border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20"
          >
            Clear Selection
          </Button>
          <Button
            onClick={onSelectAll}
            variant="outline"
            size="sm"
            className="border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20"
          >
            Select All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger className="bg-white border border-gray-200 dark:bg-white/10 dark:border-white/20 text-gray-900 dark:text-white">
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Change Status</SelectItem>
              <SelectItem value="priority">Change Priority</SelectItem>
              <SelectItem value="assignee">Reassign</SelectItem>
              <SelectItem value="delete">Delete Tasks</SelectItem>
            </SelectContent>
          </Select>

          {operation && operation !== 'delete' && (
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger className="bg-white border border-gray-200 dark:bg-white/10 dark:border-white/20 text-gray-900 dark:text-white">
                <SelectValue placeholder={`Select ${operation}`} />
              </SelectTrigger>
              <SelectContent>
                {operation === 'status' && (
                  <>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </>
                )}
                {operation === 'priority' && (
                  <>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </>
                )}
                {operation === 'assignee' && 
                  getUsers().map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={handleBulkOperation}
            disabled={loading || !operation || (operation !== 'delete' && !value)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-md"
          >
            {loading ? 'Processing...' : 'Apply'}
          </Button>
        </div>

        {/* Selected tasks preview */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-4">
          <p className="text-sm text-gray-600 dark:text-green-200 mb-2">Selected Tasks:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {selectedTasks.slice(0, 5).map(taskId => {
              const task = tasks.find(t => t.id === taskId)
              return task ? (
                <div key={taskId} className="text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-white/5 p-2 rounded">
                  {task.title}
                </div>
              ) : null
            })}
            {selectedTasks.length > 5 && (
              <div className="text-xs text-green-700 dark:text-green-400">
                ...and {selectedTasks.length - 5} more tasks
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
