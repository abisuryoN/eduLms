import React from 'react'

export const Input = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  id, 
  ...props 
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium leading-6 text-gray-900 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={`block w-full rounded-xl border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
            error ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-brand-600'
          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
