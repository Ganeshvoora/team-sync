// Define types for the admin page
export interface Role {
  id: string;
  name: string;
  level: number;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  role: Role;
  departmentId: string | null;
  department: Department | null;
  managerId: string | null;
  manager: {
    id: string;
    name: string;
    role: Role;
  } | null;
}

export interface PendingApplication {
  id: string;
  email: string;
  name: string;
  status: string;
  contactNumber: string;
  skills: string | null;
  bio: string | null;
  employeeId: string | null;
  location: string | null;
  profilePictureUrl: string | null;
  createdAt: Date | string;
}
