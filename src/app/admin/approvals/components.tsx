import { User, Role, PendingApplication } from '../types'

/**
 * Component displayed when user doesn't have admin access
 */
export function AccessDeniedView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg w-full px-4 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-white">Access Denied</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You do not have permission to access this admin area.
          </p>
          <div className="mt-6">
            <a 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-orange-600 border border-transparent rounded-md font-medium text-white hover:bg-orange-500 focus:outline-none focus:border-orange-700 focus:ring focus:ring-orange-200 active:bg-orange-700 transition duration-150 ease-in-out"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Component displayed when there are no pending applications
 */
export function NoApplicationsView() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
      <div className="flex flex-col items-center justify-center py-8">
        <svg className="w-16 h-16 text-orange-300 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Pending Applications</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          There are currently no pending user applications to review.
        </p>
      </div>
    </div>
  )
}

/**
 * Section displaying all pending applications
 */
export function PendingApplicationsSection({ 
  applications, 
  allRoles, 
  allUsers,
  approveApplication,
  rejectApplication
}: { 
  applications: PendingApplication[], 
  allRoles: Role[], 
  allUsers: User[],
  approveApplication: (formData: FormData) => Promise<void>,
  rejectApplication: (formData: FormData) => Promise<void>
}) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Pending Applications ({applications.length})
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Review and approve new user applications
        </p>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {applications.map((application) => (
          <div key={application.id} className="p-6">
            <ApplicationItem 
              application={application}
              allRoles={allRoles}
              allUsers={allUsers}
              approveAction={approveApplication}
              rejectAction={rejectApplication}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Individual application item with approval/rejection controls
 */
function ApplicationItem({ 
  application, 
  allRoles, 
  allUsers,
  approveAction,
  rejectAction
}: { 
  application: PendingApplication, 
  allRoles: Role[], 
  allUsers: User[],
  approveAction: (formData: FormData) => Promise<void>,
  rejectAction: (formData: FormData) => Promise<void>
}) {
  const formattedDate = new Date(application.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{application.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{application.email}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Applied on {formattedDate}</p>
        </div>
        
        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300 rounded-full">
          {application.status}
        </span>
      </div>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requested Position:</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {application.bio || 'No additional information'}
        </div>
        {application.skills && (
          <div className="mt-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Skills:</span> 
            <span className="text-gray-600 dark:text-gray-400"> {application.skills}</span>
          </div>
        )}
        {application.location && (
          <div className="mt-1 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span> 
            <span className="text-gray-600 dark:text-gray-400"> {application.location}</span>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <form className="space-y-4" action={approveAction}>
          <input type="hidden" name="applicationId" value={application.id} />
          
          <div>
            <label htmlFor={`role-${application.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assign Role
            </label>
            <select
              id={`role-${application.id}`}
              name="roleId"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              required
            >
              <option value="">Select a role</option>
              {allRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} (Level {role.level})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor={`manager-${application.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assign Manager (optional)
            </label>
            <select
              id={`manager-${application.id}`}
              name="managerId"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            >
              <option value="null">No manager</option>
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role.name})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              formAction={rejectAction}
            >
              Reject
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Approve Application
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
