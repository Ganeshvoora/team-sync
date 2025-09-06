'use client'

import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm">
                {subtitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
