interface User {
  id: string
  name: string
  email: string
  role: {
    id: string
    name: string
    level: number
  }
}

interface UserCardProps {
  user: User
}

export default function UserCard({ user }: UserCardProps) {
  const getRoleColor = (roleLevel: number) => {
    switch (roleLevel) {
      case 0: return 'bg-purple-100 text-purple-800' // CEO
      case 1: return 'bg-blue-100 text-blue-800'     // Director
      case 2: return 'bg-green-100 text-green-800'   // Manager
      case 3: return 'bg-yellow-100 text-yellow-800' // Associate
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {user.email}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role.level)}`}>
          {user.role.name}
        </span>
      </div>
    </div>
  )
}
