'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, ClipboardList } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Notification {
  id: string
  title: string
  message: string
  type: 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'COMMENT_ADDED' | 'DEADLINE_APPROACHING' | 'SYSTEM'
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId?: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationId,
          markAsRead: true
        })
      })

      if (response.ok) {
        if (notificationId) {
          // Mark specific notification as read
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === notificationId 
                ? { ...notif, isRead: true }
                : notif
            )
          )
        } else {
          // Mark all as read
          setNotifications(prev => 
            prev.map(notif => ({ ...notif, isRead: true }))
          )
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <ClipboardList className="w-4 h-4 text-blue-400" />
      case 'TASK_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'DEADLINE_APPROACHING':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'SYSTEM':
        return <Info className="w-4 h-4 text-purple-400" />
      default:
        return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'border-l-blue-400'
      case 'TASK_COMPLETED':
        return 'border-l-green-400'
      case 'DEADLINE_APPROACHING':
        return 'border-l-yellow-400'
      case 'SYSTEM':
        return 'border-l-purple-400'
      default:
        return 'border-l-gray-400'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notifications
            </span>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsRead()}
                disabled={loading}
                className="text-xs"
              >
                Mark All Read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 ${getNotificationColor(notification.type)} ${
                  notification.isRead 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                } hover:bg-gray-100 transition-colors cursor-pointer`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium ${
                        notification.isRead ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      notification.isRead ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
