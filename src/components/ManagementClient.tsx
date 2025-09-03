'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface User {
  id: string
  name: string
  email: string
  role: {
    name: string
  } | null
  tasksAssignedToMe?: any[]
}

interface Role {
  id: string
  name: string
  level: number
}

interface Invitation {
  id: string
  email: string
  status: string
  role: {
    name: string
  } | null
  createdAt: Date
}

interface ManagementClientProps {
  currentUser: User
  directReports: User[]
  roles: Role[]
  pendingInvitations: Invitation[]
  downstreamUserIds: string[]
}

export default function ManagementClient({ 
  currentUser, 
  directReports, 
  roles, 
  pendingInvitations: initialInvitations,
  downstreamUserIds 
}: ManagementClientProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState(initialInvitations)
  const [message, setMessage] = useState('')

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteEmail || !selectedRole) {
      setMessage('Please fill in all fields')
      return
    }

    setIsInviting(true)

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          roleId: selectedRole,
          managerId: currentUser.id // They will report to current user
        })
      })

      if (response.ok) {
        const newInvitation = await response.json()
        setPendingInvitations(prev => [newInvitation, ...prev])
        setInviteEmail('')
        setSelectedRole('')
        setMessage('Invitation sent successfully!')
      } else {
        const error = await response.json()
        setMessage(error.message || 'Failed to send invitation')
      }
    } catch (error) {
      setMessage('Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId))
        setMessage('Invitation cancelled')
      } else {
        setMessage('Failed to cancel invitation')
      }
    } catch (error) {
      setMessage('Failed to cancel invitation')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Team Management
              </h1>
              <p className="text-gray-600 mt-1">Manage your team members and invite new colleagues</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="team" className="space-y-6">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="team">My Team ({directReports.length})</TabsTrigger>
              <TabsTrigger value="invite">Invite Team Member</TabsTrigger>
              <TabsTrigger value="pending">Pending Invitations ({pendingInvitations.length})</TabsTrigger>
            </TabsList>

            {/* Team Overview Tab */}
            <TabsContent value="team" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Direct Reports</CardTitle>
                  <CardDescription>Team members who report directly to you</CardDescription>
                </CardHeader>
                <CardContent>
                  {directReports.length > 0 ? (
                    <div className="grid gap-4">
                      {directReports.map((report) => (
                        <div key={report.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {report.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{report.name}</h3>
                                <p className="text-sm text-gray-500">{report.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {report.role?.name || 'No Role'}
                              </Badge>
                              <Badge variant="outline" className="border-orange-200 text-orange-700">
                                {report.tasksAssignedToMe?.length || 0} tasks
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">No direct reports yet</p>
                      <p>Invite team members to build your team</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invite Tab */}
            <TabsContent value="invite" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Invite Team Member</CardTitle>
                  <CardDescription>Send an invitation to a new team member to join your organization</CardDescription>
                </CardHeader>
                <CardContent>
                  {message && (
                    <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {message}
                    </div>
                  )}
                  <form onSubmit={handleInviteUser} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@company.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">Invitation Details:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>The invited user will report directly to you</li>
                            <li>They will receive a magic link to join the organization</li>
                            <li>The invitation will expire in 7 days</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isInviting}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isInviting ? 'Sending Invitation...' : 'Send Invitation'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pending Invitations Tab */}
            <TabsContent value="pending" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Pending Invitations</CardTitle>
                  <CardDescription>Invitations you have sent that are waiting for acceptance</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingInvitations.length > 0 ? (
                    <div className="space-y-4">
                      {pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900">{invitation.email}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="border-purple-200 text-purple-700">
                                  {invitation.role?.name || 'No Role'}
                                </Badge>
                                <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                                  {invitation.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                Sent on {new Date(invitation.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">No pending invitations</p>
                      <p>All your invitations have been accepted or expired</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
