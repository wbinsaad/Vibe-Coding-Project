import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function ScriptEditor() {
    const { scriptId } = useParams()

    return (
        <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <Link
                    to="/"
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
                    Back to Home
                </Link>
                <h2 className="text-3xl font-bold text-gray-900">
                    Script Editor
                </h2>
                <p className="mt-2 text-gray-600">
                    Edit and refine your interview script (Script ID: {scriptId})
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Script Editor (Coming Soon)
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        View and edit generated questions, add/delete/reorder questions,
                        and save your script draft.
                    </p>
                    <div className="mt-6 flex gap-3 justify-center">
                        <Link
                            to={`/live/${scriptId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            Start Live Interview
                        </Link>
                        <Link
                            to={`/export/${scriptId}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Export Script
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
