// Mock user database
const users = {
    // Engineers
    'e123': {
        id: 'e123',
        name: 'John Smith',
        email: 'john.smith@banktech.com',
        password: 'password123',
        role: 'engineer',
        group: 'Network Infrastructure',
        status: 'active'
    },
    'e124': {
        id: 'e124',
        name: 'Mike Johnson',
        email: 'mike.johnson@banktech.com',
        password: 'password123',
        role: 'engineer',
        group: 'Network Infrastructure',
        status: 'active'
    },
    'e125': {
        id: 'e125',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@banktech.com',
        password: 'password123',
        role: 'engineer',
        group: 'Application Support',
        status: 'active'
    },
    'e126': {
        id: 'e126',
        name: 'David Brown',
        email: 'david.brown@banktech.com',
        password: 'password123',
        role: 'engineer',
        group: 'Security Team',
        status: 'active'
    },
    'e127': {
        id: 'e127',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@banktech.com',
        password: 'password123',
        role: 'engineer',
        group: 'Security Team',
        status: 'active'
    },
    // Sample user
    'z123': {
        id: 'z123',
        name: 'Demo User',
        email: 'demo.user@example.com',
        password: 'password123',
        role: 'user',
        department: 'Retail Banking',
        status: 'active'
    }
};

// DOM elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerModal = document.getElementById('registerModal');
const otpSection = document.getElementById('otpSection');
const loginBtn = document.getElementById('loginBtn');

// Global variables
let currentLoginAttempt = null;
const DUMMY_OTP = '123456';

// Event listeners
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const loginId = document.getElementById('loginId').value.trim();
    const password = document.getElementById('password').value;
    const otp = document.getElementById('otp').value;

    if (!currentLoginAttempt) {
        // First step - validate credentials
        if (validateCredentials(loginId, password)) {
            currentLoginAttempt = { loginId, password };
            
            if (loginId.startsWith('z')) {
                // User - show OTP section
                showOTPSection();
                showNotification('OTP sent to your registered email address', 'success');
            } else if (loginId.startsWith('e')) {
                // Engineer - show authenticator notification
                showAuthenticatorNotification();
                showNotification('Please check your authenticator app', 'info');
            }
        } else {
            showNotification('Invalid login credentials', 'error');
        }
    } else {
        // Second step - verify OTP/authenticator
        if (currentLoginAttempt.loginId.startsWith('z')) {
            // Verify user OTP
            if (otp === DUMMY_OTP) {
                completeLogin(currentLoginAttempt.loginId);
            } else {
                showNotification('Invalid OTP. Please try again.', 'error');
            }
        } else {
            // Simulate authenticator verification for engineers
            completeLogin(currentLoginAttempt.loginId);
        }
    }
}

// Validate credentials
function validateCredentials(loginId, password) {
    const user = users[loginId];
    return user && user.password === password && user.status === 'active';
}

// Show OTP section
function showOTPSection() {
    otpSection.style.display = 'block';
    loginBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify OTP';
    document.getElementById('otp').focus();
}

// Show authenticator notification
function showAuthenticatorNotification() {
    loginBtn.innerHTML = '<i class="fas fa-mobile-alt"></i> Authenticating...';
    loginBtn.disabled = true;
    
    // Simulate authenticator delay
    setTimeout(() => {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-check"></i> Complete Login';
    }, 2000);
}

// Complete login process
function completeLogin(loginId) {
    const user = users[loginId];
    
    // Store user session
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    // Show success message
    showNotification('Login successful! Redirecting...', 'success');
    
    // Add loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Redirect based on user role
    setTimeout(() => {
        if (user.role === 'engineer') {
            window.location.href = 'engineer-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }, 1500);
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        department: document.getElementById('department').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validate form data
    if (!validateRegistrationData(formData)) {
        return;
    }
    
    // Generate user ID
    const userId = 'z' + Math.random().toString(36).substr(2, 6);
    
    // Create user object
    const newUser = {
        id: userId,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        password: formData.password,
        role: 'user',
        status: 'active'
    };
    
    // Add to users database
    users[userId] = newUser;
    
    // Show success message
    showNotification(`Registration successful! Your login ID is: ${userId}`, 'success');
    
    // Hide modal after delay
    setTimeout(() => {
        hideRegister();
        // Pre-fill login form
        document.getElementById('loginId').value = userId;
        document.getElementById('password').focus();
    }, 2000);
}

// Validate registration data
function validateRegistrationData(data) {
    if (data.password !== data.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return false;
    }
    
    if (data.password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return false;
    }
    
    // Check if email already exists
    const existingUser = Object.values(users).find(user => user.email === data.email);
    if (existingUser) {
        showNotification('Email address already registered', 'error');
        return false;
    }
    
    return true;
}

// Show/hide registration modal
function showRegister() {
    registerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideRegister() {
    registerModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    registerForm.reset();
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Helper functions for notifications
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
}

// Add CSS animations
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
`;
document.head.appendChild(styles);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === registerModal) {
        hideRegister();
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        if (user.role === 'engineer') {
            window.location.href = 'engineer-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }
});