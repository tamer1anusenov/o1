document.addEventListener('DOMContentLoaded', function() {
    // Check if the login form exists on current page
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        
        // Call login function
        loginUser(formData);
    });
});

// Function to login user via API
function loginUser(loginData) {
    const apiUrl = 'http://127.0.0.1:8000/login';
    
    // Create form-encoded data for token endpoint
    const formBody = new URLSearchParams();
    formBody.append('username', loginData.username);
    formBody.append('password', loginData.password);
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        return response.json();
    })
    .then(data => {
        // Store token in local storage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('user_role', data.role);
        
        // Redirect based on role
        if (data.role === 'doctor') {
            window.location.href = 'doctor-dashboard.html';
        } else {
            window.location.href = 'patient-dashboard.html';
        }
    })
    .catch(error => {
        // Show error message
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = 'Invalid username or password';
            errorElement.style.display = 'block';
        } else {
            alert('Login failed: Invalid username or password');
        }
        console.error('Error:', error);
    });
}
