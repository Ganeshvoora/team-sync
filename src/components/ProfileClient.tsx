'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  email: string
  employeeId?: string | null
  profilePictureUrl?: string | null
  contactNumber?: string | null
  skills?: string | null
  bio?: string | null
  location?: string | null
  hireDate?: Date | null
  role: {
    id: string
    name: string
    level: number
  } | null
  department: {
    id: string
    name: string
  } | null
  manager: {
    id: string
    name: string
    role: {
      name: string
    } | null
  } | null
  directReports: any[]
  tasksAssignedToMe: any[]
  tasksAssignedByMe: any[]
}

interface Role {
  id: string
  name: string
  level: number
}

interface Department {
  id: string
  name: string
}

interface ProfileClientProps {
  currentUser: User
}

export function ProfileClient({ currentUser }: ProfileClientProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [managers, setManagers] = useState<User[]>([])
  const [editData, setEditData] = useState({
    name: currentUser.name,
    employeeId: currentUser.employeeId || '',
    contactNumber: currentUser.contactNumber || '',
    skills: currentUser.skills || '',
    bio: currentUser.bio || '',
    location: currentUser.location || '',
    hireDate: currentUser.hireDate ? new Date(currentUser.hireDate).toISOString().split('T')[0] : '',
    roleId: currentUser.role?.id || '',
    departmentId: currentUser.department?.id || '',
    managerId: currentUser.manager?.id || ''
  })

  const isAdmin = currentUser.role?.name === 'Admin'
  
  // Fetch roles, departments, and potential managers for admin editing
  useEffect(() => {
    if (isAdmin && isEditMode) {
      fetchEditingData()
    }
  }, [isAdmin, isEditMode])

  const fetchEditingData = async () => {
    try {
      const [rolesRes, deptRes, usersRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/admin/departments'),
        fetch('/api/users')
      ])

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }

      if (deptRes.ok) {
        const deptData = await deptRes.json()
        setDepartments(deptData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        // Filter potential managers based on role level and exclude self
        const selectedRole = roles.find(r => r.id === editData.roleId)
        const potentialManagers = usersData.filter((user: User) => {
          return user.id !== currentUser.id && 
                 user.role && 
                 selectedRole && 
                 user.role.level < selectedRole.level
        })
        setManagers(potentialManagers)
      }
    } catch (error) {
      console.error('Error fetching editing data:', error)
    }
  }

  const handleRoleChange = (roleId: string) => {
    setEditData(prev => ({ ...prev, roleId, managerId: '' }))
    
    // Update potential managers based on new role
    const selectedRole = roles.find(r => r.id === roleId)
    if (selectedRole) {
      fetchEditingData() // Refresh managers list
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      let response;
      
      if (isAdmin) {
        // Admin users can update all fields including role, department, manager
        response = await fetch(`/api/admin/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...editData,
            hireDate: editData.hireDate ? new Date(editData.hireDate) : null
          })
        })
      } else {
        // Regular users can only update basic profile fields
        response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editData.name,
            contactNumber: editData.contactNumber,
            skills: editData.skills,
            bio: editData.bio,
            location: editData.location
          })
        })
      }

      if (response.ok) {
        window.location.reload() // Refresh to show updated data
      } else {
        const errorData = await response.json()
        console.error('Failed to update profile:', errorData)
        alert(`Failed to update profile: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('An error occurred while updating your profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: currentUser.name,
      employeeId: currentUser.employeeId || '',
      contactNumber: currentUser.contactNumber || '',
      skills: currentUser.skills || '',
      bio: currentUser.bio || '',
      location: currentUser.location || '',
      hireDate: currentUser.hireDate ? new Date(currentUser.hireDate).toISOString().split('T')[0] : '',
      roleId: currentUser.role?.id || '',
      departmentId: currentUser.department?.id || '',
      managerId: currentUser.manager?.id || ''
    })
    setIsEditMode(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {currentUser.name}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {currentUser.role?.name || 'No Role'}
                </Badge>
                {currentUser.department && (
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    {currentUser.department.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({currentUser.tasksAssignedToMe.length})</TabsTrigger>
              {currentUser.directReports.length > 0 && (
                <TabsTrigger value="team">Team ({currentUser.directReports.length})</TabsTrigger>
              )}
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Personal Information</CardTitle>
                      <CardDescription>Your basic profile information</CardDescription>
                    </div>
                    <Button
                      variant={isEditMode ? "destructive" : "outline"}
                      size="sm"
                      onClick={isEditMode ? handleCancel : () => setIsEditMode(true)}
                    >
                      {isEditMode ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm text-gray-600">Email</Label>
                        <p className="font-medium text-gray-900">{currentUser.email}</p>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm text-gray-600">Employee ID</Label>
                        <p className="font-medium text-gray-900">{currentUser.employeeId || 'Not set'}</p>
                      </div>
                      
                      {/* Editable Name */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm text-gray-600">Full Name</Label>
                        {isEditMode ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{currentUser.name}</p>
                        )}
                      </div>
                      
                      {/* Editable Contact Number */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm text-gray-600">Contact Number</Label>
                        {isEditMode ? (
                          <Input
                            value={editData.contactNumber}
                            onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                            className="mt-1"
                            placeholder="Enter your contact number"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{currentUser.contactNumber || 'Not set'}</p>
                        )}
                      </div>
                      
                      {/* Editable Location */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <Label className="text-sm text-gray-600">Location</Label>
                        {isEditMode ? (
                          <Input
                            value={editData.location}
                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                            className="mt-1"
                            placeholder="Enter your location"
                          />
                        ) : (
                          <p className="font-medium text-gray-900">{currentUser.location || 'Not set'}</p>
                        )}
                      </div>
                      
                      {currentUser.hireDate && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Label className="text-sm text-gray-600">Hire Date</Label>
                          <p className="font-medium text-gray-900">
                            {new Date(currentUser.hireDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isEditMode && (
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Organization Details */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Organization Details</CardTitle>
                      <CardDescription>Your role and position in the company</CardDescription>
                    </div>
                    {isAdmin && (
                      <Button
                        variant={isEditMode ? "destructive" : "outline"}
                        size="sm"
                        onClick={isEditMode ? handleCancel : () => setIsEditMode(true)}
                      >
                        {isEditMode ? "Cancel Admin Edit" : "Admin Edit"}
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Role */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <Label className="text-sm text-blue-600">Role</Label>
                        {isEditMode && isAdmin ? (
                          <Select value={editData.roleId} onValueChange={handleRoleChange}>
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name} (Level {role.level})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <>
                            <p className="font-medium text-blue-900">{currentUser.role?.name || 'No Role'}</p>
                            {currentUser.role?.level && (
                              <p className="text-sm text-blue-600">Level {currentUser.role.level}</p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Department */}
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <Label className="text-sm text-purple-600">Department</Label>
                        {isEditMode && isAdmin ? (
                          <Select value={editData.departmentId} onValueChange={(value) => setEditData({ ...editData, departmentId: value })}>
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="font-medium text-purple-900">{currentUser.department?.name || 'No Department'}</p>
                        )}
                      </div>

                      {/* Manager */}
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <Label className="text-sm text-green-600">Reports To</Label>
                        {isEditMode && isAdmin ? (
                          <Select value={editData.managerId} onValueChange={(value) => setEditData({ ...editData, managerId: value })}>
                            <SelectTrigger className="mt-1 bg-white">
                              <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No Manager</SelectItem>
                              {managers.map((manager) => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.name} ({manager.role?.name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <>
                            {currentUser.manager ? (
                              <>
                                <p className="font-medium text-green-900">{currentUser.manager.name}</p>
                                <p className="text-sm text-green-600">{currentUser.manager.role?.name}</p>
                              </>
                            ) : (
                              <p className="font-medium text-green-900">No Manager</p>
                            )}
                          </>
                        )}
                      </div>

                      {/* Employee ID (Admin editable) */}
                      {isAdmin && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <Label className="text-sm text-yellow-600">Employee ID</Label>
                          {isEditMode ? (
                            <Input
                              value={editData.employeeId}
                              onChange={(e) => setEditData({ ...editData, employeeId: e.target.value })}
                              className="mt-1"
                              placeholder="Enter employee ID"
                            />
                          ) : (
                            <p className="font-medium text-yellow-900">{currentUser.employeeId || 'Not set'}</p>
                          )}
                        </div>
                      )}

                      {/* Hire Date (Admin editable) */}
                      {isAdmin && (
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                          <Label className="text-sm text-indigo-600">Hire Date</Label>
                          {isEditMode ? (
                            <Input
                              type="date"
                              value={editData.hireDate}
                              onChange={(e) => setEditData({ ...editData, hireDate: e.target.value })}
                              className="mt-1"
                            />
                          ) : (
                            <p className="font-medium text-indigo-900">
                              {currentUser.hireDate ? new Date(currentUser.hireDate).toLocaleDateString() : 'Not set'}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <Label className="text-sm text-orange-600">Direct Reports</Label>
                        <p className="font-medium text-orange-900">{currentUser.directReports.length} team members</p>
                      </div>
                    </div>

                    {isEditMode && isAdmin && (
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills & Bio */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20 lg:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Professional Profile</CardTitle>
                      <CardDescription>Your skills and professional background</CardDescription>
                    </div>
                    <Button
                      variant={isEditMode ? "destructive" : "outline"}
                      size="sm"
                      onClick={isEditMode ? handleCancel : () => setIsEditMode(true)}
                    >
                      {isEditMode ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm text-gray-600">Skills</Label>
                        <div className="mt-2">
                          {isEditMode ? (
                            <Textarea
                              value={editData.skills}
                              onChange={(e) => setEditData({ ...editData, skills: e.target.value })}
                              className="min-h-[100px]"
                              placeholder="Enter your skills, separated by commas"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                              {currentUser.skills ? (
                                <p className="text-gray-900">{currentUser.skills}</p>
                              ) : (
                                <p className="text-gray-500 italic">No skills listed</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Bio</Label>
                        <div className="mt-2">
                          {isEditMode ? (
                            <Textarea
                              value={editData.bio}
                              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                              className="min-h-[100px]"
                              placeholder="Tell us about yourself"
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                              {currentUser.bio ? (
                                <p className="text-gray-900">{currentUser.bio}</p>
                              ) : (
                                <p className="text-gray-500 italic">No bio available</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isEditMode && (
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Tasks Assigned to Me */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">My Tasks</CardTitle>
                    <CardDescription>Tasks assigned to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentUser.tasksAssignedToMe.length > 0 ? (
                      <div className="space-y-3">
                        {currentUser.tasksAssignedToMe.map((task, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="font-medium text-blue-900">Task {index + 1}</p>
                            <p className="text-sm text-blue-600">Active task</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No active tasks assigned</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tasks Assigned by Me */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Tasks I Assigned</CardTitle>
                    <CardDescription>Tasks you have assigned to others</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentUser.tasksAssignedByMe.length > 0 ? (
                      <div className="space-y-3">
                        {currentUser.tasksAssignedByMe.map((task, index) => (
                          <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="font-medium text-purple-900">Task {index + 1}</p>
                            <p className="text-sm text-purple-600">Assigned task</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No tasks assigned by you</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Team Tab */}
            {currentUser.directReports.length > 0 && (
              <TabsContent value="team" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">My Team</CardTitle>
                    <CardDescription>People who report directly to you</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {currentUser.directReports.map((report) => (
                        <div key={report.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {report.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{report.name}</h3>
                              <p className="text-sm text-gray-500">{report.role?.name}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-lg font-medium mb-2">Profile editing coming soon</p>
                      <p>Contact your manager to update your profile information</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
