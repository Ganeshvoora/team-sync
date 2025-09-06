import { ReactNode } from 'react'

interface AdminUsersLayoutProps {
  children: ReactNode
}

export default function AdminUsersLayout({ children }: AdminUsersLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto">
        {children}
      </div>
    </div>
  )
}