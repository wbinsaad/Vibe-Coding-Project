import React, { createContext, useContext, useState, useEffect } from 'react'

const SCRIPT_ID_KEY = 'currentScriptId'
const SCRIPT_TITLE_KEY = 'currentScriptTitle'
const RECENT_SCRIPTS_KEY = 'recentScripts'
const MAX_RECENT_SCRIPTS = 10

// Create context
const ScriptContext = createContext(null)

/**
 * ScriptProvider - Manages the current script ID and title state across the app
 * 
 * - Persists to localStorage for session continuity
 * - Tracks recent scripts for quick switching
 * - Provides currentScriptId, currentScriptTitle, recentScripts to children
 */
export function ScriptProvider({ children }) {
    // Current script state
    const [currentScriptId, setCurrentScriptIdState] = useState(() => {
        try {
            const stored = localStorage.getItem(SCRIPT_ID_KEY)
            if (stored) {
                const parsed = parseInt(stored, 10)
                return isNaN(parsed) ? null : parsed
            }
        } catch (e) {
            console.warn('Failed to read currentScriptId from localStorage:', e)
        }
        return null
    })

    const [currentScriptTitle, setCurrentScriptTitleState] = useState(() => {
        try {
            return localStorage.getItem(SCRIPT_TITLE_KEY) || null
        } catch (e) {
            console.warn('Failed to read currentScriptTitle from localStorage:', e)
        }
        return null
    })

    // Recent scripts state
    const [recentScripts, setRecentScriptsState] = useState(() => {
        try {
            const stored = localStorage.getItem(RECENT_SCRIPTS_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                return Array.isArray(parsed) ? parsed : []
            }
        } catch (e) {
            console.warn('Failed to read recentScripts from localStorage:', e)
        }
        return []
    })

    // Update localStorage when recentScripts changes
    useEffect(() => {
        try {
            localStorage.setItem(RECENT_SCRIPTS_KEY, JSON.stringify(recentScripts))
        } catch (e) {
            console.warn('Failed to save recentScripts to localStorage:', e)
        }
    }, [recentScripts])

    // Set current script ID only (backwards compatible)
    const setCurrentScriptId = (id) => {
        const numericId = id ? parseInt(id, 10) : null
        const validId = numericId && !isNaN(numericId) ? numericId : null

        setCurrentScriptIdState(validId)

        try {
            if (validId) {
                localStorage.setItem(SCRIPT_ID_KEY, validId.toString())
            } else {
                localStorage.removeItem(SCRIPT_ID_KEY)
                localStorage.removeItem(SCRIPT_TITLE_KEY)
                setCurrentScriptTitleState(null)
            }
        } catch (e) {
            console.warn('Failed to save currentScriptId to localStorage:', e)
        }
    }

    // Set current script with both ID and title, and add to recent scripts
    const setCurrentScript = (id, title = null) => {
        const numericId = id ? parseInt(id, 10) : null
        const validId = numericId && !isNaN(numericId) ? numericId : null

        // Update current script id
        setCurrentScriptIdState(validId)
        setCurrentScriptTitleState(title)

        try {
            if (validId) {
                localStorage.setItem(SCRIPT_ID_KEY, validId.toString())
                if (title) {
                    localStorage.setItem(SCRIPT_TITLE_KEY, title)
                }

                // Add to recent scripts (deduplicate and limit)
                setRecentScriptsState(prev => {
                    const filtered = prev.filter(s => s.id !== validId)
                    const newRecent = [{ id: validId, title: title || `Script #${validId}` }, ...filtered]
                    return newRecent.slice(0, MAX_RECENT_SCRIPTS)
                })
            } else {
                localStorage.removeItem(SCRIPT_ID_KEY)
                localStorage.removeItem(SCRIPT_TITLE_KEY)
            }
        } catch (e) {
            console.warn('Failed to save script to localStorage:', e)
        }
    }

    // Clear recent scripts
    const clearRecentScripts = () => {
        setRecentScriptsState([])
        try {
            localStorage.removeItem(RECENT_SCRIPTS_KEY)
        } catch (e) {
            console.warn('Failed to clear recentScripts from localStorage:', e)
        }
    }

    const value = {
        currentScriptId,
        currentScriptTitle,
        recentScripts,
        setCurrentScriptId,
        setCurrentScript,
        clearRecentScripts
    }

    return (
        <ScriptContext.Provider value={value}>
            {children}
        </ScriptContext.Provider>
    )
}

/**
 * useScript - Hook to access current script context
 * 
 * @returns {{
 *   currentScriptId: number|null,
 *   currentScriptTitle: string|null,
 *   recentScripts: Array<{id: number, title: string}>,
 *   setCurrentScriptId: (id: number|null) => void,
 *   setCurrentScript: (id: number|null, title?: string) => void,
 *   clearRecentScripts: () => void
 * }}
 */
export function useScript() {
    const context = useContext(ScriptContext)
    if (!context) {
        throw new Error('useScript must be used within a ScriptProvider')
    }
    return context
}

export default ScriptContext
