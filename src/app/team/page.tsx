export default function TeamPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Team Directory</h1>
        <p className="text-gray-600">Manage your team members and view organizational structure</p>
      </div>
      
      <div className="bg-white/10 rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-white">Team Directory</h3>
          <p className="text-gray-500 mb-4">View team members, roles, and organizational hierarchy</p>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Feature coming soon</div>
          </div>
        </div>
      </div>
    </div>
  )
}