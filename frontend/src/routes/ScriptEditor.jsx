import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getScript, updateQuestion, createQuestion, deleteQuestion, reorderQuestions, runChecks, clearFlags } from '../services/api'
import { useToast } from '../components/Toast'
import { useScript } from '../context/ScriptContext'
import { usePageTitle, formatScriptTitle } from '../hooks/usePageTitle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export default function ScriptEditor() {
    const { scriptId } = useParams()
    const toast = useToast()
    const { setCurrentScript, currentScriptTitle } = useScript()

    // Set page title dynamically
    usePageTitle(formatScriptTitle('Script Editor', scriptId, currentScriptTitle))


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

    // Expanded flags state
    const [expandedFlags, setExpandedFlags] = useState({})

    // Fetch script on mount
    useEffect(() => {
        async function fetchScript() {
            try {
                setLoading(true)
                const data = await getScript(scriptId)
                setScript(data.script)
                setQuestions(data.questions)

                // Update current script ID and title for navigation
                setCurrentScript(scriptId, data.script?.title)

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

            // Show success toast with flag count
            const totalFlags = data.questions.reduce((sum, q) => sum + (q.flags?.length || 0), 0)
            if (totalFlags > 0) {
                toast.info(`Checks complete: ${totalFlags} issue${totalFlags !== 1 ? 's' : ''} found`)
            } else {
                toast.success('Checks complete: No issues found!')
            }

        } catch (err) {
            toast.error(`Failed to run checks: ${err.message}`)
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

    // Toggle flag visibility
    const toggleFlags = (questionId) => {
        setExpandedFlags(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }))
    }

    // Group questions by section
    const questionsBySection = {
        intro: questions.filter(q => q.section === 'intro'),
        warmup: questions.filter(q => q.section === 'warmup'),
        main: questions.filter(q => q.section === 'main'),
        closing: questions.filter(q => q.section === 'closing')
    }

    const sectionInfo = {
        intro: {
            title: 'Introduction',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-cyan-500'
        },
        warmup: {
            title: 'Warm-up',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            gradient: 'from-emerald-500 to-teal-500'
        },
        main: {
            title: 'Main Questions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            gradient: 'from-indigo-500 to-violet-500'
        },
        closing: {
            title: 'Closing',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-purple-500 to-pink-500'
        }
    }

    // Get severity styles
    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'high':
                return { badge: 'danger', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }
            case 'medium':
                return { badge: 'warning', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' }
            case 'low':
                return { badge: 'info', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' }
            default:
                return { badge: 'default', bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' }
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-stone-600 text-lg">Loading script...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <Card padding="lg" className="max-w-lg mx-auto mt-12">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900 mb-2">Error Loading Script</h3>
                    <p className="text-stone-600 mb-6">{error}</p>
                    <Link to="/">
                        <Button variant="secondary">Back to Home</Button>
                    </Link>
                </div>
            </Card>
        )
    }

    const totalFlags = flagCounts.bias + flagCounts.alignment

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <Link
                    to="/"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors group"
                >
                    <svg className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                    {script.title}
                </h1>
            </div>

            {/* Summary Card */}
            <Card padding="md">
                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-stone-700">{script.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium text-stone-700 capitalize">{script.interview_type}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <span className="font-medium text-stone-700">{questions.length} questions</span>
                    </div>
                    {totalFlags > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="font-medium text-amber-700">{totalFlags} issues</span>
                        </div>
                    )}
                </div>

                {/* Research Goal & Target Users */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Research Goal</h3>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{script.research_goal}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Target Users</h3>
                        </div>
                        <p className="text-stone-700 leading-relaxed">{script.target_users}</p>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <Button
                    variant="secondary"
                    onClick={handleRunChecks}
                    disabled={runningChecks}
                    loading={runningChecks}
                    className="!bg-amber-50 !text-amber-700 !border-amber-200 hover:!bg-amber-100"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {runningChecks ? 'Running...' : 'Run Checks'}
                </Button>
                <Link to={`/live/${scriptId}`}>
                    <Button variant="primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Live Interview
                    </Button>
                </Link>
                <Link to={`/export/${scriptId}`}>
                    <Button variant="ghost">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </Button>
                </Link>
            </div>

            {/* Questions by Section */}
            <div className="space-y-6">
                {Object.entries(questionsBySection).map(([section, sectionQuestions]) => {
                    const info = sectionInfo[section]
                    const isAddingHere = addingSection === section

                    return (
                        <Card key={section} padding="sm" className="overflow-hidden">
                            {/* Section Header */}
                            <div className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${info.gradient} text-white rounded-t-xl -mx-4 -mt-4 mb-4`}>
                                <div className="p-2 bg-white/20 rounded-lg">
                                    {info.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{info.title}</h3>
                                    <p className="text-sm text-white/80">
                                        {sectionQuestions.length} {sectionQuestions.length === 1 ? 'question' : 'questions'}
                                    </p>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="divide-y divide-stone-100">
                                {sectionQuestions.map((question, index) => {
                                    const isEditing = editingQuestionId === question.id
                                    const isSaving = savingQuestionId === question.id
                                    const isFirst = index === 0
                                    const isLast = index === sectionQuestions.length - 1
                                    const hasFlags = question.flags && question.flags.length > 0
                                    const isFlagsExpanded = expandedFlags[question.id] ?? true

                                    return (
                                        <div key={question.id} className="px-4 py-4 hover:bg-stone-50/50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                {/* Reorder Buttons */}
                                                <div className="flex-shrink-0 flex flex-col gap-0.5 pt-1">
                                                    <button
                                                        onClick={() => handleMoveUp(question, sectionQuestions, index)}
                                                        disabled={isFirst}
                                                        className={`p-1.5 rounded-lg transition-colors ${isFirst
                                                            ? 'text-stone-300 cursor-not-allowed'
                                                            : 'text-stone-400 hover:text-indigo-600 hover:bg-indigo-50'
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
                                                        className={`p-1.5 rounded-lg transition-colors ${isLast
                                                            ? 'text-stone-300 cursor-not-allowed'
                                                            : 'text-stone-400 hover:text-indigo-600 hover:bg-indigo-50'
                                                            }`}
                                                        title="Move down"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Question Number Badge */}
                                                <Badge variant="default" size="sm" className="mt-1 !px-2.5 !py-1 font-semibold">
                                                    {index + 1}
                                                </Badge>

                                                {/* Question Content */}
                                                <div className="flex-1 min-w-0">
                                                    {isEditing ? (
                                                        // Edit Mode
                                                        <div className="space-y-3">
                                                            <textarea
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                                                rows="3"
                                                                disabled={isSaving}
                                                            />
                                                            {editError && (
                                                                <p className="text-sm text-red-600">{editError}</p>
                                                            )}
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="primary"
                                                                    onClick={() => handleSave(question.id)}
                                                                    disabled={isSaving}
                                                                    loading={isSaving}
                                                                >
                                                                    {isSaving ? 'Saving...' : 'Save'}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={handleCancel}
                                                                    disabled={isSaving}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Normal View
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4">
                                                                <p className="text-stone-800 leading-relaxed">{question.text}</p>

                                                                {/* Action Buttons */}
                                                                <div className="flex-shrink-0 flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => handleEdit(question)}
                                                                        className="p-2 text-stone-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(question.id, question.text)}
                                                                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Flags Section */}
                                                            {hasFlags && (
                                                                <div className="mt-4">
                                                                    <button
                                                                        onClick={() => toggleFlags(question.id)}
                                                                        className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium mb-2"
                                                                    >
                                                                        <svg className={`w-4 h-4 transition-transform ${isFlagsExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                        {question.flags.length} {question.flags.length === 1 ? 'Issue' : 'Issues'} Found
                                                                    </button>

                                                                    {isFlagsExpanded && (
                                                                        <div className="space-y-3 animate-fade-in">
                                                                            {question.flags.map((flag, idx) => {
                                                                                const styles = getSeverityStyles(flag.severity)
                                                                                return (
                                                                                    <div key={idx} className={`${styles.bg} ${styles.border} border rounded-xl p-4`}>
                                                                                        {/* Flag Header */}
                                                                                        <div className="flex items-center gap-2 mb-3">
                                                                                            <Badge variant={flag.type === 'bias' ? 'warning' : 'info'} size="sm">
                                                                                                {flag.type === 'bias' ? 'Bias' : 'Alignment'}
                                                                                            </Badge>
                                                                                            <Badge variant={styles.badge} size="sm">
                                                                                                {flag.severity}
                                                                                            </Badge>
                                                                                        </div>

                                                                                        {/* Explanation */}
                                                                                        <p className={`text-sm ${styles.text} leading-relaxed`}>
                                                                                            {flag.explanation}
                                                                                        </p>

                                                                                        {/* Suggestion */}
                                                                                        {flag.suggestion_rewrite && (
                                                                                            <div className="mt-4">
                                                                                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                                                                                                    Suggested Rewrite
                                                                                                </p>
                                                                                                <div className="bg-white/60 border border-stone-200 rounded-lg p-3 font-mono text-sm text-stone-700">
                                                                                                    "{flag.suggestion_rewrite}"
                                                                                                </div>
                                                                                                <div className="mt-3">
                                                                                                    <Button
                                                                                                        size="sm"
                                                                                                        variant="primary"
                                                                                                        onClick={() => handleApplySuggestion(question.id, flag.suggestion_rewrite)}
                                                                                                    >
                                                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                                        </svg>
                                                                                                        Apply Suggestion
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                            <p className="text-xs text-stone-500 italic">
                                                                                Re-run checks after making edits to see updated results
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Notes */}
                                                            {question.notes && question.notes.length > 0 && (
                                                                <div className="mt-3 space-y-1">
                                                                    {question.notes.map((note, idx) => (
                                                                        <div key={idx} className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                                                                            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                            </svg>
                                                                            {note.content}
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

                                {/* Add Question */}
                                {isAddingHere ? (
                                    <div className="px-4 py-4 bg-stone-50">
                                        <div className="flex items-start gap-4">
                                            <Badge variant="success" size="sm" className="mt-1 !px-2.5 !py-1">+</Badge>
                                            <div className="flex-1 space-y-3">
                                                <textarea
                                                    value={newQuestionText}
                                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                                    rows="3"
                                                    placeholder="Enter new question text..."
                                                    disabled={creatingQuestion}
                                                    autoFocus
                                                />
                                                {addError && (
                                                    <p className="text-sm text-red-600">{addError}</p>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleSaveNew(section)}
                                                        disabled={creatingQuestion}
                                                        loading={creatingQuestion}
                                                    >
                                                        {creatingQuestion ? 'Creating...' : 'Save Question'}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={handleCancelAdd}
                                                        disabled={creatingQuestion}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-4 py-3">
                                        <button
                                            onClick={() => handleAddQuestion(section)}
                                            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Add Question
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
