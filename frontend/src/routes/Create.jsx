import React from 'react'
import { Link } from 'react-router-dom'

export default function Create() {
    return (
        <div className="max-w-4xl mx-auto">
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
                    Create Interview Script
                </h2>
                <p className="mt-2 text-gray-600">
                    Generate a structured interview script based on your research goals
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Research Input Form (Coming Soon)
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Input your research goal, target users, interview duration, and
                        interview type to generate a customized script.
                    </p>
                </div>
            </div>
        </div>
    )
}
