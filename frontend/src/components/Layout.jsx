import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useScript } from '../context/ScriptContext'
import ScriptSwitcher from './ScriptSwitcher'

export default function Layout({ children }) {
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { currentScriptId } = useScript()

    // Navigation items with dynamic paths for script-dependent routes
    const navItems = [
        {
            name: 'Home',
            path: '/',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Create Script',
            path: '/create',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            )
        },
        {
            name: 'Script Editor',
            path: currentScriptId ? `/script/${currentScriptId}` : null,
            matchPrefix: '/script',
            requiresScript: true,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'Live Interview',
            path: currentScriptId ? `/live/${currentScriptId}` : null,
            matchPrefix: '/live',
            requiresScript: true,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Export',
            path: currentScriptId ? `/export/${currentScriptId}` : null,
            matchPrefix: '/export',
            requiresScript: true,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            )
        }
    ]

    const isActive = (item) => {
        if (item.matchPrefix) {
            return location.pathname.startsWith(item.matchPrefix)
        }
        return location.pathname === item.path
    }

    // Render a nav item - either as Link or disabled span
    const NavItem = ({ item, onClick, className }) => {
        const active = isActive(item)
        const disabled = item.requiresScript && !currentScriptId

        const baseClasses = `
            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
            transition-all duration-150
            ${active
                ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100'
                : disabled
                    ? 'text-stone-400 cursor-not-allowed'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }
            ${className || ''}
        `

        if (disabled) {
            return (
                <div className="group relative">
                    <span className={baseClasses}>
                        <span className={active ? 'text-indigo-600' : 'text-stone-300'}>
                            {item.icon}
                        </span>
                        {item.name}
                        <svg className="w-4 h-4 ml-auto text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </span>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-stone-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Create a script first
                    </div>
                </div>
            )
        }

        return (
            <Link
                to={item.path}
                onClick={onClick}
                className={baseClasses}
            >
                <span className={active ? 'text-indigo-600' : 'text-stone-400'}>
                    {item.icon}
                </span>
                {item.name}
                {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
            </Link>
        )
    }

    // Header nav item (simpler styling)
    const HeaderNavItem = ({ item }) => {
        const active = isActive(item)
        const disabled = item.requiresScript && !currentScriptId

        if (disabled) {
            return (
                <span
                    className="px-4 py-2 rounded-xl text-sm font-medium text-stone-400 cursor-not-allowed"
                    title="Create a script first"
                >
                    {item.name}
                </span>
            )
        }

        return (
            <Link
                to={item.path}
                className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                    ${active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }
                `}
            >
                {item.name}
            </Link>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                                        Interview Companion
                                    </h1>
                                    <p className="text-xs text-stone-500 -mt-0.5 hidden sm:block">
                                        AI-Powered Research Tool
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.slice(0, 3).map((item) => (
                                <HeaderNavItem key={item.name} item={item} />
                            ))}
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Script Switcher */}
                            <div className="hidden md:block">
                                <ScriptSwitcher />
                            </div>

                            <Link
                                to="/create"
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Script
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar Overlay (Mobile) */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-stone-900/20 backdrop-blur-sm lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`
                        fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] w-64
                        bg-white/80 backdrop-blur-md border-r border-stone-200/60
                        transform transition-transform duration-200 ease-out
                        lg:transform-none
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => (
                            <NavItem
                                key={item.name}
                                item={item}
                                onClick={() => setSidebarOpen(false)}
                            />
                        ))}
                    </nav>

                    {/* Sidebar Footer - Current Script */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100">
                        {currentScriptId ? (
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl">
                                <p className="text-xs font-medium text-indigo-900 mb-1">Current Script</p>
                                <p className="text-sm text-indigo-700 font-medium mb-2">
                                    Script #{currentScriptId}
                                </p>
                                <Link
                                    to={`/script/${currentScriptId}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Open Script
                                </Link>
                            </div>
                        ) : (
                            <div className="p-4 bg-stone-50 rounded-xl">
                                <p className="text-xs font-medium text-stone-500 mb-1">No Script Selected</p>
                                <p className="text-xs text-stone-400">
                                    Create or open a script to access editor, live mode, and export.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-stone-200/60 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-stone-500">
                            Interview Companion Tool © 2026
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-stone-400">
                                UX Design Master Project
                            </span>
                            <span className="text-xs px-2 py-1 bg-stone-100 text-stone-500 rounded-full">
                                v1.0.0
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
