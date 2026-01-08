import React, { forwardRef } from 'react'

/**
 * Textarea Component
 * 
 * @param {Object} props
 * @param {string} props.label - Textarea label
 * @param {string} props.error - Error message
 * @param {string} props.hint - Hint text below textarea
 * @param {boolean} props.required - Show required indicator
 * @param {number} props.rows - Number of rows
 */
export const Textarea = forwardRef(function Textarea({
    label,
    error,
    hint,
    required = false,
    rows = 4,
    className = '',
    id,
    ...props
}, ref) {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    const baseStyles = `
        w-full px-4 py-3
        bg-white border rounded-xl
        text-stone-900 text-sm leading-relaxed
        placeholder:text-stone-400
        transition-all duration-150
        resize-none
        focus:outline-none focus:ring-2 focus:ring-offset-0
    `

    const stateStyles = error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
        : 'border-stone-200 hover:border-stone-300 focus:border-indigo-500 focus:ring-indigo-500/20'

    const disabledStyles = props.disabled
        ? 'opacity-50 cursor-not-allowed bg-stone-50'
        : ''

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={textareaId}
                    className="block text-sm font-medium text-stone-700"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                id={textareaId}
                rows={rows}
                className={`
                    ${baseStyles}
                    ${stateStyles}
                    ${disabledStyles}
                    ${className}
                `.replace(/\s+/g, ' ').trim()}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-sm text-stone-500">{hint}</p>
            )}
        </div>
    )
})

export default Textarea
