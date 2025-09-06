'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    profilePictureUrl?: string
  }
}

interface TaskCommentsProps {
  taskId: string
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track last refresh time to avoid unnecessary API calls
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  
  useEffect(() => {
    fetchComments()
    
    // Set up polling for new comments every 30 seconds
    const intervalId = setInterval(() => {
      const now = new Date();
      // Only refresh if it's been at least 20 seconds
      if ((now.getTime() - lastRefreshTime.getTime()) > 20000) {
        fetchComments()
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
        setLastRefreshTime(new Date())
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // Optimistically add the comment to the UI first for instant feedback
      const tempId = `temp-${Date.now()}`
      const optimisticComment = {
        id: tempId,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        user: {
          id: 'current-user', // Will be replaced with actual user data
          name: 'You', // Placeholder until server responds
          email: '',
          profilePictureUrl: undefined
        }
      }
      
      // Add to the UI immediately
      setComments(prev => [optimisticComment, ...prev])
      
      // Clear the input
      setNewComment('')
      
      // Now send to the server
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: optimisticComment.content
        })
      })

      if (response.ok) {
        // Replace the optimistic comment with the real one from server
        const data = await response.json()
        setComments(prev => 
          prev.map(comment => comment.id === tempId ? data.comment : comment)
        )
      } else {
        // Remove the optimistic comment if request failed
        setComments(prev => prev.filter(comment => comment.id !== tempId))
        console.error('Failed to post comment')
        alert('Failed to post comment. Please try again.')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading comments...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={!newComment.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>in all tasks components changing the bg coclor to white in likht theme is not enough colors need to  visible clearly in the light thheme easily viewabale
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-2">
              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                  {getUserInitials(comment.user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {comment.user.name}
                    </span>
                    <span className="text-gray-600 dark:text-green-400 text-xs">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-green-600 text-sm whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
