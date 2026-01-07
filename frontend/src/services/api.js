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
 * Create a new question
 * @param {Object} payload - Question data
 * @param {number} payload.script_id - Script ID
 * @param {string} payload.section - Section (intro, warmup, main, closing)
 * @param {string} payload.text - Question text
 * @param {number} [payload.order_index] - Optional order index
 * @returns {Promise<Object>} Created question
 */
export async function createQuestion(payload) {
    const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create question');
    }

    return data;
}

/**
 * Delete a question
 * @param {number|string} questionId - Question ID
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteQuestion(questionId) {
    const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to delete question');
    }

    return data;
}

/**
 * Reorder questions in a script
 * @param {number|string} scriptId - Script ID
 * @param {Object} payload - Reorder payload
 * @param {Array} payload.question_order - Array of {question_id, order_index}
 * @returns {Promise<Object>} Reorder confirmation
 */
export async function reorderQuestions(scriptId, payload) {
    const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}/reorder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to reorder questions');
    }

    return data;
}

/**
 * Run quality checks on a script
 * @param {number|string} scriptId - Script ID
 * @returns {Promise<Object>} Checks result with flags
 */
export async function runChecks(scriptId) {
    const response = await fetch(`${API_BASE_URL}/api/scripts/${scriptId}/checks`, {
        method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to run quality checks');
    }

    return data;
}

/**
 * Clear all flags for a question
 * @param {number|string} questionId - Question ID
 * @returns {Promise<Object>} Clear flags confirmation
 */
export async function clearFlags(questionId) {
    const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/flags`, {
        method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to clear flags');
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
