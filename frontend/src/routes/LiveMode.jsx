import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScript, getFollowups } from '../services/api'

export default function LiveMode() {
    const { scriptId } = useParams()

    // State
    const [script, setScript] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [followups, setFollowups] = useState([])
    const [loadingFollowups, setLoadingFollowups] = useState(false)
    const [followupError, setFollowupError] = useState(null)
    const [copiedIndex, setCopiedIndex] = useState(null)

    // Timer state (simplified - tracks elapsed time)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [timerRunning, setTimerRunning] = useState(false)

    // Load script
    useEffect(() => {
        loadScript()
    }, [scriptId])

    // Timer effect
    useEffect(() => {
        let interval
        if (timerRunning) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timerRunning])

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

    const handleGetFollowups = async () => {
        if (!script || !script.questions || script.questions.length === 0) return

        const currentQuestion = script.questions[currentQuestionIndex]

        setLoadingFollowups(true)
        setFollowupError(null)
        setFollowups([])

        try {
            // Calculate remaining minutes (if interview has duration)
            const durationMinutes = script.script?.duration_minutes || 60
            const elapsedMinutes = Math.floor(elapsedSeconds / 60)
            const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes)

            const payload = {
                script_id: parseInt(scriptId),
                question_id: currentQuestion.id,
                current_question_text: currentQuestion.text,
                research_goal: script.script?.research_goal || '',
                target_users: script.script?.target_users || '',
                interview_type: script.script?.interview_type || 'semi-structured',
                notes_context: currentQuestion.notes || '',
                remaining_minutes: remainingMinutes
            }

            const data = await getFollowups(payload)
            setFollowups(data.followups || [])
        } catch (err) {
            setFollowupError(err.message)
        } finally {
            setLoadingFollowups(false)
        }
    }

    const handleCopyFollowup = (followup, index) => {
        navigator.clipboard.writeText(followup)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const handleAddToScript = () => {
        alert('Coming next: Add to Script feature')
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading interview...</p>
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

    if (!script || !script.questions || script.questions.length === 0) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No questions found in this script.</p>
                </div>
            </div>
        )
    }

    const currentQuestion = script.questions[currentQuestionIndex]

    return (
        <div className="max-w-6xl mx-auto">
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
                    Live Interview Mode
                </h2>
                <p className="mt-2 text-gray-600">
                    {script.script?.title || 'Interview Script'}
                </p>
            </div>

            {/* Timer and Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm text-gray-500">Elapsed Time</div>
                        <div className="text-3xl font-bold text-gray-900">{formatTime(elapsedSeconds)}</div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setTimerRunning(!timerRunning)}
                            className={`px-4 py-2 rounded-md font-medium ${timerRunning
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {timerRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                            onClick={() => setElapsedSeconds(0)}
                            className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Question Progress</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {currentQuestionIndex + 1} / {script.questions.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Question */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full mb-2">
                            {currentQuestion.section}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {currentQuestion.text}
                        </h3>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(script.questions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === script.questions.length - 1}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Follow-up Suggestions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">AI Follow-up Suggestions</h4>
                    <button
                        onClick={handleGetFollowups}
                        disabled={loadingFollowups}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loadingFollowups ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </span>
                        ) : (
                            'Get Follow-ups'
                        )}
                    </button>
                </div>

                {followupError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-sm text-red-800">Error: {followupError}</p>
                    </div>
                )}

                {followups.length > 0 && (
                    <div className="space-y-3">
                        {followups.map((followup, index) => (
                            <div key={index} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
                                <p className="text-gray-900 mb-3">{followup}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopyFollowup(followup, index)}
                                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                                    >
                                        {copiedIndex === index ? '✓ Copied' : 'Copy'}
                                    </button>
                                    <button
                                        onClick={handleAddToScript}
                                        className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md font-medium transition-colors"
                                    >
                                        Add to Script
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loadingFollowups && followups.length === 0 && !followupError && (
                    <p className="text-gray-500 text-center py-8">
                        Click "Get Follow-ups" to generate AI-powered follow-up questions for this question.
                    </p>
                )}
            </div>
        </div>
    )
}
