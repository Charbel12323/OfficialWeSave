import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'outline'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  size = 'default',
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm',
    lg: 'px-6 py-3 text-lg'
  }

  const variantClasses = {
    default: 'bg-teal-500 hover:bg-teal-600 text-white',
    outline: 'bg-transparent border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white'
  }

  const baseClasses = 'rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50'

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}
