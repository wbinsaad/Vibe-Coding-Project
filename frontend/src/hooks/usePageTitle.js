import { useEffect } from 'react'

const BASE_TITLE = 'Interview Companion — UX Research Tool'

/**
 * usePageTitle - Hook to set the browser tab title
 * 
 * @param {string} title - Page-specific title
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.includeBase=true] - Whether to append base title
 * 
 * @example
 * // Sets: "Script Editor — My Interview | Interview Companion"
 * usePageTitle('Script Editor — My Interview')
 * 
 * // Sets: "Interview Companion — UX Research Tool" (just base)
 * usePageTitle()
 */
export function usePageTitle(title, options = {}) {
    const { includeBase = true } = options

    useEffect(() => {
        if (title) {
            document.title = includeBase ? `${title} | Interview Companion` : title
        } else {
            document.title = BASE_TITLE
        }

        // Cleanup: reset to base title when component unmounts
        return () => {
            document.title = BASE_TITLE
        }
    }, [title, includeBase])
}

/**
 * formatScriptTitle - Helper to format script title for page title
 * 
 * @param {string} prefix - Page name (e.g., 'Script Editor')
 * @param {number|string} scriptId - Script ID
 * @param {string} [scriptTitle] - Optional script title from context
 * @returns {string} Formatted title
 */
export function formatScriptTitle(prefix, scriptId, scriptTitle) {
    if (scriptTitle) {
        // Truncate long titles
        const truncated = scriptTitle.length > 40
            ? scriptTitle.slice(0, 40) + '...'
            : scriptTitle
        return `${prefix} — ${truncated}`
    }
    return `${prefix} — Script #${scriptId}`
}

export default usePageTitle
