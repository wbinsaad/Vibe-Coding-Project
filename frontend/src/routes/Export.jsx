import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScript, exportScript } from '../services/api'

export default function Export() {
    const { scriptId } = useParams()

    // State
    const [script, setScript] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedFormat, setSelectedFormat] = useState('json')
    const [exporting, setExporting] = useState(false)
    const [exportError, setExportError] = useState(null)
    const [copySuccess, setCopySuccess] = useState(false)

    // Load script metadata
    useEffect(() => {
        loadScript()
    }, [scriptId])

    const loadScript = async () => {
        try {
            setLoading(true)
            const data = await getScript(scriptId)
            setScript(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setExporting(true)
        setExportError(null)

        try {
            const data = await exportScript(scriptId, selectedFormat)

            if (selectedFormat === 'pdf') {
                // Download PDF blob
                const url = window.URL.createObjectURL(data)
                const a = document.createElement('a')
                a.href = url
                a.download = `script_${scriptId}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else if (selectedFormat === 'json') {
                // Download JSON
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `script_${scriptId}.json`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                // Download TEXT
                const blob = new Blob([data], { type: 'text/plain' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `script_${scriptId}.txt`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (err) {
            setExportError(err.message)
        } finally {
            setExporting(false)
        }
    }

    const handleCopy = async () => {
        if (selectedFormat === 'pdf') return // PDF can't be copied

        setExporting(true)
        setExportError(null)
        setCopySuccess(false)

        try {
            const data = await exportScript(scriptId, selectedFormat)

            const textToCopy = selectedFormat === 'json'
                ? JSON.stringify(data, null, 2)
                : data

            await navigator.clipboard.writeText(textToCopy)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 3000)
        } catch (err) {
            setExportError(err.message)
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading script...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            </div>
        )
    }

    if (!script) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Script not found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <Link
                    to={`/script/${scriptId}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Script Editor
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">
                    Export Interview Script
                </h2>
                <p className="mt-2 text-gray-600">
                    Download or copy your script in various formats
                </p>
            </div>

            {/* Script Metadata */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Script Details</h3>
                <div className="space-y-2">
                    <div>
                        <span className="font-medium text-gray-700">Title:</span>
                        <span className="ml-2 text-gray-900">{script.script?.title || 'Untitled Script'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Duration:</span>
                        <span className="ml-2 text-gray-900">{script.script?.duration_minutes || 60} minutes</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Interview Type:</span>
                        <span className="ml-2 text-gray-900 capitalize">{script.script?.interview_type || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Questions:</span>
                        <span className="ml-2 text-gray-900">{script.questions?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>

                {/* Format Selector */}
                <div className="mb-6">
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            onClick={() => setSelectedFormat('json')}
                            className={`p-4 border-2 rounded-lg transition-all ${selectedFormat === 'json'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">📄</div>
                                <div className={`font-medium ${selectedFormat === 'json' ? 'text-indigo-900' : 'text-gray-900'}`}>
                                    JSON
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Structured data</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setSelectedFormat('text')}
                            className={`p-4 border-2 rounded-lg transition-all ${selectedFormat === 'text'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">📝</div>
                                <div className={`font-medium ${selectedFormat === 'text' ? 'text-indigo-900' : 'text-gray-900'}`}>
                                    TEXT
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Human-readable</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setSelectedFormat('pdf')}
                            className={`p-4 border-2 rounded-lg transition-all ${selectedFormat === 'pdf'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">📋</div>
                                <div className={`font-medium ${selectedFormat === 'pdf' ? 'text-indigo-900' : 'text-gray-900'}`}>
                                    PDF
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Print-ready</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {copySuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-green-800 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Copied to clipboard!
                        </p>
                    </div>
                )}

                {exportError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800">Error: {exportError}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={exporting}
                        className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {exporting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download {selectedFormat.toUpperCase()}
                            </span>
                        )}
                    </button>

                    {selectedFormat !== 'pdf' && (
                        <button
                            onClick={handleCopy}
                            disabled={exporting}
                            className="flex-1 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md font-medium hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy to Clipboard
                            </span>
                        </button>
                    )}
                </div>

                {/* Format Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">About {selectedFormat.toUpperCase()} format:</h4>
                    <p className="text-sm text-gray-600">
                        {selectedFormat === 'json' && 'Structured JSON format ideal for importing into other tools or for programmatic access.'}
                        {selectedFormat === 'text' && 'Human-readable plain text format with sections and formatting, suitable for viewing or editing.'}
                        {selectedFormat === 'pdf' && 'Professional PDF format with formatted layout, perfect for printing or sharing as a document.'}
                    </p>
                </div>
            </div>
        </div>
    )
}
