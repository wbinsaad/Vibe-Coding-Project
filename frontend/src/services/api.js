// API Service for Interview Companion Tool
// Handles all backend API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Generate a new interview script
 * @param {Object} payload - Script generation parameters
 * @param {string} payload.research_goal - Research objective
 * @param {string} payload.target_users - Target user group
 * @param {number} payload.duration_minutes - Interview duration
 * @param {string} payload.interview_type - 'structured' or 'semi-structured'
 * @returns {Promise<Object>} Generated script with questions
 */
export async function generateScript(payload) {
    const response = await fetch(`${API_BASE_URL}/api/scripts/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to generate script');
    }

    return data;
}

/**
 * Get a script by ID
 * @param {number|string} scriptId - Script ID
 * @returns {Promise<Object>} Script with questions, flags, and notes
 */
export async function getScript(scriptId) {
    const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch script');
    }

    return data;
}

/**
 * Update a question's text
 * @param {number|string} questionId - Question ID
 * @param {Object} payload - Update payload
 * @param {string} payload.text - New question text
 * @returns {Promise<Object>} Updated question
 */
export async function updateQuestion(questionId, payload) {
    const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update question');
    }

    return data;
}

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
}
