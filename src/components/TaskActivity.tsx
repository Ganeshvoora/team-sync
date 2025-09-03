'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  id: string
  action: string
  description: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    profilePictureUrl?: string
  }
}

interface TaskActivityProps {
  taskId: string
}

export default function TaskActivity({ taskId }: TaskActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [taskId])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/activities`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )
      case 'STATUS_CHANGED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'COMMENT_ADDED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'ASSIGNED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      case 'COMPLETED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATED': return 'bg-blue-500/20 text-blue-300'
      case 'STATUS_CHANGED': return 'bg-yellow-500/20 text-yellow-300'
      case 'COMMENT_ADDED': return 'bg-purple-500/20 text-purple-300'
      case 'ASSIGNED': return 'bg-green-500/20 text-green-300'
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-green-300">
          <svg className="w-12 h-12 mx-auto mb-4 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No activity yet</p>
          <p className="text-sm text-green-400">Activity will appear as the task progresses</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <Card key={activity.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.action)}`}>
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={activity.user.profilePictureUrl} />
                        <AvatarFallback className="bg-green-600 text-white text-xs">
                          {getInitials(activity.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium text-sm">
                        {activity.user.name}
                      </span>
                      <span className="text-green-400 text-xs">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-green-100 text-sm leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
                
                {/* Timeline connector */}
                {index < activities.length - 1 && (
                  <div className="absolute left-[2.25rem] mt-2 w-px h-6 bg-white/10"></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
