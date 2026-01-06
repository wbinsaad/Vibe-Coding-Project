import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { generateScript } from '../services/api'

export default function Create() {
    const navigate = useNavigate()

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
            navigate(`/script/${result.script_id}`)
        } catch (error) {
            setApiError(error.message || 'An error occurred while generating the script')
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

            {/* Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Research Goal */}
                    <div>
                        <label htmlFor="research_goal" className="block text-sm font-medium text-gray-700 mb-2">
                            Research Goal <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="research_goal"
                            name="research_goal"
                            rows="3"
                            value={formData.research_goal}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.research_goal ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g., Understand user pain points with mobile banking"
                        />
                        {errors.research_goal && (
                            <p className="mt-1 text-sm text-red-600">{errors.research_goal}</p>
                        )}
                    </div>

                    {/* Target Users */}
                    <div>
                        <label htmlFor="target_users" className="block text-sm font-medium text-gray-700 mb-2">
                            Target Users <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="target_users"
                            name="target_users"
                            value={formData.target_users}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.target_users ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="e.g., Mobile banking app users aged 25-45"
                        />
                        {errors.target_users && (
                            <p className="mt-1 text-sm text-red-600">{errors.target_users}</p>
                        )}
                    </div>

                    {/* Duration and Interview Type Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Duration */}
                        <div>
                            <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="duration_minutes"
                                name="duration_minutes"
                                min="1"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.duration_minutes && (
                                <p className="mt-1 text-sm text-red-600">{errors.duration_minutes}</p>
                            )}
                        </div>

                        {/* Interview Type */}
                        <div>
                            <label htmlFor="interview_type" className="block text-sm font-medium text-gray-700 mb-2">
                                Interview Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="interview_type"
                                name="interview_type"
                                value={formData.interview_type}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.interview_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="structured">Structured</option>
                                <option value="semi-structured">Semi-Structured</option>
                            </select>
                            {errors.interview_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.interview_type}</p>
                            )}
                        </div>
                    </div>

                    {/* API Error Message */}
                    {apiError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${isFormValid && !isSubmitting
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Script...
                                </span>
                            ) : (
                                'Generate Interview Script'
                            )}
                        </button>
                        <Link
                            to="/"
                            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
