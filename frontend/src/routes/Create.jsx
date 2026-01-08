import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { generateScript } from '../services/api'
import { useToast } from '../components/Toast'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'

export default function Create() {
    const navigate = useNavigate()
    const toast = useToast()

    // Form state
    const [formData, setFormData] = useState({
        research_goal: '',
        target_users: '',
        duration_minutes: 30,
        interview_type: 'semi-structured'
    })

    // UI state
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [apiError, setApiError] = useState('')

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // Validate form
    const validate = () => {
        const newErrors = {}

        if (!formData.research_goal.trim()) {
            newErrors.research_goal = 'Research goal is required'
        }

        if (!formData.target_users.trim()) {
            newErrors.target_users = 'Target users is required'
        }

        if (!formData.duration_minutes || formData.duration_minutes <= 0) {
            newErrors.duration_minutes = 'Duration must be greater than 0'
        }

        if (!formData.interview_type) {
            newErrors.interview_type = 'Interview type is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setApiError('')

        // Validate
        if (!validate()) {
            return
        }

        setIsSubmitting(true)

        try {
            // Call API
            const result = await generateScript({
                ...formData,
                duration_minutes: parseInt(formData.duration_minutes)
            })

            // Navigate to script editor on success
            toast.success('Script generated successfully!')
            navigate(`/script/${result.script_id}`)
        } catch (error) {
            const errorMsg = error.message || 'An error occurred while generating the script'
            setApiError(errorMsg)
            toast.error(errorMsg)
            setIsSubmitting(false)
        }
    }

    // Check if form is valid for submit button
    const isFormValid = formData.research_goal.trim() &&
        formData.target_users.trim() &&
        formData.duration_minutes > 0 &&
        formData.interview_type

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors group"
                >
                    <svg
                        className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
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
                <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
                    Create Interview Script
                </h2>
                <p className="mt-2 text-stone-600">
                    Generate a structured interview script based on your research goals
                </p>
            </div>

            {/* Form Card */}
            <Card padding="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Research Goal */}
                    <Textarea
                        label="Research Goal"
                        name="research_goal"
                        value={formData.research_goal}
                        onChange={handleChange}
                        placeholder="e.g., Understand user pain points with mobile banking"
                        rows={3}
                        required
                        error={errors.research_goal}
                    />

                    {/* Target Users */}
                    <Input
                        label="Target Users"
                        name="target_users"
                        value={formData.target_users}
                        onChange={handleChange}
                        placeholder="e.g., Mobile banking app users aged 25-45"
                        required
                        error={errors.target_users}
                    />

                    {/* Duration and Interview Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Duration */}
                        <Input
                            label="Duration (minutes)"
                            name="duration_minutes"
                            type="number"
                            min="1"
                            value={formData.duration_minutes}
                            onChange={handleChange}
                            required
                            error={errors.duration_minutes}
                        />

                        {/* Interview Type */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="interview_type"
                                className="block text-sm font-medium text-stone-700"
                            >
                                Interview Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="interview_type"
                                name="interview_type"
                                value={formData.interview_type}
                                onChange={handleChange}
                                className={`
                                    w-full px-4 py-2.5 bg-white border rounded-xl
                                    text-stone-900 text-sm
                                    transition-all duration-150
                                    focus:outline-none focus:ring-2 focus:ring-offset-0
                                    ${errors.interview_type
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-stone-200 hover:border-stone-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                    }
                                `}
                            >
                                <option value="structured">Structured</option>
                                <option value="semi-structured">Semi-Structured</option>
                            </select>
                            {errors.interview_type && (
                                <p className="text-sm text-red-600 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.interview_type}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* API Error Message */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <p className="mt-1 text-sm text-red-700">{apiError}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={!isFormValid}
                            loading={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Generating Script...' : 'Generate Interview Script'}
                        </Button>
                        <Link to="/">
                            <Button
                                type="button"
                                variant="secondary"
                                size="lg"
                            >
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    )
}
