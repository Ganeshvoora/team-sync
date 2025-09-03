import { ReactNode } from 'react'
import EnhancedNavigation from '@/components/EnhancedNavigation'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <EnhancedNavigation />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
