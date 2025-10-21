import api from './api'; // Import the configured axios instance

/**
 * Logs in a user using either email or a phone number.
 * @param {string} identifier - The user's email or phone number.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The response data from the API, including tokens and user object.
 */
export const login = async (identifier, password) => {
    // Determine if the identifier is an email or a phone number
    const payload = { password };
    if (identifier.includes('@')) {
        payload.email = identifier;
    } else {
        payload.phone_number = identifier;
    }

    // The endpoint path comes from your auth_service/users/urls.py
    const response = await api.post('/login/', payload);
    return response.data;
};

/**
 * Requests a password reset link to be sent to the user's email.
 * @param {string} email - The user's email address.
 * @returns {Promise<object>} - The confirmation message from the API.
 */
export const requestPasswordReset = async (email) => {
    const response = await api.post('/password/request-reset/', { email });
    return response.data;
};

/**
 * Submits the new password along with the UID and token from the reset link.
 * @param {string} uid - The user's base64 encoded ID from the URL.
 * @param {string} token - The password reset token from the URL.
 * @param {string} password - The new password.
 * @returns {Promise<object>} - The success message from the API.
 */
export const confirmPasswordReset = async (uid, token, password) => {
    const response = await api.post('/password/reset/confirm/', { uid, token, password });
    return response.data;
};

// TODO Add functions for logout, etc.