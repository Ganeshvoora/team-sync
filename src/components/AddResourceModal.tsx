'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AddResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onResourceAdded: () => void
  projectId: string
}

export default function AddResourceModal({ isOpen, onClose, onResourceAdded, projectId }: AddResourceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    url: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/projects/resources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, projectId })
      })

      if (response.ok) {
        onResourceAdded()
        onClose()
        setFormData({
          title: '',
          url: ''
        })
      }
    } catch (error) {
      console.error('Error adding resource:', error)
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
              <CardTitle className="text-gray-900 dark:text-white text-xl">Add New Resource</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Add a new resource link to the project
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-700 dark:text-gray-200 text-sm font-medium block mb-1">
                Resource Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter resource title"
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                required
              />
            </div>

            <div>
              <label className="text-gray-700 dark:text-gray-200 text-sm font-medium block mb-1">
                Resource URL *
              </label>
              <Input
                value={formData.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Enter resource URL"
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading || !formData.title || !formData.url}
              >
                {loading ? 'Adding...' : 'Add Resource'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
