import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function Export() {
    const { scriptId } = useParams()

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <Link
                    to={`/script/${scriptId}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium mb-4 transition-colors"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Back to Script Editor
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">
                    Export Interview Script
                </h2>
                <p className="mt-2 text-gray-600">
                    Download or copy your interview script and notes (Script ID: {scriptId})
                </p>
            </div>

            {/* Placeholder Content */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Export Options (Coming Soon)
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Export your interview script and notes in multiple formats: TEXT,
                        JSON, or PDF.
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                            Download as PDF
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                            Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
