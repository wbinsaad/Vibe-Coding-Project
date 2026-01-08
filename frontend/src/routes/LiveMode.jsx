import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScript, getFollowups, addQuestionFromFollowup, saveNote } from '../services/api'
import { useToast } from '../components/Toast'
import { useScript } from '../context/ScriptContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export default function LiveMode() {
    const { scriptId } = useParams()
    const toast = useToast()
    const { setCurrentScript } = useScript()

    // State
    const [script, setScript] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [followups, setFollowups] = useState([])
    const [loadingFollowups, setLoadingFollowups] = useState(false)
    const [followupError, setFollowupError] = useState(null)
    const [copiedIndex, setCopiedIndex] = useState(null)
    const [addingToScript, setAddingToScript] = useState(false)
    const [successMessage, setSuccessMessage] = useState(null)
    const [notes, setNotes] = useState({})
    const [savingNote, setSavingNote] = useState(false)
    const [noteError, setNoteError] = useState(null)
    const [noteSaved, setNoteSaved] = useState(false)
    const debounceTimerRef = useRef(null)

    // Timer state (simplified - tracks elapsed time)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [timerRunning, setTimerRunning] = useState(false)

    // Load script
    useEffect(() => {
        loadScript()
        // Cleanup debounce timer on unmount
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
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

            // Update current script ID and title for navigation
            setCurrentScript(scriptId, data.script?.title)

            // Initialize notes from loaded questions
            const initialNotes = {}
            data.questions.forEach(q => {
                if (q.notes && q.notes.length > 0) {
                    initialNotes[q.id] = q.notes[0].content || ''
                } else {
                    initialNotes[q.id] = ''
                }
            })
            setNotes(initialNotes)
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
            if (data.followups && data.followups.length > 0) {
                toast.success(`Generated ${data.followups.length} follow-up suggestion${data.followups.length !== 1 ? 's' : ''}`)
            }
        } catch (err) {
            setFollowupError(err.message)
            toast.error(`Follow-up generation failed: ${err.message}`)
        } finally {
            setLoadingFollowups(false)
        }
    }

    const handleCopyFollowup = (followup, index) => {
        navigator.clipboard.writeText(followup)
        setCopiedIndex(index)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const handleCopyQuestion = () => {
        const currentQuestion = script.questions[currentQuestionIndex]
        navigator.clipboard.writeText(currentQuestion.text)
        toast.success('Question copied!')
    }

    const handleAddToScript = async (followupText) => {
        setAddingToScript(true)
        setSuccessMessage(null)

        try {
            // Add question to script
            await addQuestionFromFollowup(scriptId, {
                section: 'main',
                text: followupText
            })

            // Refetch script to get updated questions
            const data = await getScript(scriptId)
            setScript(data)

            // Show success message
            setSuccessMessage('Added to script')
            toast.success('Question added to script!')
            setTimeout(() => setSuccessMessage(null), 3000)

            // Clear followups
            setFollowups([])
        } catch (err) {
            setFollowupError(`Failed to add to script: ${err.message}`)
            toast.error(`Failed to add to script: ${err.message}`)
        } finally {
            setAddingToScript(false)
        }
    }

    const handleNoteChange = (questionId, newContent) => {
        // Update local state immediately
        setNotes(prev => ({
            ...prev,
            [questionId]: newContent
        }))
        setNoteSaved(false)

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Set new timer for auto-save (800ms debounce)
        debounceTimerRef.current = setTimeout(async () => {
            if (!newContent.trim()) {
                // Don't save empty notes
                return
            }

            try {
                setSavingNote(true)
                setNoteError(null)
                await saveNote(questionId, newContent)
                setNoteSaved(true)
                // Successfully saved
            } catch (err) {
                setNoteError(`Failed to save note: ${err.message}`)
                setTimeout(() => setNoteError(null), 5000)
            } finally {
                setSavingNote(false)
            }
        }, 800)
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Calculate progress percentage
    const getProgressPercentage = () => {
        const durationMinutes = script?.script?.duration_minutes || 60
        const totalSeconds = durationMinutes * 60
        return Math.min((elapsedSeconds / totalSeconds) * 100, 100)
    }

    const getRemainingTime = () => {
        const durationMinutes = script?.script?.duration_minutes || 60
        const totalSeconds = durationMinutes * 60
        const remaining = Math.max(0, totalSeconds - elapsedSeconds)
        return formatTime(remaining)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-stone-600 text-lg">Preparing interview...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <Card padding="lg" className="max-w-lg mx-auto mt-12">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 mb-2">Error Loading Interview</h3>
                    <p className="text-stone-600 mb-6">{error}</p>
                    <Link to="/">
                        <Button variant="secondary">Back to Home</Button>
                    </Link>
                </div>
            </Card>
        )
    }

    if (!script || !script.questions || script.questions.length === 0) {
        return (
            <Card padding="lg" className="max-w-lg mx-auto mt-12">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 mb-2">No Questions Found</h3>
                    <p className="text-stone-600 mb-6">This script doesn't have any questions yet.</p>
                    <Link to={`/script/${scriptId}`}>
                        <Button variant="primary">Go to Script Editor</Button>
                    </Link>
                </div>
            </Card>
        )
    }

    const currentQuestion = script.questions[currentQuestionIndex]
    const progressPercentage = getProgressPercentage()
    const questionProgress = ((currentQuestionIndex + 1) / script.questions.length) * 100

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Link
                        to={`/script/${scriptId}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-2 transition-colors group"
                    >
                        <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Exit Interview
                    </Link>
                    <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timerRunning ? 'bg-red-400' : 'bg-stone-300'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${timerRunning ? 'bg-red-500' : 'bg-stone-400'}`}></span>
                        </span>
                        Live Interview
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">{script.script?.title || 'Interview Script'}</p>
                </div>
                <Link to={`/export/${scriptId}`}>
                    <Button variant="ghost" size="sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </Button>
                </Link>
            </div>

            {/* Timer Card - Sticky */}
            <Card padding="md" className="sticky top-20 z-20 bg-white/95 backdrop-blur-sm border-stone-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Timer Display */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Elapsed</p>
                            <p className="text-3xl font-mono font-bold text-stone-900">{formatTime(elapsedSeconds)}</p>
                        </div>
                        <div className="h-10 w-px bg-stone-200" />
                        <div className="text-center">
                            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Remaining</p>
                            <p className={`text-3xl font-mono font-bold ${progressPercentage > 90 ? 'text-red-600' : 'text-stone-600'}`}>
                                {getRemainingTime()}
                            </p>
                        </div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant={timerRunning ? 'destructive' : 'primary'}
                            onClick={() => setTimerRunning(!timerRunning)}
                        >
                            {timerRunning ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pause
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Start
                                </>
                            )}
                        </Button>
                        <Button variant="ghost" onClick={() => setElapsedSeconds(0)}>
                            Reset
                        </Button>
                    </div>

                    {/* Question Progress */}
                    <div className="hidden md:block text-right">
                        <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Progress</p>
                        <p className="text-2xl font-bold text-stone-900">
                            {currentQuestionIndex + 1}<span className="text-stone-400 text-lg">/{script.questions.length}</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-stone-500">
                        <span>Time Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${progressPercentage > 90 ? 'bg-red-500' : progressPercentage > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* Main Content - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Question List */}
                <div className="lg:col-span-4">
                    <Card padding="sm" className="sticky top-52">
                        <div className="px-4 py-3 border-b border-stone-100">
                            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                Questions
                            </h3>
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto p-2">
                            <div className="space-y-1.5">
                                {script.questions.map((q, index) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`w-full text-left p-3 rounded-xl transition-all ${index === currentQuestionIndex
                                            ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border-2 border-indigo-200 shadow-sm'
                                            : 'hover:bg-stone-50 border-2 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${index === currentQuestionIndex
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-stone-200 text-stone-600'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <Badge variant={index === currentQuestionIndex ? 'primary' : 'default'} size="sm" className="mb-1">
                                                    {q.section}
                                                </Badge>
                                                <p className={`text-sm line-clamp-2 ${index === currentQuestionIndex ? 'text-indigo-900 font-medium' : 'text-stone-600'}`}>
                                                    {q.text}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Question Progress Bar */}
                        <div className="px-4 py-3 border-t border-stone-100">
                            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 rounded-full"
                                    style={{ width: `${questionProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-stone-500 mt-2 text-center">
                                {currentQuestionIndex + 1} of {script.questions.length} questions
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Active Question + Notes + Followups */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Active Question Card */}
                    <Card padding="lg" className="border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                        <div className="mb-4">
                            <Badge variant="primary" className="mb-3">{currentQuestion.section}</Badge>
                            <h2 className="text-2xl font-bold text-stone-900 leading-relaxed">
                                {currentQuestion.text}
                            </h2>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-200/50">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCopyQuestion}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleGetFollowups}
                                disabled={loadingFollowups}
                                loading={loadingFollowups}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                {loadingFollowups ? 'Generating...' : 'Get Follow-ups'}
                            </Button>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-200/50">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setCurrentQuestionIndex(prev => Math.min(script.questions.length - 1, prev + 1))}
                                disabled={currentQuestionIndex === script.questions.length - 1}
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Button>
                        </div>
                    </Card>

                    {/* Notes Card */}
                    <Card padding="md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Interview Notes
                            </h3>
                            <div className="flex items-center gap-2">
                                {savingNote && (
                                    <span className="flex items-center gap-1.5 text-sm text-stone-500">
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                )}
                                {noteSaved && !savingNote && (
                                    <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Saved
                                    </span>
                                )}
                            </div>
                        </div>

                        {noteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700">{noteError}</p>
                            </div>
                        )}

                        <textarea
                            value={notes[currentQuestion.id] || ''}
                            onChange={(e) => handleNoteChange(currentQuestion.id, e.target.value)}
                            placeholder="Capture key insights, observations, and participant responses..."
                            className="w-full h-32 px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-stone-700 placeholder:text-stone-400"
                        />
                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Notes auto-save after you stop typing
                        </p>
                    </Card>

                    {/* Follow-ups Card */}
                    <Card padding="md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI Follow-up Suggestions
                            </h3>
                            {followups.length > 0 && (
                                <Badge variant="success">{followups.length} suggestions</Badge>
                            )}
                        </div>

                        {followupError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-700">{followupError}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <p className="text-sm text-emerald-700 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        {/* Loading Skeleton */}
                        {loadingFollowups && (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse p-4 bg-stone-50 rounded-xl">
                                        <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Follow-up List */}
                        {!loadingFollowups && followups.length > 0 && (
                            <div className="space-y-3">
                                {followups.map((followup, index) => (
                                    <div key={index} className="p-4 bg-violet-50/50 border border-violet-100 rounded-xl hover:bg-violet-50 transition-colors">
                                        <p className="text-stone-700 mb-3 leading-relaxed">{followup}</p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyFollowup(followup, index)}
                                            >
                                                {copiedIndex === index ? (
                                                    <>
                                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        Copy
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleAddToScript(followup)}
                                                disabled={addingToScript}
                                                loading={addingToScript}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add to Script
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loadingFollowups && followups.length === 0 && !followupError && (
                            <div className="text-center py-12 px-4">
                                <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="text-stone-700 font-medium mb-1">No follow-ups yet</h4>
                                <p className="text-stone-500 text-sm max-w-xs mx-auto">
                                    Click "Get Follow-ups" to generate AI-powered suggestions based on the current question.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
