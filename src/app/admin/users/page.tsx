'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface User {
  id: string
  name: string
  email: string
  employeeId: string
  status: string
  role: {
    id: string
    name: string
    level: number
  }
  department: {
    id: string
    name: string
  } | null
  manager: {
    id: string
    name: string
  } | null
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    employeeId: '',
    roleId: '',
    departmentId: '',
    managerId: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, deptRes, userRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/roles'),
        fetch('/api/departments'),
        fetch('/api/user/current')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        setRoles(rolesData)
      }

      if (deptRes.ok) {
        const deptData = await deptRes.json()
        setDepartments(deptData)
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get potential managers for a user based on role level
  const getPotentialManagers = (userRoleLevel: number, excludeUserId?: string) => {
    return users.filter(u => {
      // Exclude the user themselves if editing
      if (excludeUserId && u.id === excludeUserId) return false
      
      // Manager must have a higher role level
      if (u.role.level <= userRoleLevel) return false
      
      // Prevent circular reporting relationships
      if (excludeUserId && wouldCreateCircularReporting(excludeUserId, u.id)) return false
      
      return true
    })
  }

  // Helper function to check if assigning a manager would create a circular reporting relationship
  const wouldCreateCircularReporting = (userId: string, potentialManagerId: string): boolean => {
    // If the potential manager reports to the user (directly or indirectly), it would create a circle
    const checkReportingChain = (managerId: string, targetUserId: string): boolean => {
      const manager = users.find(u => u.id === managerId)
      if (!manager || !manager.manager) return false
      
      if (manager.manager.id === targetUserId) return true
      
      return checkReportingChain(manager.manager.id, targetUserId)
    }
    
    return checkReportingChain(potentialManagerId, userId)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        setMessage('User created successfully!')
        setNewUser({ name: '', email: '', employeeId: '', roleId: '', departmentId: '', managerId: '' })
        setShowAddForm(false)
        fetchData()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('Error creating user')
    }
  }

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      // If updating manager, also update department automatically
      if (updates.managerId) {
        const manager = users.find(u => u.id === updates.managerId)
        if (manager && manager.department) {
          updates.departmentId = manager.department.id
        }
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        setMessage('User updated successfully!')
        fetchData()
        setSelectedUser(null)
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      setMessage('Error updating user')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'INACTIVE': return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isAdmin = currentUser?.role?.name === 'Admin' || currentUser?.role?.name === 'CEO'
  const visibleUsers = isAdmin ? users : users.filter(user => 
    user.department?.id === currentUser?.department?.id || !user.department
  )

  if (loading) {
    return (
      <AdminLayout title="User Management" subtitle="Admin Panel">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="User Management" subtitle="Admin Panel">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">System Users</h2>
            <p className="text-blue-200">Manage user accounts, roles, and departments</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
          >
            Add New User
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 border border-red-400/30 text-red-300' : 'bg-green-500/20 border border-green-400/30 text-green-300'}`}>
            {message}
          </div>
        )}

        {!isAdmin && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
            <p className="text-blue-300">
              You are viewing users from your department. Admins can see all users across departments.
            </p>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Employee ID</label>
                <input
                  type="text"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter employee ID"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Role</label>
                <select
                  value={newUser.roleId}
                  onChange={(e) => {
                    const roleId = e.target.value
                    setNewUser({ 
                      ...newUser, 
                      roleId, 
                      managerId: '' // Reset manager when role changes since available managers will change
                    })
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-gray-800">
                      {role.name} (Level {role.level})
                    </option>
                  ))}
                </select>
              </div>
              {!isAdmin && (
                <div>
                  <label className="block text-white mb-2">Department</label>
                  <select
                    value={newUser.departmentId}
                    onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-gray-800">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {isAdmin && (
                <div>
                  <label className="block text-white mb-2">Department (Optional)</label>
                  <select
                    value={newUser.departmentId}
                    onChange={(e) => setNewUser({ ...newUser, departmentId: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">No department (Admin access)</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id} className="bg-gray-800">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-white mb-2">Manager (Optional)</label>
                <select
                  value={newUser.managerId}
                  onChange={(e) => {
                    const managerId = e.target.value
                    let departmentId = newUser.departmentId
                    
                    // Auto-assign department based on manager
                    if (managerId) {
                      const manager = users.find(u => u.id === managerId)
                      if (manager && manager.department) {
                        departmentId = manager.department.id
                      }
                    }
                    
                    setNewUser({ 
                      ...newUser, 
                      managerId,
                      departmentId 
                    })
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="">No manager</option>
                  {(() => {
                    const selectedRoleLevel = newUser.roleId ? 
                      roles.find(r => r.id === newUser.roleId)?.level || 0 : 0
                    
                    const potentialManagers = getPotentialManagers(selectedRoleLevel)
                    
                    if (potentialManagers.length === 0 && newUser.roleId) {
                      return (
                        <option value="" disabled className="bg-gray-800 text-gray-500">
                          No users with higher role levels available
                        </option>
                      )
                    }
                    
                    return potentialManagers.map((user) => (
                      <option key={user.id} value={user.id} className="bg-gray-800">
                        {user.name} ({user.role.name} - Level {user.role.level}) - {user.department?.name || 'No Dept'}
                      </option>
                    ))
                  })()}
                </select>
                <p className="text-gray-400 text-xs mt-1">
                  Only users with higher role levels can be assigned as managers. Selecting a manager will automatically assign the user to the manager's department.
                </p>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {visibleUsers.map((user) => (
            <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{user.name}</h3>
                      <p className="text-blue-200">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <span className="text-gray-400 text-sm">Employee ID:</span>
                      <p className="text-white">{user.employeeId}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Role:</span>
                      <p className="text-white">{user.role.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Department:</span>
                      <p className="text-white">{user.department?.name || 'Unassigned'}</p>
                    </div>
                    {user.manager && (
                      <div>
                        <span className="text-gray-400 text-sm">Manager:</span>
                        <p className="text-white">{user.manager.name}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-200"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No users found</h3>
            <p className="text-gray-400">Create your first user to get started.</p>
          </div>
        )}
      </div>

      {/* User Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Edit User: {selectedUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Role</label>
                <select
                  defaultValue={selectedUser.role.id}
                  onChange={(e) => handleUpdateUser(selectedUser.id, { roleId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-gray-800">
                      {role.name} (Level {role.level})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-white mb-2">Department</label>
                <select
                  defaultValue={selectedUser.department?.id || ''}
                  onChange={(e) => handleUpdateUser(selectedUser.id, { departmentId: e.target.value || null })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="" className="bg-gray-800">No department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-gray-800">
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-xs mt-1">
                  Note: Department will auto-update when manager is changed
                </p>
              </div>

              <div>
                <label className="block text-white mb-2">Manager</label>
                <select
                  defaultValue={selectedUser.manager?.id || ''}
                  onChange={(e) => {
                    const managerId = e.target.value || null
                    const updates: any = { managerId }
                    
                    // Auto-assign department based on manager
                    if (managerId) {
                      const manager = users.find(u => u.id === managerId)
                      if (manager && manager.department) {
                        updates.departmentId = manager.department.id
                      }
                    }
                    
                    handleUpdateUser(selectedUser.id, updates)
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="" className="bg-gray-800">No manager</option>
                  {(() => {
                    const potentialManagers = getPotentialManagers(selectedUser.role.level, selectedUser.id)
                    
                    if (potentialManagers.length === 0) {
                      return (
                        <option value="" disabled className="bg-gray-800 text-gray-500">
                          No users with higher role levels available
                        </option>
                      )
                    }
                    
                    return potentialManagers.map((user) => (
                      <option key={user.id} value={user.id} className="bg-gray-800">
                        {user.name} ({user.role.name} - Level {user.role.level}) - {user.department?.name || 'No Dept'}
                      </option>
                    ))
                  })()}
                </select>
                <p className="text-gray-400 text-xs mt-1">
                  Only users with higher role levels can be assigned as managers. Changing manager will automatically assign user to manager's department.
                </p>
              </div>

              <div>
                <label className="block text-white mb-2">Status</label>
                <select
                  defaultValue={selectedUser.status}
                  onChange={(e) => handleUpdateUser(selectedUser.id, { status: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="ACTIVE" className="bg-gray-800">Active</option>
                  <option value="INACTIVE" className="bg-gray-800">Inactive</option>
                  <option value="PENDING" className="bg-gray-800">Pending</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}