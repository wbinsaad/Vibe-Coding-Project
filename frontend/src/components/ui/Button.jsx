import React from 'react'

/**
 * Button Component
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'destructive'} props.variant - Button style variant
 * @param {'sm'|'md'|'lg'} props.size - Button size
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Full width button
 * @param {React.ReactNode} props.children - Button content
 */
export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    children,
    ...props
}) {
    const baseStyles = `
        inline-flex items-center justify-center gap-2 font-medium
        rounded-xl transition-all duration-150 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
    `

    const variants = {
        primary: `
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-700 hover:to-violet-700
            text-white shadow-md hover:shadow-lg
            focus-visible:ring-indigo-500
            active:scale-[0.98]
        `,
        secondary: `
            bg-white border border-stone-200
            hover:bg-stone-50 hover:border-stone-300
            text-stone-700 shadow-sm hover:shadow
            focus-visible:ring-stone-400
        `,
        ghost: `
            bg-transparent hover:bg-stone-100
            text-stone-600 hover:text-stone-900
            focus-visible:ring-stone-400
        `,
        destructive: `
            bg-red-600 hover:bg-red-700
            text-white shadow-md hover:shadow-lg
            focus-visible:ring-red-500
            active:scale-[0.98]
        `
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base'
    }

    const widthClass = fullWidth ? 'w-full' : ''

    return (
        <button
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${widthClass}
                ${className}
            `.replace(/\s+/g, ' ').trim()}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    )
}

export default Button
