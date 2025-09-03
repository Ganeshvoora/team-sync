interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  createdAt: Date
  assigner: {
    id: string
    name: string
    role: {
      name: string
    }
  }
}

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'DONE': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'TODO': return 'To Do'
      case 'IN_PROGRESS': return 'In Progress'
      case 'DONE': return 'Done'
      default: return status
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {task.title}
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Assigned by {task.assigner.name} ({task.assigner.role.name})
          </p>
          <p className="text-xs text-gray-400">
            Created {formatDate(task.createdAt)}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
          {getStatusText(task.status)}
        </span>
      </div>
    </div>
  )
}
