'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'

interface Department {
  id: string
  name: string
  description: string
  budget: number | null
  _count?: {
    users: number
  }
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    budget: null as number | null
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      if (response.ok) {
        const data = await response.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDepartment)
      })

      if (response.ok) {
        setMessage('Department created successfully!')
        setNewDepartment({ name: '', description: '', budget: null })
        setShowAddForm(false)
        fetchDepartments()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      setMessage('Error creating department')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    try {
      const response = await fetch('/api/departments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingDepartment)
      })

      if (response.ok) {
        setMessage('Department updated successfully!')
        setEditingDepartment(null)
        fetchDepartments()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      setMessage('Error updating department')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to delete the department "${departmentName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/departments?id=${departmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMessage('Department deleted successfully!')
        fetchDepartments()
        setTimeout(() => setMessage(''), 3000)
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.error}`)
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      setMessage('Error deleting department')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  const startEdit = (department: Department) => {
    setEditingDepartment({ ...department })
    setShowAddForm(false)
  }

  const cancelEdit = () => {
    setEditingDepartment(null)
  }

  if (loading) {
    return (
      <div className="p-4">
        <PageHeader title="Department Management" subtitle="Admin Panel" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <PageHeader title="Department Management" subtitle="Admin Panel" />
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Departments</h2>
            <p className="text-blue-200">Create and manage company departments</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingDepartment(null)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium"
          >
            Add New Department
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 border border-red-400/30 text-red-300' : 'bg-green-500/20 border border-green-400/30 text-green-300'}`}>
            {message}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Add New Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Department Name</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter department name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white mb-2">Budget (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newDepartment.budget === null ? '' : newDepartment.budget}
                  onChange={(e) => setNewDepartment({ 
                    ...newDepartment, 
                    budget: e.target.value === '' ? null : parseFloat(e.target.value)
                  })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter department budget"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Create Department
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

        {editingDepartment && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Department</h3>
            <form onSubmit={handleEditDepartment} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Department Name</label>
                <input
                  type="text"
                  value={editingDepartment.name}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter department name"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={editingDepartment.description}
                  onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-white mb-2">Budget (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editingDepartment.budget === null ? '' : editingDepartment.budget}
                  onChange={(e) => setEditingDepartment({ 
                    ...editingDepartment, 
                    budget: e.target.value === '' ? null : parseFloat(e.target.value)
                  })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter department budget"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  Update Department
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
          {departments.map((department) => (
            <div key={department.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{department.name}</h3>
                    {department._count && department._count.users > 0 && (
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs border border-blue-400/30">
                        {department._count.users} {department._count.users === 1 ? 'user' : 'users'}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-200 mb-3">{department.description}</p>
                  {department.budget !== null && (
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                      Budget: ${department.budget.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEdit(department)}
                    className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/30 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department.id, department.name)}
                    disabled={department._count && department._count.users > 0}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                      department._count && department._count.users > 0
                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30'
                    }`}
                    title={department._count && department._count.users > 0 ? 'Cannot delete department with assigned users' : 'Delete department'}
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

        {departments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-white text-lg font-medium mb-2">No departments found</h3>
            <p className="text-gray-400">Create your first department to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
