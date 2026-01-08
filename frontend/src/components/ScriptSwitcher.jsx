import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScript } from '../context/ScriptContext'
import { getScriptsList, getScript } from '../services/api'

/**
 * ScriptSwitcher - Dropdown component for switching between scripts
 */
export default function ScriptSwitcher() {
    const navigate = useNavigate()
    const { currentScriptId, currentScriptTitle, recentScripts, setCurrentScript } = useScript()

    const [isOpen, setIsOpen] = useState(false)
    const [scripts, setScripts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [openByIdValue, setOpenByIdValue] = useState('')
    const [openByIdError, setOpenByIdError] = useState(null)
    const [openingById, setOpeningById] = useState(false)

    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Fetch scripts when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchScripts()
        }
    }, [isOpen])

    const fetchScripts = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getScriptsList(5)
            setScripts(data.scripts || [])
        } catch (err) {
            setError(err.message)
            // Use recent scripts as fallback
            setScripts([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelectScript = (script) => {
        setCurrentScript(script.id, script.title)
        setIsOpen(false)
        navigate(`/script/${script.id}`)
    }

    const handleOpenById = async (e) => {
        e.preventDefault()

        const id = parseInt(openByIdValue, 10)
        if (isNaN(id) || id <= 0) {
            setOpenByIdError('Enter a valid ID')
            return
        }

        setOpeningById(true)
        setOpenByIdError(null)

        try {
            const data = await getScript(id)
            if (data.script) {
                setCurrentScript(id, data.script.title)
                setIsOpen(false)
                setOpenByIdValue('')
                navigate(`/script/${id}`)
            }
        } catch (err) {
            setOpenByIdError('Script not found')
        } finally {
            setOpeningById(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        } catch {
            return ''
        }
    }

    // Display text for button
    const displayText = currentScriptId
        ? currentScriptTitle
            ? `${currentScriptTitle.length > 20 ? currentScriptTitle.slice(0, 20) + '...' : currentScriptTitle}`
            : `Script #${currentScriptId}`
        : 'No script selected'

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                    transition-all duration-150 border
                    ${currentScriptId
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                    }
                `}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="max-w-[150px] truncate">{displayText}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden z-50 animate-fade-in">
                    {/* Recent Scripts Section */}
                    <div className="p-3 border-b border-stone-100">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                            Recent Scripts
                        </p>

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                                        <div className="w-8 h-8 bg-stone-100 rounded-lg" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-stone-100 rounded w-3/4 mb-1" />
                                            <div className="h-2 bg-stone-100 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div>
                                {recentScripts.length > 0 ? (
                                    <div className="space-y-1">
                                        {recentScripts.slice(0, 5).map(script => (
                                            <button
                                                key={script.id}
                                                onClick={() => handleSelectScript(script)}
                                                className={`
                                                    w-full flex items-center gap-3 p-2 rounded-lg text-left
                                                    transition-colors hover:bg-stone-50
                                                    ${script.id === currentScriptId ? 'bg-indigo-50' : ''}
                                                `}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                                    {script.id}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-stone-900 truncate">
                                                        {script.title}
                                                    </p>
                                                    <p className="text-xs text-stone-500">
                                                        From recent
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-stone-500 py-2">Failed to load scripts</p>
                                )}
                            </div>
                        ) : scripts.length > 0 ? (
                            <div className="space-y-1">
                                {scripts.map(script => (
                                    <button
                                        key={script.id}
                                        onClick={() => handleSelectScript(script)}
                                        className={`
                                            w-full flex items-center gap-3 p-2 rounded-lg text-left
                                            transition-colors hover:bg-stone-50
                                            ${script.id === currentScriptId ? 'bg-indigo-50' : ''}
                                        `}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                            {script.id}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-stone-900 truncate">
                                                {script.title}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {script.duration_minutes} min · {formatDate(script.created_at)}
                                            </p>
                                        </div>
                                        {script.id === currentScriptId && (
                                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-stone-500 py-2">No scripts found</p>
                        )}
                    </div>

                    {/* Open by ID Section */}
                    <div className="p-3 bg-stone-50">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                            Open by ID
                        </p>
                        <form onSubmit={handleOpenById} className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                value={openByIdValue}
                                onChange={(e) => {
                                    setOpenByIdValue(e.target.value)
                                    setOpenByIdError(null)
                                }}
                                placeholder="Script ID"
                                className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={openingById || !openByIdValue}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {openingById ? '...' : 'Open'}
                            </button>
                        </form>
                        {openByIdError && (
                            <p className="text-xs text-red-600 mt-1">{openByIdError}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
