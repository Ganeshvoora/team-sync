'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskStatsProps {
  tasks: any[]
  currentUser: any
}

export default function TaskStats({ tasks, currentUser }: TaskStatsProps) {
  // Calculate statistics
  const totalTasks = tasks.length
  const myTasks = tasks.filter(task => task.assigneeId === currentUser.id)
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED')
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS')
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
  })

  const myCompletedTasks = myTasks.filter(task => task.status === 'COMPLETED')
  const myInProgressTasks = myTasks.filter(task => task.status === 'IN_PROGRESS')
  const myOverdueTasks = myTasks.filter(task => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
  })

  // Priority distribution
  const urgentTasks = tasks.filter(task => task.priority === 'URGENT')
  const highTasks = tasks.filter(task => task.priority === 'HIGH')
  const mediumTasks = tasks.filter(task => task.priority === 'MEDIUM')
  const lowTasks = tasks.filter(task => task.priority === 'LOW')

  const statsCards = [
    {
      title: "Total Tasks",
      value: totalTasks,
      icon: "📋",
  color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "My Tasks",
      value: myTasks.length,
      icon: "👤",
  color: "text-green-700 dark:text-green-300",
      bgColor: "bg-green-500/20"
    },
    {
      title: "Completed",
      value: completedTasks.length,
      icon: "✅",
  color: "text-emerald-700 dark:text-emerald-300",
      bgColor: "bg-emerald-500/20"
    },
    {
      title: "In Progress",
      value: inProgressTasks.length,
      icon: "🔄",
  color: "text-yellow-700 dark:text-yellow-300",
      bgColor: "bg-yellow-500/20"
    },
    {
      title: "Overdue",
      value: overdueTasks.length,
      icon: "⚠️",
  color: "text-red-700 dark:text-red-300",
      bgColor: "bg-red-500/20"
    },
    {
      title: "Urgent Tasks",
      value: urgentTasks.length,
      icon: "🔥",
  color: "text-orange-700 dark:text-orange-300",
      bgColor: "bg-orange-500/20"
    }
  ]

  const myStatsCards = [
    {
      title: "My Completed",
      value: myCompletedTasks.length,
      subtitle: `${myTasks.length > 0 ? Math.round((myCompletedTasks.length / myTasks.length) * 100) : 0}% completion rate`,
  color: "text-emerald-700 dark:text-emerald-300"
    },
    {
      title: "My In Progress",
      value: myInProgressTasks.length,
      subtitle: "Currently working on",
  color: "text-yellow-700 dark:text-yellow-300"
    },
    {
      title: "My Overdue",
      value: myOverdueTasks.length,
      subtitle: "Need immediate attention",
  color: "text-red-700 dark:text-red-300"
    }
  ]

  return (
    <div className="space-y-6 mb-6">
      {/* Overall Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Task Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className={`text-xs ${stat.color}`}>{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Personal Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">My Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myStatsCards.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className={`text-sm font-medium ${stat.color} mb-1`}>{stat.title}</p>
                  <p className="text-xs text-gray-600 dark:text-green-200">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Priority Distribution</h3>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-red-500/20 text-red-700 dark:text-red-300 p-3 rounded-lg mb-2">
                  <p className="text-xl font-bold">{urgentTasks.length}</p>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">Urgent</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500/20 text-orange-700 dark:text-orange-300 p-3 rounded-lg mb-2">
                  <p className="text-xl font-bold">{highTasks.length}</p>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">High</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 p-3 rounded-lg mb-2">
                  <p className="text-xl font-bold">{mediumTasks.length}</p>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Medium</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500/20 text-green-700 dark:text-green-300 p-3 rounded-lg mb-2">
                  <p className="text-xl font-bold">{lowTasks.length}</p>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">Low</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
