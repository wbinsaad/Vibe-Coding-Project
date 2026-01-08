import React from 'react'

/**
 * Badge Component
 * 
 * @param {Object} props
 * @param {'default'|'primary'|'secondary'|'success'|'warning'|'danger'|'info'} props.variant
 * @param {'sm'|'md'} props.size - Badge size
 * @param {React.ReactNode} props.children - Badge content
 */
export function Badge({
    variant = 'default',
    size = 'md',
    className = '',
    children,
    ...props
}) {
    const baseStyles = `
        inline-flex items-center font-medium
        rounded-full transition-colors
    `

    const variants = {
        default: 'bg-stone-100 text-stone-700',
        primary: 'bg-indigo-100 text-indigo-700',
        secondary: 'bg-violet-100 text-violet-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-blue-100 text-blue-700'
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs'
    }

    return (
        <span
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
        >
            {children}
        </span>
    )
}

export default Badge
