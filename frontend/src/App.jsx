import React from 'react'

export default function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Tailwind CSS v3 is Working! 🎉
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your Vite + React + Tailwind setup is ready to go
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h3 className="text-xl font-semibold">Vite</h3>
                        </div>
                        <p className="mt-2 text-blue-100">Lightning fast HMR and build tool</p>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <h3 className="text-xl font-semibold">React</h3>
                        </div>
                        <p className="mt-2 text-cyan-100">Component-based UI library</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-6 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <h3 className="text-xl font-semibold">Tailwind CSS</h3>
                        </div>
                        <p className="mt-2 text-indigo-100">Utility-first CSS framework</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 transform hover:scale-105 transition-transform duration-200 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-xl font-semibold">PostCSS</h3>
                        </div>
                        <p className="mt-2 text-purple-100">Modern CSS processing</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        Start Building
                    </button>
                    <button className="flex-1 bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        View Docs
                    </button>
                </div>

                {/* Footer Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                            ✓ Tailwind v3 Active
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                            ✓ React Installed
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                            ✓ Vite Configured
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
