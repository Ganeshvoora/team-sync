'use client'

import { useState } from 'react'

interface Role {
  id: string
  name: string
  level: number
}

interface Department {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  roleId: string
  managerId: string | null
  departmentId: string | null
  role: Role
  department?: Department | null
  manager?: {
    id: string
    name: string
    role: Role
  } | null
}

interface UserEditFormProps {
  user: User
  allRoles: Role[]
  allUsers: User[]
  allDepartments: Department[]
  updateUserRole: (formData: FormData) => Promise<void>
  updateUserManager: (formData: FormData) => Promise<void>
  updateUserDepartment: (formData: FormData) => Promise<void>
}

export default function UserEditForm({ 
  user, 
  allRoles, 
  allUsers, 
  allDepartments,
  updateUserRole, 
  updateUserManager,
  updateUserDepartment
}: UserEditFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId)
  const [selectedManagerId, setSelectedManagerId] = useState(user.managerId || 'null')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(user.departmentId || 'null')

  // Filter potential managers (exclude self and anyone who reports to this user)
  const potentialManagers = allUsers.filter(potentialManager => {
    // Can't be your own manager
    if (potentialManager.id === user.id) return false
    
    // Can't have someone who reports to you as your manager (prevents cycles)
    if (potentialManager.managerId === user.id) return false
    
    return true
  })

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('userId', user.id)
    formData.append('roleId', selectedRoleId)
    await updateUserRole(formData)
    setIsEditing(false)
  }

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('userId', user.id)
    formData.append('managerId', selectedManagerId)
    
    // Auto-assign department based on manager selection
    if (selectedManagerId !== 'null') {
      const selectedManager = allUsers.find(u => u.id === selectedManagerId)
      if (selectedManager && selectedManager.departmentId) {
        setSelectedDepartmentId(selectedManager.departmentId)
        // Update department in the same call
        const deptFormData = new FormData()
        deptFormData.append('userId', user.id)
        deptFormData.append('departmentId', selectedManager.departmentId)
        await updateUserDepartment(deptFormData)
      }
    }
    
    await updateUserManager(formData)
    setIsEditing(false)
  }

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('userId', user.id)
    formData.append('departmentId', selectedDepartmentId)
    await updateUserDepartment(formData)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-indigo-600 hover:text-indigo-900"
      >
        Edit
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Role Edit Form */}
      <form onSubmit={handleRoleSubmit} className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            {allRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Update Role
        </button>
      </form>

      {/* Manager Edit Form */}
      <form onSubmit={handleManagerSubmit} className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Manager
          </label>
          <select
            value={selectedManagerId}
            onChange={(e) => {
              setSelectedManagerId(e.target.value)
              // Auto-update department selection when manager changes
              if (e.target.value !== 'null') {
                const selectedManager = allUsers.find(u => u.id === e.target.value)
                if (selectedManager && selectedManager.departmentId) {
                  setSelectedDepartmentId(selectedManager.departmentId)
                }
              }
            }}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="null">No Manager</option>
            {potentialManagers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name} ({manager.role.name}) {manager.department ? `- ${manager.department.name}` : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Changing manager will auto-update department
          </p>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Update Manager
        </button>
      </form>

      {/* Department Edit Form */}
      <form onSubmit={handleDepartmentSubmit} className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            value={selectedDepartmentId}
            onChange={(e) => setSelectedDepartmentId(e.target.value)}
            className="block w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="null">No Department</option>
            {allDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Update Department
        </button>
      </form>

      <button
        onClick={() => {
          setIsEditing(false)
          setSelectedRoleId(user.roleId)
          setSelectedManagerId(user.managerId || 'null')
          setSelectedDepartmentId(user.departmentId || 'null')
        }}
        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Cancel
      </button>
    </div>
  )
}
