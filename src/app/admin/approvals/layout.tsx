import { ReactNode } from 'react'

interface AdminApprovalsLayoutProps {
  children: ReactNode
}

export default function AdminApprovalsLayout({ children }: AdminApprovalsLayoutProps) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Approvals
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage pending user approvals and access requests
        </p>
      </div>
      {children}
    </div>
  )
}