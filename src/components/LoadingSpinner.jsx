import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Carregando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="loading">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && <p className="mt-2 text-gray-500">{text}</p>}
    </div>
  )
}

export default LoadingSpinner