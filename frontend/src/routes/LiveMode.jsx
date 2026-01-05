import React from 'react'
import { Link, useParams } from 'react-router-dom'

export default function LiveMode() {
    const { scriptId } = useParams()

    return (
        <div className="max-w-6xl mx-auto">
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
                    Live Interview Mode
                </h2>
                <p className="mt-2 text-gray-600">
                    Conduct your interview with live tracking and support (Script ID: {scriptId})
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Live Interview Support (Coming Soon)
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Track questions asked, monitor time elapsed/remaining, mark
                        questions as complete, and get AI follow-up suggestions.
                    </p>
                    <div className="mt-6">
                        <Link
                            to={`/export/${scriptId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            Export Interview Notes
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
