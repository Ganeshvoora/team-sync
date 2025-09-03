// Types to align database models with component interfaces

export interface User {
  id: string
  name: string
  email: string
  status: string
  roleId: string
  managerId?: string | null
  departmentId?: string | null
  role: {
    id: string
    name: string
    level: number
  } | null
  manager?: User | null
  department?: Department | null
}

export interface Role {
  id: string
  name: string
  level: number
  description?: string | null
  permissions?: Record<string, unknown>
  departmentId?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: Date | null
  assigneeId: string
  assignerId: string
  projectId?: string | null
  createdAt: Date
  updatedAt: Date
  assigner: {
    id: string
    name: string
    role: {
      name: string
    } | null
  }
  assignee?: User
  project?: Project | null
}

export interface Project {
  id: string
  name: string
  description?: string | null
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  startDate: Date
  endDate?: Date | null
  managerId: string
  departmentId: string
  createdAt: Date
  updatedAt: Date
  manager?: User
  department?: Department
  tasks?: Task[]
}

// Helper type for database queries with includes
export type UserWithRelations = User & {
  role: Role | null
  manager: (User & { role: Role | null }) | null
  department: Department | null
}

export type TaskWithRelations = Task & {
  assigner: User & { role: Role | null }
  assignee: User & { role: Role | null }
  project: Project | null
}

// Utility types for safe access
export type SafeUser = Omit<User, 'role'> & {
  role: {
    id: string
    name: string
    level: number
  }
}

export type SafeTask = Omit<Task, 'status'> & {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
}
