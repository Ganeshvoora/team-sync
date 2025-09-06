'use client'

import React, { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Mail, Phone, MapPin, Calendar, Users, Award, ClipboardList, Bell, Filter, Building2, UserCheck } from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
  employeeId?: string
  contactNumber?: string
  location?: string
  bio?: string
  skills?: string
  joiningDate?: string
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
    role: {
      name: string
    }
  } | null
  directReports?: any[]
}

interface Task {
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [taskForm, setTaskForm] = useState<Task>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm, selectedDepartment, selectedRole])

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes, userRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
        fetch('/api/user/current')
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        setEmployees(employeesData)
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json()
        setDepartments(departmentsData)
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

  const filterEmployees = () => {
    let filtered = employees.filter(emp => emp.status === 'ACTIVE')

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => emp.department?.id === selectedDepartment)
    }

    // Role filter
    if (selectedRole !== 'all') {
      if (selectedRole === 'manager') {
        filtered = filtered.filter(emp => emp.role.level >= 50)
      } else if (selectedRole === 'employee') {
        filtered = filtered.filter(emp => emp.role.level < 50)
      }
    }

    setFilteredEmployees(filtered)
  }

  // Check if current user can assign tasks to the target employee
  const canAssignTaskTo = (targetEmployee: Employee) => {
    if (!currentUser || !targetEmployee) return false
    
    // CEOs and Admins can assign tasks to anyone
    if (currentUser.role?.name === 'CEO' || currentUser.role?.name === 'Admin') {
      return true
    }

    // Check if the target employee reports to the current user (direct or indirect)
    const isDirectReport = targetEmployee.manager?.id === currentUser.id
    if (isDirectReport) return true

    // Check for indirect reports (recursively check if current user is a manager up the chain)
    const checkManagerChain = (employee: Employee): boolean => {
      if (!employee.manager) return false
      if (employee.manager.id === currentUser.id) return true
      
      // Find the manager employee to continue checking up the chain
      const managerEmployee = employees.find(emp => emp.id === employee.manager?.id)
      if (!managerEmployee) return false
      
      return checkManagerChain(managerEmployee)
    }

    return checkManagerChain(targetEmployee)
  }

  const handleAssignTask = async () => {
    if (!selectedEmployee || !taskForm.title || !taskForm.description) return

    // Additional check to ensure user can assign tasks to this employee
    if (!canAssignTaskTo(selectedEmployee)) {
      alert('You can only assign tasks to people who report to you.')
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...taskForm,
          assignedToId: selectedEmployee.id,
          assignedById: currentUser.id
        })
      })

      if (response.ok) {
        setShowTaskDialog(false)
        setTaskForm({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: ''
        })
        // Show success notification
        alert('Task assigned successfully!')
      }
    } catch (error) {
      console.error('Error assigning task:', error)
    }
  }

  const openProfile = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowProfile(true)
  }

  const openTaskDialog = (employee: Employee) => {
    if (!canAssignTaskTo(employee)) {
      alert('You can only assign tasks to people who report to you.')
      return
    }
    setSelectedEmployee(employee)
    setShowTaskDialog(true)
  }

  const roles = [...new Set(employees.map(emp => emp.role.name))]

  if (loading) {
    return (
      <div className="p-4">
        <PageHeader title="Employee Directory" subtitle="Find and Connect" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-white mx-auto mb-4"></div>
            <div className="text-gray-900 dark:text-white text-xl mb-2">Loading directory...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="p-4">
        <PageHeader title="Employee Directory" subtitle="Find and Connect with Team Members" />
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="bg-white dark:bg-white/10 backdrop-blur-xl border-gray-200 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Find employees by name, role, department, or employee ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by name, email, role, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-gray-100 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedDepartment('all')
                  setSelectedRole('all')
                }}
                className="text-gray-900 dark:text-white border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="bg-white dark:bg-white/10 backdrop-blur-xl border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/15 transition-all duration-200">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-xl">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{employee.name}</h3>
                  <p className="text-blue-600 dark:text-blue-200 text-sm">{employee.email}</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-400/20 text-blue-800 dark:text-blue-300">
                      {employee.role.name}
                    </Badge>
                    {employee.department && (
                      <Badge variant="outline" className="border-purple-300 dark:border-purple-400/50 text-purple-800 dark:text-purple-300">
                        {employee.department.name}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {employee.employeeId && (
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      <span>ID: {employee.employeeId}</span>
                    </div>
                  )}
                  {employee.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{employee.location}</span>
                    </div>
                  )}
                  {employee.manager && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Reports to: {employee.manager.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => openProfile(employee)}
                    className="flex-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 border border-blue-300 dark:border-blue-400/30"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  {canAssignTaskTo(employee) && (
                    <Button
                      size="sm"
                      onClick={() => openTaskDialog(employee)}
                      className="flex-1 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-500/30 border border-green-300 dark:border-green-400/30"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Task
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <Card className="bg-white dark:bg-white/10 backdrop-blur-xl border-gray-200 dark:border-white/20">
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-gray-900 dark:text-white text-lg font-medium mb-2">No employees found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full Profile Modal */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10">
          <div className="flex items-center justify-between">
            <DialogHeader className="flex-1">
              <DialogTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedEmployee?.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 dark:text-white font-bold">{selectedEmployee?.name}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{selectedEmployee?.role.name} • {selectedEmployee?.department?.name}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <DialogClose asChild>
              <Button
                size="icon"
                className="ml-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </DialogClose>
          </div>

          {selectedEmployee && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Contact Information */}
              <Card className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center space-x-2 font-bold">
                    <Mail className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Email:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.email}</p>
                  </div>
                  {selectedEmployee.contactNumber && (
                    <div>
                      <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Phone:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.contactNumber}</p>
                    </div>
                  )}
                  {selectedEmployee.location && (
                    <div>
                      <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Location:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.location}</p>
                    </div>
                  )}
                  {selectedEmployee.employeeId && (
                    <div>
                      <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Employee ID:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.employeeId}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Details */}
              <Card className="bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center space-x-2 font-bold">
                    <Award className="w-5 h-5" />
                    <span>Professional Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Role:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.role.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Department:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.department?.name || 'Unassigned'}</p>
                  </div>
                  {selectedEmployee.manager && (
                    <div>
                      <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Manager:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.manager.name}</p>
                    </div>
                  )}
                  {selectedEmployee.directReports && selectedEmployee.directReports.length > 0 && (
                    <div>
                      <span className="text-gray-700 dark:text-gray-400 text-sm font-semibold">Team Size:</span>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.directReports.length} direct reports</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills & Bio */}
              {(selectedEmployee.skills || selectedEmployee.bio) && (
                <Card className="bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white font-bold">About</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEmployee.skills && (
                      <div>
                        <span className="text-gray-700 dark:text-gray-400 text-sm block mb-2 font-semibold">Skills:</span>
                        <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.skills}</p>
                      </div>
                    )}
                    {selectedEmployee.bio && (
                      <div>
                        <span className="text-gray-700 dark:text-gray-400 text-sm block mb-2 font-semibold">Bio:</span>
                        <p className="text-gray-900 dark:text-white font-medium">{selectedEmployee.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="md:col-span-2 flex space-x-4">
                {canAssignTaskTo(selectedEmployee) && (
                  <Button
                    onClick={() => openTaskDialog(selectedEmployee)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Assign Task
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Assignment Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10">
          <div className="flex items-center justify-between">
            <DialogHeader className="flex-1">
              <DialogTitle className="text-gray-900 dark:text-white font-bold">Assign Task to {selectedEmployee?.name}</DialogTitle>
              <DialogDescription className="text-gray-700 dark:text-gray-300 font-medium">
                Create a new task and assign it to this employee
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button
                size="icon"
                className="ml-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </DialogClose>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Task Title</label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Enter task title..."
                className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Description</label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Describe the task in detail..."
                rows={4}
                className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Priority</label>
                <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({ ...taskForm, priority: value })}>
                  <SelectTrigger className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-900 dark:text-white">Due Date</label>
                <Input
                  type="datetime-local"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <Button onClick={handleAssignTask} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold">
                <ClipboardList className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
              <Button variant="outline" onClick={() => setShowTaskDialog(false)} className="flex-1 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
  )
}
