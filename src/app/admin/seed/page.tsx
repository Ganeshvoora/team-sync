'use client'

import { useState } from 'react'

export default function AdminSeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<string | null>(null)

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    setSeedResult(null)
    
    try {
      // Simulate seeding process
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSeedResult('Database seeded successfully!')
    } catch (error) {
      setSeedResult('Error seeding database')
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Seeding</h1>
        <p className="text-gray-600">Populate the database with sample data for testing</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Seed Options</h2>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Sample Users</h3>
                  <p className="text-sm text-gray-500">Create sample employees with different roles</p>
                </div>
                <input type="checkbox" className="form-checkbox" defaultChecked />
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Sample Projects</h3>
                  <p className="text-sm text-gray-500">Generate example projects with tasks</p>
                </div>
                <input type="checkbox" className="form-checkbox" defaultChecked />
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Sample Tasks</h3>
                  <p className="text-sm text-gray-500">Create various tasks with different statuses</p>
                </div>
                <input type="checkbox" className="form-checkbox" defaultChecked />
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Departments</h3>
                  <p className="text-sm text-gray-500">Set up organizational departments</p>
                </div>
                <input type="checkbox" className="form-checkbox" defaultChecked />
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-md transition-colors font-medium"
          >
            {isSeeding ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Seeding Database...
              </div>
            ) : (
              'Seed Database'
            )}
          </button>
          
          {seedResult && (
            <div className={`mt-4 p-4 rounded-md ${seedResult.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {seedResult}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This will create sample data in your database. Make sure you're not running this on a production environment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}