import React from 'react'

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 dark:ring-gray-800 ${className}`}>
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-base font-semibold leading-6 text-gray-900 dark:text-gray-100 ${className}`}>
      {children}
    </h3>
  )
}

export const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  )
}

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}
