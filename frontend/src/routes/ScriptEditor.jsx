import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScript, updateQuestion, createQuestion, deleteQuestion, reorderQuestions, runChecks, clearFlags } from '../services/api'

export default function ScriptEditor() {
    const { scriptId } = useParams()

    // State
    const [script, setScript] = useState(null)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Editing state
    const [editingQuestionId, setEditingQuestionId] = useState(null)
    const [editText, setEditText] = useState('')
    const [savingQuestionId, setSavingQuestionId] = useState(null)
    const [editError, setEditError] = useState('')

    // Adding state
    const [addingSection, setAddingSection] = useState(null)
    const [newQuestionText, setNewQuestionText] = useState('')
    const [creatingQuestion, setCreatingQuestion] = useState(false)
    const [addError, setAddError] = useState('')

    // Quality checks state
    const [runningChecks, setRunningChecks] = useState(false)
    const [flagCounts, setFlagCounts] = useState({ bias: 0, alignment: 0 })

    // Fetch script on mount
    useEffect(() => {
        async function fetchScript() {
            try {
                setLoading(true)
                const data = await getScript(scriptId)
                setScript(data.script)
                setQuestions(data.questions)

                // Calculate flag counts
                calculateFlagCounts(data.questions)
            } catch (err) {
                setError(err.message || 'Failed to load script')
            } finally {
                setLoading(false)
            }
        }

        fetchScript()
    }, [scriptId])

    // Calculate flag counts from questions
    const calculateFlagCounts = (questionsList) => {
        let bias = 0
        let alignment = 0

        questionsList.forEach(q => {
            if (q.flags) {
                q.flags.forEach(flag => {
                    if (flag.type === 'bias') bias++
                    else if (flag.type === 'alignment') alignment++
                })
            }
        })

        setFlagCounts({ bias, alignment })
    }

    // Run quality checks
    const handleRunChecks = async () => {
        setRunningChecks(true)

        try {
            // Run checks
            await runChecks(scriptId)

            // Refetch script to get updated flags
            const data = await getScript(scriptId)
            setQuestions(data.questions)
            calculateFlagCounts(data.questions)

        } catch (err) {
            alert(`Failed to run checks: ${err.message}`)
        } finally {
            setRunningChecks(false)
        }
    }

    // Start editing a question
    const handleEdit = (question) => {
        setEditingQuestionId(question.id)
        setEditText(question.text)
        setEditError('')
    }

    // Cancel editing
    const handleCancel = () => {
        setEditingQuestionId(null)
        setEditText('')
        setEditError('')
    }

    // Save edited question
    const handleSave = async (questionId) => {
        // Validate
        if (!editText.trim()) {
            setEditError('Question text cannot be empty')
            return
        }

        setSavingQuestionId(questionId)
        setEditError('')

        try {
            // Call API to update question text
            const result = await updateQuestion(questionId, {
                text: editText.trim()
            })

            // Clear flags for this question via API
            await clearFlags(questionId)

            // Update local state - update question text and remove flags
            setQuestions(prevQuestions =>
                prevQuestions.map(q =>
                    q.id === questionId ? { ...q, ...result.question, flags: [] } : q
                )
            )

            // Recalculate flag counts
            const updatedQuestions = questions.map(q =>
                q.id === questionId ? { ...q, flags: [] } : q
            )
            calculateFlagCounts(updatedQuestions)

            // Exit edit mode
            setEditingQuestionId(null)
            setEditText('')
        } catch (err) {
            setEditError(err.message || 'Failed to save question')
        } finally {
            setSavingQuestionId(null)
        }
    }

    // Start adding a question
    const handleAddQuestion = (section) => {
        setAddingSection(section)
        setNewQuestionText('')
        setAddError('')
    }

    // Cancel adding
    const handleCancelAdd = () => {
        setAddingSection(null)
        setNewQuestionText('')
        setAddError('')
    }

    // Save new question
    const handleSaveNew = async (section) => {
        // Validate
        if (!newQuestionText.trim()) {
            setAddError('Question text cannot be empty')
            return
        }

        setCreatingQuestion(true)
        setAddError('')

        try {
            // Call API
            const result = await createQuestion({
                script_id: parseInt(scriptId),
                section: section,
                text: newQuestionText.trim()
            })

            // Add to local state
            setQuestions(prevQuestions => [...prevQuestions, result.question])

            // Close add form
            setAddingSection(null)
            setNewQuestionText('')
        } catch (err) {
            setAddError(err.message || 'Failed to create question')
        } finally {
            setCreatingQuestion(false)
        }
    }

    // Apply suggestion from flag
    const handleApplySuggestion = async (questionId, suggestionText) => {
        try {
            // Call API to update question text
            await updateQuestion(questionId, {
                text: suggestionText
            })

            // Clear flags for this question via API
            await clearFlags(questionId)

            // Update local state - update text and remove flags
            setQuestions(prevQuestions =>
                prevQuestions.map(q =>
                    q.id === questionId
                        ? { ...q, text: suggestionText, flags: [] }
                        : q
                )
            )

            // Recalculate flag counts
            const updatedQuestions = questions.map(q =>
                q.id === questionId ? { ...q, flags: [] } : q
            )
            calculateFlagCounts(updatedQuestions)
        } catch (err) {
            alert(`Failed to apply suggestion: ${err.message}`)
        }
    }

    // Delete question
    const handleDelete = async (questionId, questionText) => {
        // Confirm deletion
        const confirmed = window.confirm(
            `Are you sure you want to delete this question?\n\n"${questionText.substring(0, 100)}..."`
        )

        if (!confirmed) return

        try {
            // Call API
            await deleteQuestion(questionId)

            // Remove from local state
            const updatedQuestions = questions.filter(q => q.id !== questionId)
            setQuestions(updatedQuestions)
            calculateFlagCounts(updatedQuestions)
        } catch (err) {
            alert(`Failed to delete question: ${err.message}`)
        }
    }

    // Move question up within its section
    const handleMoveUp = async (question, sectionQuestions, sectionIndex) => {
        if (sectionIndex === 0) return // Already at top

        // Get the question above
        const aboveQuestion = sectionQuestions[sectionIndex - 1]

        // Create new questions array with swapped positions
        const updatedQuestions = questions.map(q => {
            if (q.id === question.id) {
                return { ...q, order_index: aboveQuestion.order_index }
            } else if (q.id === aboveQuestion.id) {
                return { ...q, order_index: question.order_index }
            }
            return q
        })

        // Sort by order_index and reassign sequential order_index (0..N-1)
        const sortedQuestions = [...updatedQuestions].sort((a, b) => a.order_index - b.order_index)
        sortedQuestions.forEach((q, idx) => {
            q.order_index = idx
        })

        // Update local state immediately
        setQuestions(sortedQuestions)

        // Call API to persist
        try {
            await reorderQuestions(scriptId, {
                question_order: sortedQuestions.map(q => ({
                    question_id: q.id,
                    order_index: q.order_index
                }))
            })
        } catch (err) {
            alert(`Failed to reorder: ${err.message}`)
            // Revert on error by refetching
            const data = await getScript(scriptId)
            setQuestions(data.questions)
        }
    }

    // Move question down within its section
    const handleMoveDown = async (question, sectionQuestions, sectionIndex) => {
        if (sectionIndex === sectionQuestions.length - 1) return // Already at bottom

        // Get the question below
        const belowQuestion = sectionQuestions[sectionIndex + 1]

        // Create new questions array with swapped positions
        const updatedQuestions = questions.map(q => {
            if (q.id === question.id) {
                return { ...q, order_index: belowQuestion.order_index }
            } else if (q.id === belowQuestion.id) {
                return { ...q, order_index: question.order_index }
            }
            return q
        })

        // Sort by order_index and reassign sequential order_index (0..N-1)
        const sortedQuestions = [...updatedQuestions].sort((a, b) => a.order_index - b.order_index)
        sortedQuestions.forEach((q, idx) => {
            q.order_index = idx
        })

        // Update local state immediately
        setQuestions(sortedQuestions)

        // Call API to persist
        try {
            await reorderQuestions(scriptId, {
                question_order: sortedQuestions.map(q => ({
                    question_id: q.id,
                    order_index: q.order_index
                }))
            })
        } catch (err) {
            alert(`Failed to reorder: ${err.message}`)
            // Revert on error by refetching
            const data = await getScript(scriptId)
            setQuestions(data.questions)
        }
    }

    // Group questions by section
    const questionsBySection = {
        intro: questions.filter(q => q.section === 'intro'),
        warmup: questions.filter(q => q.section === 'warmup'),
        main: questions.filter(q => q.section === 'main'),
        closing: questions.filter(q => q.section === 'closing')
    }

    const sectionInfo = {
        intro: { title: 'Introduction', color: 'blue', icon: '👋' },
        warmup: { title: 'Warm-up', color: 'green', icon: '🌱' },
        main: { title: 'Main Questions', color: 'indigo', icon: '💬' },
        closing: { title: 'Closing', color: 'purple', icon: '🎯' }
    }

    // Get severity color classes
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-50 border-red-200 text-red-800'
            case 'medium':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800'
            case 'low':
                return 'bg-blue-50 border-blue-200 text-blue-800'
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800'
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 text-lg">Loading script...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Script</h3>
                            <p className="mt-2 text-sm text-red-700">{error}</p>
                            <div className="mt-4">
                                <Link to="/" className="text-sm font-medium text-red-800 hover:text-red-900">
                                    ← Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

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
                    {script.title}
                </h2>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {script.duration_minutes} minutes
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {script.interview_type}
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {questions.length} questions
                    </div>
                    {/* Flag counts summary */}
                    {(flagCounts.bias > 0 || flagCounts.alignment > 0) && (
                        <div className="flex items-center font-medium">
                            <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Bias: {flagCounts.bias} | Alignment: {flagCounts.alignment}
                        </div>
                    )}
                </div>
            </div>

            {/* Script Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Goal</h3>
                <p className="text-gray-700 mb-4">{script.research_goal}</p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Users</h3>
                <p className="text-gray-700">{script.target_users}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
                <button
                    onClick={handleRunChecks}
                    disabled={runningChecks}
                    className={`inline-flex items-center px-4 py-2 font-medium rounded-md transition-colors shadow-md ${runningChecks
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                >
                    {runningChecks ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Running Checks...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Run Checks
                        </>
                    )}
                </button>
                <Link
                    to={`/live/${scriptId}`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Live Interview
                </Link>
                <Link
                    to={`/export/${scriptId}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Script
                </Link>
            </div>

            {/* Questions by Section */}
            <div className="space-y-8">
                {Object.entries(questionsBySection).map(([section, sectionQuestions]) => {
                    const info = sectionInfo[section]
                    const isAddingHere = addingSection === section

                    return (
                        <div key={section} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className={`bg-${info.color}-50 border-l-4 border-${info.color}-500 px-6 py-4`}>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                    <span className="text-2xl mr-3">{info.icon}</span>
                                    {info.title}
                                    <span className="ml-3 text-sm font-normal text-gray-600">
                                        ({sectionQuestions.length} {sectionQuestions.length === 1 ? 'question' : 'questions'})
                                    </span>
                                </h3>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {sectionQuestions.map((question, index) => {
                                    const isEditing = editingQuestionId === question.id
                                    const isSaving = savingQuestionId === question.id
                                    const isFirst = index === 0
                                    const isLast = index === sectionQuestions.length - 1

                                    return (
                                        <div key={question.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                {/* Up/Down buttons */}
                                                <div className="flex-shrink-0 flex flex-col gap-1">
                                                    <button
                                                        onClick={() => handleMoveUp(question, sectionQuestions, index)}
                                                        disabled={isFirst}
                                                        className={`p-1 rounded ${isFirst
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                                            }`}
                                                        title="Move up"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveDown(question, sectionQuestions, index)}
                                                        disabled={isLast}
                                                        className={`p-1 rounded ${isLast
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                                            }`}
                                                        title="Move down"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-gray-700 font-medium text-sm">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    {isEditing ? (
                                                        // Edit Mode
                                                        <div className="space-y-3">
                                                            <textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                                rows="3"
                                                                disabled={isSaving}
                                                            />

                                                            {editError && (
                                                                <p className="text-sm text-red-600">{editError}</p>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSave(question.id)}
                                                                    disabled={isSaving}
                                                                    className={`px-4 py-2 rounded-md text-sm font-medium ${isSaving
                                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                                        }`}
                                                                >
                                                                    {isSaving ? (
                                                                        <span className="flex items-center">
                                                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                            </svg>
                                                                            Saving...
                                                                        </span>
                                                                    ) : (
                                                                        'Save'
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={handleCancel}
                                                                    disabled={isSaving}
                                                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Normal View
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4">
                                                                <p className="text-gray-900 flex-1">{question.text}</p>
                                                                <div className="flex-shrink-0 flex gap-2">
                                                                    <button
                                                                        onClick={() => handleEdit(question)}
                                                                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(question.id, question.text)}
                                                                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Show flags if any */}
                                                            {question.flags && question.flags.length > 0 && (
                                                                <div className="mt-3 space-y-2">
                                                                    {question.flags.map((flag, idx) => (
                                                                        <div key={idx} className={`border rounded-lg p-4 ${getSeverityColor(flag.severity)}`}>
                                                                            <div className="flex items-start justify-between gap-4">
                                                                                <div className="flex-1 space-y-2">

                                                                                    {/* Header with badges */}
                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide bg-white bg-opacity-60">
                                                                                            {flag.type === 'bias' ? 'Bias' : 'Alignment'}
                                                                                        </span>
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white bg-opacity-40">
                                                                                            {flag.severity}
                                                                                        </span>
                                                                                    </div>

                                                                                    {/* Explanation */}
                                                                                    <p className="text-sm leading-relaxed">{flag.explanation}</p>

                                                                                    {/* Suggestion rewrite in lighter block */}
                                                                                    {flag.suggestion_rewrite && (
                                                                                        <div className="mt-3 p-3 rounded bg-white bg-opacity-50 border border-current border-opacity-20">
                                                                                            <p className="text-xs font-semibold mb-1.5 opacity-75">Suggested rewrite:</p>
                                                                                            <p className="text-sm italic leading-relaxed">"{flag.suggestion_rewrite}"</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {/* Apply button */}
                                                                                {flag.suggestion_rewrite && (
                                                                                    <button
                                                                                        onClick={() => handleApplySuggestion(question.id, flag.suggestion_rewrite)}
                                                                                        className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md bg-white bg-opacity-80 hover:bg-opacity-100 shadow-sm transition-all hover:shadow-md"
                                                                                        title="Apply this suggestion"
                                                                                    >
                                                                                        Apply
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}

                                                                    {/* Note about re-running checks */}
                                                                    <p className="text-xs text-gray-500 italic pl-1">
                                                                        Note: Re-run checks after making edits to see updated results
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Show notes if any */}
                                                            {question.notes && question.notes.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {question.notes.map((note, idx) => (
                                                                        <div key={idx} className="text-sm text-blue-700 bg-blue-50 rounded px-2 py-1">
                                                                            📝 {note.content}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Add Question Form */}
                                {isAddingHere ? (
                                    <div className="px-6 py-4 bg-gray-50">
                                        <div className="flex items-start">
                                            <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-200 text-green-700 font-medium text-sm mr-4">
                                                +
                                            </span>
                                            <div className="flex-1 space-y-3">
                                                <textarea
                                                    value={newQuestionText}
                                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    rows="3"
                                                    placeholder="Enter new question text..."
                                                    disabled={creatingQuestion}
                                                    autoFocus
                                                />

                                                {addError && (
                                                    <p className="text-sm text-red-600">{addError}</p>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveNew(section)}
                                                        disabled={creatingQuestion}
                                                        className={`px-4 py-2 rounded-md text-sm font-medium ${creatingQuestion
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-green-600 text-white hover:bg-green-700'
                                                            }`}
                                                    >
                                                        {creatingQuestion ? (
                                                            <span className="flex items-center">
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Creating...
                                                            </span>
                                                        ) : (
                                                            'Save Question'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={handleCancelAdd}
                                                        disabled={creatingQuestion}
                                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Add Question Button
                                    <div className="px-6 py-3 bg-gray-50">
                                        <button
                                            onClick={() => handleAddQuestion(section)}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Question
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
