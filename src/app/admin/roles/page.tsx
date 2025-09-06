'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'

interface Role {
  id: string
  name: string
  description: string
  level: number
  _count?: {
    users: number
  }
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: 0
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRole)
      })

      if (response.ok) {
        setMessage('Role created successfully!')
        setNewRole({ name: '', description: '', level: 0 })
        setShowAddForm(false)
        fetchRoles()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      setMessage('Error creating role')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRole) return

    try {
      const response = await fetch('/api/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingRole)
      })

      if (response.ok) {
        setMessage('Role updated successfully!')
        setEditingRole(null)
        fetchRoles()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      setMessage('Error updating role')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/roles?id=${roleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('Role deleted successfully!')
        fetchRoles()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      setMessage('Error deleting role')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const startEdit = (role: Role) => {
    setEditingRole({ ...role })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingRole(null)
  }

  const getLevelColor = (level: number) => {
    if (level >= 100) return 'bg-red-100 text-red-800 border-red-200'
    if (level >= 90) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (level >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  if (loading) {
    return (
      <div className="p-4">
        <PageHeader title="Role Management" subtitle="Admin Panel" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader title="Role Management" subtitle="Admin Panel" />
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">System Roles</h2>
            <p className="text-blue-200">Create and manage user roles and permissions</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingRole(null)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
          >
            Add New Role
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 border border-red-400/30 text-red-300' : 'bg-green-500/20 border border-green-400/30 text-green-300'}`}>
            {message}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Role</h3>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter role description"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Level (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newRole.level}
                  onChange={(e) => setNewRole({ ...newRole, level: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter role level"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Higher levels have more authority. CEO (100), Director (90), Manager (50), Employee (10)
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Create Role
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

        {editingRole && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Role</h3>
            <form onSubmit={handleEditRole} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Role Name</label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter role description"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Level (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingRole.level}
                  onChange={(e) => setEditingRole({ ...editingRole, level: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter role level"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Higher levels have more authority. CEO (100), Director (90), Manager (50), Employee (10)
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Update Role
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{role.name}</h3>
                    {role._count && role._count.users > 0 && (
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs border border-blue-400/30">
                        {role._count.users} {role._count.users === 1 ? 'user' : 'users'}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200 mb-3">{role.description}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(role.level)}`}>
                    Level {role.level}
                  </span>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(role)}
                    className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/30 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id, role.name)}
                    disabled={role._count && role._count.users > 0}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      role._count && role._count.users > 0
                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30'
                    }`}
                    title={role._count && role._count.users > 0 ? 'Cannot delete role with assigned users' : 'Delete role'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {roles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No roles found</h3>
            <p className="text-gray-400">Create your first role to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}