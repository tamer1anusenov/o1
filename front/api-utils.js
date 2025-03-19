// Base API URL - change this to match your deployment
const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function to get auth header from stored token
function getAuthHeader() {
    const tokenType = localStorage.getItem('token_type');
    const accessToken = localStorage.getItem('access_token');
    
    if (tokenType && accessToken) {
        return { 'Authorization': `${tokenType} ${accessToken}` };
    }
    return {};
}

// Generic fetch wrapper with authentication
async function fetchWithAuth(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Merge headers with auth headers
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Handle 401 Unauthorized (token expired)
        if (response.status === 401) {
            // Clear stored tokens
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_role');
            
            // Redirect to login
            window.location.href = 'login.html';
            throw new Error('Session expired. Please login again.');
        }
        
        // Handle other errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'API request failed');
        }
        
        // Return JSON response or empty object for 204 No Content
        return response.status === 204 ? {} : await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Common API functions
const api = {
    // User profile methods
    getUserProfile: async (userId) => {
        return await fetchWithAuth(`/users/${userId}`);
    },
    
    updateUserProfile: async (userId, userData) => {
        return await fetchWithAuth(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },
    
    // For doctor-specific functionality
    getDoctorAppointments: async (doctorId) => {
        return await fetchWithAuth(`/doctors/${doctorId}/appointments`);
    },
    
    updateAppointmentStatus: async (appointmentId, status) => {
        return await fetchWithAuth(`/appointments/${appointmentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },
    
    // For patient-specific functionality
    bookAppointment: async (appointmentData) => {
        return await fetchWithAuth('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
    },
    
    getPatientAppointments: async (patientId) => {
        return await fetchWithAuth(`/patients/${patientId}/appointments`);
    },
    
    // Get all doctors for appointment booking
    getAllDoctors: async () => {
        return await fetchWithAuth('/doctors');
    }
};

// Export the API object for use in other scripts
window.healthcareApi = api;
