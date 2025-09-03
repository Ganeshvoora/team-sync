'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import LogoutButton from '@/components/LogoutButton';
import UserCard from '@/components/UserCard';
import TaskCard from '@/components/TaskCard';
import { useRouter } from 'next/navigation';

// Types for data structure
interface Role {
  id: string;
  name: string;
  level: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'COMPLETED';
  createdAt: Date;
  assigner: {
    id: string;
    name: string;
    role: {
      name: string;
    };
  };
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [manager, setManager] = useState<User | null>(null);
  const [directReports, setDirectReports] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [coWorkers, setCoWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push('/login');
          return;
        }
        
        // Fetch the basic user info
        const userResponse = await fetch('/api/users/me');
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            router.push('/onboarding');
            return;
          }
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        setCurrentUser(userData);
        
        // Fetch manager data
        if (userData.managerId) {
          try {
            const managerResponse = await fetch(`/api/users/${userData.managerId}`);
            if (managerResponse.ok) {
              const managerData = await managerResponse.json();
              setManager(managerData);
            }
          } catch (err) {
            console.error('Error fetching manager data:', err);
          }
        }
        
        // Fetch direct reports
        try {
          const directReportsResponse = await fetch(`/api/users/direct-reports?managerId=${userData.id}`);
          if (directReportsResponse.ok) {
            const directReportsData = await directReportsResponse.json();
            setDirectReports(directReportsData);
          }
        } catch (err) {
          console.error('Error fetching direct reports:', err);
        }
        
        // Fetch tasks
        try {
          const tasksResponse = await fetch(`/api/tasks?assigneeId=${userData.id}&status=active`);
          if (tasksResponse.ok) {
            const tasksData = await tasksResponse.json();
            setTasks(tasksData);
          }
        } catch (err) {
          console.error('Error fetching tasks:', err);
        }
        
        // Fetch co-workers
        if (userData.managerId) {
          try {
            const coWorkersResponse = await fetch(`/api/users/co-workers?managerId=${userData.managerId}&userId=${userData.id}`);
            if (coWorkersResponse.ok) {
              const coWorkersData = await coWorkersResponse.json();
              setCoWorkers(coWorkersData);
            }
          } catch (err) {
            console.error('Error fetching co-workers:', err);
          }
        }
        
      } catch (err: any) {
        console.error('Error in dashboard data fetching:', err);
        setError(err.message || 'An error occurred while loading the dashboard');
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [router, supabase]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LCAxMDIsIDI0MSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 text-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Loading your dashboard...</h2>
          <p className="mt-2 text-gray-600">Please wait while we fetch your data.</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LCAxMDIsIDI0MSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 text-center max-w-md">
          <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
          <p className="mt-2 text-gray-600">{error || 'Unable to load dashboard data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter tasks that are not completed and have proper assigner data
  const filteredTasks = tasks.filter(task => 
    task.status !== 'COMPLETED' && task.assigner && task.assigner.role
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LCAxMDIsIDI0MSwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Welcome back, {currentUser.name}
                </h1>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    {currentUser.role?.name || 'No Role'}
                  </span>
                </div>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* My Manager Section */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">My Manager</h2>
                </div>
              </div>
              <div className="px-6 py-5">
                {manager ? (
                  <UserCard user={manager} />
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="italic">No manager assigned</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Tasks Section */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
                  <span className="ml-auto bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200">
                    {filteredTasks.length}
                  </span>
                </div>
              </div>
              <div className="px-6 py-5">
                {filteredTasks.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="italic">No tasks assigned</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Team Section */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">My Direct Reports</h2>
                  <span className="ml-auto bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200">
                    {directReports.length}
                  </span>
                </div>
              </div>
              <div className="px-6 py-5">
                {directReports.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {directReports.map((report) => (
                      <UserCard key={report.id} user={report} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="italic">No direct reports</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* My Co-workers Section */}
            <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">My Co-workers</h2>
                  <span className="ml-auto bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-orange-200">
                    {coWorkers.length}
                  </span>
                </div>
              </div>
              <div className="px-6 py-5">
                {coWorkers.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {coWorkers.map((coWorker) => (
                      <UserCard key={coWorker.id} user={coWorker} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="italic">No co-workers found</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
