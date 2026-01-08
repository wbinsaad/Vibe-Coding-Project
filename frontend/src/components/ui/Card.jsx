import React from 'react'

/**
 * Card Component
 * 
 * @param {Object} props
 * @param {boolean} props.hover - Enable hover effects
 * @param {'sm'|'md'|'lg'} props.padding - Card padding size
 * @param {React.ReactNode} props.children - Card content
 */
export function Card({
    hover = false,
    padding = 'md',
    className = '',
    children,
    ...props
}) {
    const baseStyles = `
        bg-white rounded-2xl border border-stone-200
        shadow-sm
    `

    const hoverStyles = hover
        ? 'transition-all duration-200 hover:shadow-md hover:border-stone-300'
        : ''

    const paddingSizes = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8'
    }

    return (
        <div
            className={`
                ${baseStyles}
                ${hoverStyles}
                ${paddingSizes[padding]}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
        >
            {children}
        </div>
    )
}

/**
 * CardHeader Component
 */
export function CardHeader({ className = '', children, ...props }) {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    )
}

/**
 * CardTitle Component
 */
export function CardTitle({ className = '', children, ...props }) {
    return (
        <h3
            className={`text-lg font-semibold text-stone-900 ${className}`}
            {...props}
        >
            {children}
        </h3>
    )
}

/**
 * CardDescription Component
 */
export function CardDescription({ className = '', children, ...props }) {
    return (
        <p
            className={`text-sm text-stone-500 mt-1 ${className}`}
            {...props}
        >
            {children}
        </p>
    )
}

/**
 * CardContent Component
 */
export function CardContent({ className = '', children, ...props }) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    )
}

/**
 * CardFooter Component
 */
export function CardFooter({ className = '', children, ...props }) {
    return (
        <div
            className={`mt-6 pt-4 border-t border-stone-100 ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export default Card
